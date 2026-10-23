"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 px-1.5 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl md:hidden dark:shadow-[0_-8px_24px_rgba(0,0,0,0.28)]">
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-xs font-medium transition-colors duration-200",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive ? (
                <span className="absolute inset-x-2 top-1 h-8 rounded-xl bg-accent/15" />
              ) : null}
              <Icon
                className={cn(
                  "relative z-10 size-5 transition-transform duration-200",
                  isActive && "scale-110",
                )}
              />
              <span className="relative z-10 truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
