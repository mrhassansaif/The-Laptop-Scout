"use client";

import { WifiOff } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function SessionUnverified() {
  const { unverifiedReason, retrySessionCheck, signOut } = useAuth();
  const offline = unverifiedReason !== "unknown";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card px-5 py-5 text-sm shadow-sm">
        <div className="flex items-start gap-3">
          <WifiOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              {offline ? "Can't verify this session" : "Session check failed"}
            </p>
            <p className="leading-6 text-muted-foreground">
              {offline
                ? "This device is offline, so it cannot receive a force logout until the connection returns. Protected laptop data stays locked. A session that was already ended cannot be used again after you reconnect."
                : "The app could not verify this session. Protected laptop data stays locked until verification succeeds."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void signOut();
            }}
          >
            Sign out
          </Button>
          <Button type="button" onClick={retrySessionCheck}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
