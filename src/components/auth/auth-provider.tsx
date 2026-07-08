"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  missingEnvVars: FirebaseEnvKey[];
  connection: FirebaseConnectionStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const missingEnvVars = useMemo(() => getMissingFirebaseEnvVars(), []);
  const configured = missingEnvVars.length === 0;

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
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      missingEnvVars,
      connection,
      signIn,
      signOut,
    }),
    [user, loading, configured, missingEnvVars, connection, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
