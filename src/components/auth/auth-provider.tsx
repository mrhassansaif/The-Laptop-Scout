"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "firebase/auth";

import {
  getMissingFirebaseEnvVars,
  type FirebaseEnvKey,
} from "@/lib/firebase/env";
import {
  verifyFirebaseConnection,
  type FirebaseConnectionStatus,
} from "@/lib/firebase/verify";
import {
  signInWithEmail,
  signOutUser,
  subscribeToAuthState,
} from "@/lib/firebase/auth";
import { clearAllPrankLoginSessions } from "@/lib/prank/session";
import {
  clearSessionNotice,
  getServerSessionNotice,
  readSessionNotice,
  rememberSessionNotice,
  subscribeToSessionNotice,
} from "@/lib/session/notice";
import { isAuthTimeRevoked, SESSION_REVOKED_NOTICE } from "@/lib/session/revocation";
import {
  subscribeSessionControl,
  verifyCurrentSession,
} from "@/lib/session/session-control";

type AccessState = "loading" | "signed-out" | "granted" | "unverified";
type UnverifiedReason = "offline" | "unknown";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  access: AccessState;
  unverifiedReason: UnverifiedReason | null;
  sessionNotice: string | null;
  configured: boolean;
  missingEnvVars: FirebaseEnvKey[];
  connection: FirebaseConnectionStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  retrySessionCheck: () => void;
  endSessionLocally: (notice: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const missingEnvVars = useMemo(() => getMissingFirebaseEnvVars(), []);
  const configured = missingEnvVars.length === 0;
  const router = useRouter();
  const pathname = usePathname();

  const connection = useMemo((): FirebaseConnectionStatus => {
    if (!configured) {
      return {
        configured: false,
        missingEnvVars,
        appInitialized: false,
        authConnected: false,
        firestoreConnected: false,
      };
    }

    return verifyFirebaseConnection();
  }, [configured, missingEnvVars]);

  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessState>(
    configured ? "loading" : "signed-out",
  );
  const [unverifiedReason, setUnverifiedReason] = useState<UnverifiedReason | null>(
    null,
  );
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const storedNotice = useSyncExternalStore(
    subscribeToSessionNotice,
    readSessionNotice,
    getServerSessionNotice,
  );
  const visibleNotice = sessionNotice ?? storedNotice;

  const accessRef = useRef(access);
  const userRef = useRef<User | null>(null);
  const pathnameRef = useRef(pathname);
  const controlUnsubRef = useRef<(() => void) | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const revokingRef = useRef(false);

  const stopControlListener = useCallback(() => {
    controlUnsubRef.current?.();
    controlUnsubRef.current = null;

    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const endSessionLocally = useCallback(
    (notice: string) => {
      if (revokingRef.current) {
        return;
      }

      revokingRef.current = true;
      generationRef.current += 1;
      stopControlListener();
      clearAllPrankLoginSessions();
      rememberSessionNotice(notice);
      setSessionNotice(notice);
      setUnverifiedReason(null);
      setUser(null);
      userRef.current = null;
      setAccess("signed-out");

      if (pathnameRef.current !== "/") {
        router.replace("/");
      }

      void signOutUser()
        .catch(() => undefined)
        .finally(() => {
          revokingRef.current = false;
        });
    },
    [router, stopControlListener],
  );

  const signOut = useCallback(async () => {
    generationRef.current += 1;
    stopControlListener();
    clearAllPrankLoginSessions();
    clearSessionNotice();
    setSessionNotice(null);
    setUnverifiedReason(null);
    await signOutUser();
    setUser(null);
    userRef.current = null;
    setAccess("signed-out");
  }, [stopControlListener]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const retrySessionCheck = useCallback(() => {
    setRetryNonce((nonce) => nonce + 1);
  }, []);

  useEffect(() => {
    accessRef.current = access;
  }, [access]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (access !== "unverified") {
      return;
    }

    const onOnline = () => {
      setRetryNonce((nonce) => nonce + 1);
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [access]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const unsubscribe = subscribeToAuthState((nextUser) => {
      if (revokingRef.current && nextUser) {
        return;
      }

      if (!nextUser) {
        stopControlListener();
        if (!revokingRef.current) {
          clearAllPrankLoginSessions();
        }
        setUser(null);
        userRef.current = null;
        setUnverifiedReason(null);
        setAccess("signed-out");
        return;
      }

      if (
        userRef.current?.uid === nextUser.uid &&
        accessRef.current === "granted" &&
        controlUnsubRef.current
      ) {
        setUser(nextUser);
        userRef.current = nextUser;
        return;
      }

      const generation = ++generationRef.current;
      stopControlListener();

      if (!(userRef.current?.uid === nextUser.uid && accessRef.current === "granted")) {
        setAccess("loading");
      }

      void (async () => {
        const verdict = await verifyCurrentSession(nextUser);
        if (generationRef.current !== generation || revokingRef.current) {
          return;
        }

        if (verdict.status === "revoked") {
          endSessionLocally(SESSION_REVOKED_NOTICE);
          return;
        }

        if (verdict.status === "unverified") {
          setUser(nextUser);
          userRef.current = nextUser;
          setUnverifiedReason(verdict.reason);
          setAccess("unverified");
          return;
        }

        const authTime = verdict.authTime;
        setUser(nextUser);
        userRef.current = nextUser;
        setUnverifiedReason(null);
        clearSessionNotice();
        setSessionNotice(null);
        setAccess("granted");

        const watchCutoff = () => {
          if (generationRef.current !== generation) {
            return;
          }

          stopControlListener();
          controlUnsubRef.current = subscribeSessionControl(
            (control) => {
              if (generationRef.current !== generation) {
                return;
              }

              if (isAuthTimeRevoked(authTime, control?.authTimeCutoff ?? null)) {
                endSessionLocally(SESSION_REVOKED_NOTICE);
              }
            },
            (error) => {
              if (generationRef.current !== generation) {
                return;
              }

              // Rules may not be published yet. Retry instead of signing
              // every valid user out. A denied laptop read still ends the session.
              if (error.code !== "permission-denied") {
                return;
              }

              retryTimerRef.current = window.setTimeout(() => {
                retryTimerRef.current = null;
                watchCutoff();
              }, 15000);
            },
          );
        };

        watchCutoff();
      })();
    });

    return () => {
      generationRef.current += 1;
      stopControlListener();
      unsubscribe();
    };
  }, [configured, endSessionLocally, retryNonce, stopControlListener]);

  const value = useMemo(
    () => ({
      user,
      loading: access === "loading",
      access,
      unverifiedReason,
      sessionNotice: visibleNotice,
      configured,
      missingEnvVars,
      connection,
      signIn,
      signOut,
      retrySessionCheck,
      endSessionLocally,
    }),
    [
      user,
      access,
      unverifiedReason,
      visibleNotice,
      configured,
      missingEnvVars,
      connection,
      signIn,
      signOut,
      retrySessionCheck,
      endSessionLocally,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
