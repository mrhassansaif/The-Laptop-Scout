import {
  type Auth,
  type User,
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { getFirebaseApp } from "./config";
import { isFirebaseConfigured } from "./env";

let auth: Auth | undefined;
let sessionPersistenceReady: Promise<void> | undefined;

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars in .env.local.",
    );
  }

  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }

  return auth;
}

/**
 * Switch Auth to tab-scoped session persistence (and migrate any prior
 * localPersistence session into sessionStorage for this tab).
 * Safe to call repeatedly; the first call's promise is reused.
 */
function ensureSessionPersistence(): Promise<void> {
  if (!sessionPersistenceReady) {
    sessionPersistenceReady = setPersistence(
      getFirebaseAuth(),
      browserSessionPersistence,
    )
      .then(() => undefined)
      .catch((error) => {
        sessionPersistenceReady = undefined;
        throw error;
      });
  }

  return sessionPersistenceReady;
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  const authInstance = getFirebaseAuth();
  let unsubscribed = false;
  let unsubscribeFromAuth = () => {};

  // Await persistence before listening so existing local sessions migrate
  // (or clear from shared storage) before the first auth-state callback.
  // If persistence fails, still subscribe so loading cannot hang forever.
  void ensureSessionPersistence()
    .catch(() => undefined)
    .then(() => {
      if (unsubscribed) {
        return;
      }

      unsubscribeFromAuth = onAuthStateChanged(authInstance, callback);
    });

  return () => {
    unsubscribed = true;
    unsubscribeFromAuth();
  };
}

export async function signInWithEmail(email: string, password: string) {
  const authInstance = getFirebaseAuth();
  await ensureSessionPersistence();
  return signInWithEmailAndPassword(authInstance, email, password);
}

export async function signOutUser() {
  return signOut(getFirebaseAuth());
}
