import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";

import {
  assertFirebaseConfigured,
  type FirebaseClientConfig,
} from "./env";

export {
  FIREBASE_ENV_KEYS,
  getFirebaseConfig,
  getFirebaseEnvValues,
  getMissingFirebaseEnvVars,
  isFirebaseConfigured,
  type FirebaseClientConfig,
  type FirebaseEnvKey,
} from "./env";
export { verifyFirebaseConnection, type FirebaseConnectionStatus } from "./verify";

let firebaseApp: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (getApps().length > 0) {
    firebaseApp = getApp();
    return firebaseApp;
  }

  const config: FirebaseClientConfig = assertFirebaseConfigured();
  firebaseApp = initializeApp(config);
  return firebaseApp;
}
