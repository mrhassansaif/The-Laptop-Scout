"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Laptop,
  MapPin,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { getLaptopTitle } from "@/components/laptops/laptop-card";
import { DashboardPrank } from "@/components/prank/dashboard-prank";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLaptops } from "@/hooks/use-user-laptops";
import { getTodayVisitDateKey } from "@/lib/visits";
import { formatPrice, formatVisitDateTimeLabel } from "@/lib/visit-dates";
import { cn } from "@/lib/utils";

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-44 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[7.5rem] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}

const statAccents = {
  today: "from-violet-500/20 via-violet-500/5 to-transparent text-violet-600 dark:text-violet-300",
  visits: "from-sky-500/20 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-300",
  entries: "from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-300",
  guide: "from-amber-500/20 via-amber-500/5 to-transparent text-amber-600 dark:text-amber-300",
} as const;

function StatCard({
  title,
  value,
  description,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  accent: keyof typeof statAccents;
}) {
  return (
    <div className="surface-raised group relative overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)]">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-200 group-hover:opacity-100",
          statAccents[accent],
        )}
      />
      <div className="relative space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>
          <div className="flex size-8 items-center justify-center rounded-xl bg-background/80 text-foreground shadow-sm backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <p className="text-[2rem] font-semibold leading-none tracking-[-0.05em] tabular-nums">
          {value}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const { laptops, visitDates, loading } = useUserLaptops();

  const todayKey = getTodayVisitDateKey();
  const todayCount = laptops.filter(
    (laptop) => laptop.visitDate === todayKey,
  ).length;
  const recentLaptops = laptops.slice(0, 5);

  const showInitialLoading = loading && laptops.length === 0;

  if (showInitialLoading) {
    return (
      <>
        <DashboardPrank />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <DashboardPrank />
      <div className="animate-soft-in space-y-5 md:space-y-6">
      <section className="mesh-hero surface-card relative overflow-hidden p-5 md:p-7">
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="gap-1.5 border-brand/25 bg-background/60 backdrop-blur-sm"
            >
              <Sparkles className="size-3 text-brand" />
              Live scouting workspace
            </Badge>
            <div className="space-y-2">
              <h2 className="text-display">Welcome back.</h2>
              <p className="text-subtitle max-w-lg">
                Capture finds in seconds, review visit history, and keep your
                inspection checklist close while you are in the market.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:min-w-80">
            <Button render={<Link href="/laptops/add" />} className="h-11">
              <Plus className="size-4" />
              Add
            </Button>
            <Button
              render={<Link href="/visits" />}
              variant="outline"
              className="h-11 bg-background/60 backdrop-blur-sm"
            >
              Visits
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Today"
          value={todayCount}
          description="Laptops logged in today's visit"
          icon={<Laptop className="size-4" />}
          accent="today"
        />
        <StatCard
          title="Visits"
          value={visitDates.length}
          description="Unique visit days in the shared log"
          icon={<CalendarDays className="size-4" />}
          accent="visits"
        />
        <StatCard
          title="Entries"
          value={laptops.length}
          description="Total laptops currently tracked"
          icon={<MapPin className="size-4" />}
          accent="entries"
        />
        <StatCard
          title="Guide"
          value="Ready"
          description="Buyer checklist available in-app"
          icon={<ClipboardCheck className="size-4" />}
          accent="guide"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <div className="surface-card min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4 md:px-5">
            <div>
              <h3 className="text-title text-lg md:text-xl">Recent laptops</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Latest entries from the shared visit log.
              </p>
            </div>
            <Link
              href="/visits"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-foreground"
            >
              See all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-1.5 p-3 md:p-4">
            {recentLaptops.length > 0 ? (
              recentLaptops.map((laptop, index) => (
                <div
                  key={laptop.id}
                  className="animate-fade-up flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/25 px-3 py-3 transition-all duration-200 hover:border-border hover:bg-muted/45"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
                      <Laptop className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {getLaptopTitle(laptop)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatVisitDateTimeLabel(
                          laptop.visitDate,
                          laptop.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                  {formatPrice(laptop.price) ? (
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatPrice(laptop.price)}
                    </p>
                  ) : (
                    <TrendingUp className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                title="Start scouting"
                description="Add your first laptop with a name and price — it will show up here instantly."
                icon={<Laptop className="size-5" />}
                className="border-0 bg-transparent py-10 shadow-none"
              />
            )}
          </div>
        </div>

        <div className="surface-inset p-4 md:p-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-[-0.03em]">
              Quick actions
            </h3>
            <p className="text-sm text-muted-foreground">
              Keep the field workflow moving.
            </p>
          </div>
          <div className="mt-4 grid gap-2">
            <Button
              render={<Link href="/laptops/add" />}
              variant="outline"
              className="h-12 justify-between bg-card/80"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="size-4" />
                Add laptop
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Button>
            <Button
              render={<Link href="/checklist" />}
              variant="outline"
              className="h-12 justify-between bg-card/80"
            >
              <span className="inline-flex items-center gap-2">
                <ClipboardCheck className="size-4" />
                Open guide
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
