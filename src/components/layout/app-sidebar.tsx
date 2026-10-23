"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Laptop, LogOut, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";

import { ForceLogoutButton } from "@/components/admin/force-logout-button";
import { useAuth } from "@/components/auth/auth-provider";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({
  collapsed = false,
  onCollapsedChange,
  onNavigate,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-3 top-3 z-40 flex flex-col rounded-2xl border border-sidebar-border/70 bg-sidebar/90 text-sidebar-foreground shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-[width] duration-300",
        collapsed ? "bottom-3 w-[4.5rem]" : "bottom-3 w-64",
        className,
      )}
    >
      <div className={cn("px-3 pb-3 pt-4", collapsed && "px-2")}>
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent/60",
              collapsed && "justify-center px-0",
            )}
            onClick={onNavigate}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-[0_4px_14px_color-mix(in_oklch,var(--brand)_35%,transparent)]">
              <Laptop className="size-4" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-none tracking-[-0.02em]">
                  LaptopScout
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  Field intelligence
                </p>
              </div>
            ) : null}
          </Link>
          {!collapsed && onCollapsedChange ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
              onClick={() => onCollapsedChange(true)}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          ) : null}
        </div>
        {collapsed && onCollapsedChange ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="mx-auto mt-2 text-muted-foreground"
            onClick={() => onCollapsedChange(false)}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="size-4" />
          </Button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="mx-3 mb-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/35 px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            Buyer workspace
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            Track laptops, visits, and inspection notes in one shared list.
          </p>
        </div>
      ) : null}

      <nav className={cn("flex-1 space-y-1 px-2", collapsed && "px-1.5")}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              {isActive ? (
                <span className="absolute left-1 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
              ) : null}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200",
                  isActive && "scale-110 text-brand",
                )}
              />
              {!collapsed ? <span className="truncate">{label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border/60 p-2">
        <div className={cn("mb-1 flex items-center gap-1", collapsed && "justify-center")}>
          <ThemeToggle />
          {!collapsed ? (
            <span className="text-xs text-muted-foreground">Theme</span>
          ) : null}
        </div>
        <ForceLogoutButton variant="sidebar" collapsed={collapsed} />
        <Button
          variant="ghost"
          className={cn(
            "h-10 w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          onClick={() => {
            void signOut().then(() => {
              onNavigate?.();
              router.replace("/");
            });
          }}
        >
          <LogOut className="size-4" />
          {!collapsed ? "Sign out" : null}
        </Button>
      </div>
    </aside>
  );
}
