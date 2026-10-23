"use client";

import { useRef, useState } from "react";
import { ShieldOff } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { requestForceLogout } from "@/lib/session/force-logout-client";
import { SESSION_REVOKED_NOTICE } from "@/lib/session/revocation";
import { cn } from "@/lib/utils";

type ForceLogoutButtonProps = {
  variant: "icon" | "sidebar";
  collapsed?: boolean;
};

export function ForceLogoutButton({
  variant,
  collapsed = false,
}: ForceLogoutButtonProps) {
  const isAdmin = useIsAdmin();
  const { user, endSessionLocally } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  if (!isAdmin) {
    return null;
  }

  async function confirmLogout() {
    if (pendingRef.current || !user) {
      return;
    }

    pendingRef.current = true;
    setPending(true);
    setError(null);

    try {
      let idToken: string;

      try {
        idToken = await user.getIdToken();
      } catch {
        endSessionLocally(SESSION_REVOKED_NOTICE);
        return;
      }

      const result = await requestForceLogout(idToken);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      endSessionLocally(result.notice);
    } catch {
      setError("Could not end sessions. Try again.");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Force logout all sessions"
          title="Force logout all sessions"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          <ShieldOff className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-10 w-full justify-start gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-0",
          )}
          aria-label="Force logout all sessions"
          title="Force logout all sessions"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          <ShieldOff className="size-4" />
          {!collapsed ? "Force logout all" : null}
        </Button>
      )}

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (pending) {
            return;
          }

          setOpen(next);
          if (!next) {
            setError(null);
          }
        }}
        title="Force logout all sessions?"
        description="Every signed-in LaptopScout user will lose access on every device and browser, including you. Open tabs will return to the sign-in page, and everyone must sign in again."
        confirmLabel="End all sessions"
        pendingLabel="Ending sessions..."
        onConfirm={confirmLogout}
        loading={pending}
        destructive
        alert={error}
      />
    </>
  );
}
