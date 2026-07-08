export {
  getFirebaseApp,
  getFirebaseConfig,
  getFirebaseEnvValues,
  getMissingFirebaseEnvVars,
  isFirebaseConfigured,
  verifyFirebaseConnection,
  FIREBASE_ENV_KEYS,
  type FirebaseClientConfig,
  type FirebaseConnectionStatus,
  type FirebaseEnvKey,
} from "./config";
export {
  getFirebaseAuth,
  signInWithEmail,
  signOutUser,
  subscribeToAuthState,
} from "./auth";
export { getFirebaseFirestore } from "./firestore";
export {
  createLaptop,
  subscribeLaptops,
  extractVisitDates,
} from "../firestore/laptops";
