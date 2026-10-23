"use client";

import { useState } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { LaptopsProvider } from "@/providers/laptops-provider";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AuthGuard>
      <LaptopsProvider>
        <div className="relative min-h-dvh bg-background">
          <div
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklch,var(--brand)_12%,transparent),transparent)]"
            aria-hidden
          />
          <div className="relative flex min-h-dvh">
            <div className="hidden md:block">
              <AppSidebar
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
              />
            </div>
            <div
              className={cn(
                "flex min-h-dvh min-w-0 flex-1 flex-col transition-[padding] duration-300",
                sidebarCollapsed ? "md:pl-[6.5rem]" : "md:pl-72",
              )}
            >
              <main className="flex-1">{children}</main>
            </div>
          </div>
          <MobileBottomNav />
        </div>
      </LaptopsProvider>
    </AuthGuard>
  );
}
