import {
  type User,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { getFirebaseApp } from "./config";
import { isFirebaseConfigured } from "./env";

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars in .env.local.",
    );
  }

  return getAuth(getFirebaseApp());
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signOutUser() {
  return signOut(getFirebaseAuth());
}
