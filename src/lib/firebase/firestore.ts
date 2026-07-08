import { getFirestore, type Firestore } from "firebase/firestore";

import { getFirebaseApp } from "./config";
import { isFirebaseConfigured } from "./env";

let firestore: Firestore | undefined;

/**
 * Returns the Firestore instance for the configured Firebase app.
 * Requires the same NEXT_PUBLIC_FIREBASE_* env vars as Auth.
 */
export function getFirebaseFirestore(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firestore is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars in .env.local.",
    );
  }

  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }

  return firestore;
}
