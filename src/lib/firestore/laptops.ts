import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase/firestore";
import type { CreateLaptopInput, LaptopRecord } from "@/lib/types";
import { toVisitDateKey } from "@/lib/visit-dates";

const LAPTOPS_COLLECTION = "laptops";

/** Stable sort key for docs whose server timestamp is still pending. */
const PENDING_CREATED_AT = new Date("9999-12-31T23:59:59.999Z");

function mapLaptopDoc(
  doc: QueryDocumentSnapshot<DocumentData>,
): LaptopRecord | null {
  const data = doc.data();

  if (!data.visitDate || typeof data.visitDate !== "string") {
    return null;
  }

  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : PENDING_CREATED_AT;

  return {
    id: doc.id,
    userId: typeof data.userId === "string" ? data.userId : undefined,
    laptopName: data.laptopName,
    details: data.details,
    shopNumber: data.shopNumber,
    shopKeeperNumber: data.shopKeeperNumber,
    price: data.price,
    visitDate: data.visitDate,
    createdAt,
  };
}

function sortLaptops(a: LaptopRecord, b: LaptopRecord): number {
  const byCreatedAt = b.createdAt.getTime() - a.createdAt.getTime();

  if (byCreatedAt !== 0) {
    return byCreatedAt;
  }

  return b.id.localeCompare(a.id);
}

function cleanOptionalString(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export async function createLaptop(
  input: CreateLaptopInput,
  options?: { userId?: string },
): Promise<string> {
  const now = new Date();
  const visitDate = toVisitDateKey(now);
  const db = getFirebaseFirestore();

  const payload: Record<string, unknown> = {
    visitDate,
    createdAt: serverTimestamp(),
  };

  if (options?.userId) {
    payload.userId = options.userId;
  }

  const laptopName = cleanOptionalString(input.laptopName);
  const details = cleanOptionalString(input.details);
  const shopNumber = cleanOptionalString(input.shopNumber);
  const shopKeeperNumber = cleanOptionalString(input.shopKeeperNumber);
  const price = cleanOptionalString(input.price);

  if (laptopName) payload.laptopName = laptopName;
  if (details) payload.details = details;
  if (shopNumber) payload.shopNumber = shopNumber;
  if (shopKeeperNumber) payload.shopKeeperNumber = shopKeeperNumber;
  if (price) payload.price = price;

  const docRef = await addDoc(collection(db, LAPTOPS_COLLECTION), payload);
  return docRef.id;
}

/** Shared laptop list for all authenticated users (no userId filter). */
export function subscribeLaptops(
  onData: (laptops: LaptopRecord[]) => void,
  onError?: (error: Error) => void,
) {
  const db = getFirebaseFirestore();
  const laptopsQuery = query(collection(db, LAPTOPS_COLLECTION));

  return onSnapshot(
    laptopsQuery,
    (snapshot) => {
      const laptops = snapshot.docs
        .map(mapLaptopDoc)
        .filter((laptop): laptop is LaptopRecord => laptop !== null)
        .sort(sortLaptops);

      onData(laptops);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function extractVisitDates(laptops: LaptopRecord[]): string[] {
  return Array.from(new Set(laptops.map((laptop) => laptop.visitDate))).sort(
    (a, b) => b.localeCompare(a),
  );
}
