"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { getFirebaseFirestore } from "@/lib/firebase/firestore";
import { ADMIN_COLLECTION, isAdminRole } from "@/lib/session/revocation";

export function useIsAdmin(): boolean {
  const { user, access } = useAuth();
  const uid = access === "granted" ? user?.uid : undefined;
  const [adminUid, setAdminUid] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const adminRef = doc(getFirebaseFirestore(), ADMIN_COLLECTION, uid);

    return onSnapshot(
      adminRef,
      (snapshot) => {
        setAdminUid(isAdminRole(snapshot.data()?.role) ? uid : null);
      },
      () => {
        setAdminUid(null);
      },
    );
  }, [uid]);

  return adminUid !== null && adminUid === uid;
}
