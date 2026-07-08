"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  extractVisitDates,
  subscribeLaptops,
} from "@/lib/firestore/laptops";
import type { LaptopRecord } from "@/lib/types";

type LaptopsContextValue = {
  laptops: LaptopRecord[];
  visitDates: string[];
  loading: boolean;
  error: string | null;
};

const LaptopsContext = createContext<LaptopsContextValue | null>(null);

export function LaptopsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const [laptops, setLaptops] = useState<LaptopRecord[]>([]);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    const unsubscribe = subscribeLaptops(
      (nextLaptops) => {
        if (!active) {
          return;
        }

        setLaptops(nextLaptops);
        setHasSnapshot(true);
        setError(null);
      },
      (subscriptionError) => {
        if (!active) {
          return;
        }

        setError(subscriptionError.message);
        setHasSnapshot(true);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isAuthenticated]);

  const value = useMemo((): LaptopsContextValue => {
    const visibleLaptops = isAuthenticated ? laptops : [];

    return {
      laptops: visibleLaptops,
      visitDates: extractVisitDates(visibleLaptops),
      loading: isAuthenticated && !hasSnapshot,
      error: isAuthenticated ? error : null,
    };
  }, [isAuthenticated, laptops, hasSnapshot, error]);

  return (
    <LaptopsContext.Provider value={value}>{children}</LaptopsContext.Provider>
  );
}

export function useUserLaptops(): LaptopsContextValue {
  const context = useContext(LaptopsContext);

  if (!context) {
    throw new Error("useUserLaptops must be used within a LaptopsProvider");
  }

  return context;
}
