import { getFirebaseAuth } from "./auth";
import { getFirebaseApp } from "./config";
import {
  getMissingFirebaseEnvVars,
  isFirebaseConfigured,
  type FirebaseEnvKey,
} from "./env";
import { getFirebaseFirestore } from "./firestore";

export type FirebaseConnectionStatus = {
  configured: boolean;
  missingEnvVars: FirebaseEnvKey[];
  appInitialized: boolean;
  authConnected: boolean;
  firestoreConnected: boolean;
  error?: string;
};

export function verifyFirebaseConnection(): FirebaseConnectionStatus {
  const missingEnvVars = getMissingFirebaseEnvVars();
  const configured = isFirebaseConfigured();

  if (!configured) {
    return {
      configured: false,
      missingEnvVars,
      appInitialized: false,
      authConnected: false,
      firestoreConnected: false,
    };
  }

  try {
    getFirebaseApp();
    getFirebaseAuth();
    getFirebaseFirestore();

    return {
      configured: true,
      missingEnvVars: [],
      appInitialized: true,
      authConnected: true,
      firestoreConnected: true,
    };
  } catch (error) {
    return {
      configured: true,
      missingEnvVars: [],
      appInitialized: false,
      authConnected: false,
      firestoreConnected: false,
      error: error instanceof Error ? error.message : "Unknown Firebase error",
    };
  }
}
