import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export class FirebaseAdminConfigError extends Error {
  constructor() {
    super("Firebase Admin is not configured.");
    this.name = "FirebaseAdminConfigError";
  }
}

type AdminCredentials = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function normalizePrivateKey(value: string): string {
  const unquoted = value.replace(/^["']|["']$/g, "");
  return unquoted.replace(/\\n/g, "\n");
}

function readFirebaseAdminCredentials(): AdminCredentials | null {
  const projectId = readEnv("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = readEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
  const privateKeyValue = readEnv("FIREBASE_ADMIN_PRIVATE_KEY");

  if (!projectId || !clientEmail || !privateKeyValue) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKeyValue),
  };
}

let adminApp: App | undefined;

export function getFirebaseAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const existing = getApps()[0];
  if (existing) {
    adminApp = existing;
    return existing;
  }

  const credentials = readFirebaseAdminCredentials();
  if (!credentials) {
    throw new FirebaseAdminConfigError();
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: credentials.projectId,
      clientEmail: credentials.clientEmail,
      privateKey: credentials.privateKey,
    }),
  });

  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}
