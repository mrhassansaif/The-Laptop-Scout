"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { SessionUnverified } from "@/components/auth/session-unverified";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { access } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (access === "signed-out") {
      router.replace("/");
    }
  }, [access, router]);

  if (access === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading dashboard
        </div>
      </div>
    );
  }

  if (access === "unverified") {
    return <SessionUnverified />;
  }

  if (access !== "granted") {
    return null;
  }

  return children;
}
