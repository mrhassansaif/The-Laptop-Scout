"use client";

import { useRouter } from "next/navigation";
import { Laptop, LogOut } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

type MobileHeaderProps = {
  title: string;
};

export function MobileHeader({ title }: MobileHeaderProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/50 bg-background/75 px-4 py-3 backdrop-blur-2xl md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-[0_4px_12px_color-mix(in_oklch,var(--brand)_30%,transparent)]">
          <Laptop className="size-3.5" />
        </div>
        <h1 className="truncate text-base font-semibold tracking-[-0.03em]">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
          aria-label="Sign out"
          onClick={() => {
            void signOut().then(() => router.replace("/"));
          }}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
