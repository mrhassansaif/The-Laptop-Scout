"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { SessionUnverified } from "@/components/auth/session-unverified";

export function LoginPage() {
  const { access } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (access === "granted") {
      router.replace("/dashboard");
    }
  }, [access, router]);

  if (access === "unverified") {
    return <SessionUnverified />;
  }

  if (access === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading workspace
        </div>
      </div>
    );
  }

  if (access === "granted") {
    return null;
  }

  return <LoginForm />;
}
