"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Layers3, MapPin } from "lucide-react";

import { LaptopCard } from "@/components/laptops/laptop-card";
import { LaptopDetailDialog } from "@/components/laptops/laptop-detail-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLaptops } from "@/hooks/use-user-laptops";
import type { LaptopRecord } from "@/lib/types";
import {
  filterLaptopsByVisitDate,
  groupLaptopsByVisitDate,
  pickDefaultVisitDate,
} from "@/lib/visits";
import { formatVisitDateLabelFromKey } from "@/lib/visit-dates";
import { cn } from "@/lib/utils";

const ALL_VISITS = "all";

function VisitsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function VisitsView() {
  const { laptops, visitDates, loading, error } = useUserLaptops();
  const [selectedVisitDate, setSelectedVisitDate] = useState<string | null>(
    null,
  );
  const [selectedLaptop, setSelectedLaptop] = useState<LaptopRecord | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const defaultVisitDate = useMemo(
    () => pickDefaultVisitDate(visitDates),
    [visitDates],
  );

  const activeVisitDate = useMemo(() => {
    if (!selectedVisitDate || selectedVisitDate === ALL_VISITS) {
      return null;
    }

    if (visitDates.includes(selectedVisitDate)) {
      return selectedVisitDate;
    }

    return defaultVisitDate;
  }, [defaultVisitDate, selectedVisitDate, visitDates]);

  const visibleLaptops = useMemo(() => {
    if (!activeVisitDate) {
      return laptops;
    }

    return filterLaptopsByVisitDate(laptops, activeVisitDate);
  }, [activeVisitDate, laptops]);

  const visitGroups = useMemo(
    () => groupLaptopsByVisitDate(visibleLaptops),
    [visibleLaptops],
  );

  function handleSelectLaptop(laptop: LaptopRecord) {
    setSelectedLaptop(laptop);
    setDetailOpen(true);
  }

  const filterValue = selectedVisitDate ?? ALL_VISITS;
  const showInitialLoading = loading && laptops.length === 0;

  if (showInitialLoading) {
    return <VisitsSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load visits"
        description={error}
        icon={<MapPin className="size-5" />}
      />
    );
  }

  if (visitDates.length === 0) {
    return (
      <EmptyState
        title="No visits yet"
        description="Add a laptop and it will appear here, grouped by the day you saved it."
        icon={<MapPin className="size-5" />}
      />
    );
  }

  return (
    <>
      <div className="animate-soft-in space-y-5">
        <section className="surface-card overflow-hidden p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Badge variant="outline" className="gap-1.5 border-brand/20">
                  <Layers3 className="size-3 text-brand" />
                  {visibleLaptops.length} entries
                </Badge>
                <div>
                  <h2 className="text-title">Visit timeline</h2>
                  <p className="text-subtitle mt-1">
                    Apple Wallet–style cards, grouped by scouting day.
                  </p>
                </div>
              </div>
              <div className="hidden size-11 items-center justify-center rounded-2xl bg-brand/12 text-brand md:flex">
                <CalendarDays className="size-5" />
              </div>
            </div>

            <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVisitDate(ALL_VISITS)}
                  className={cn(
                    "chip",
                    filterValue === ALL_VISITS ? "chip-active" : "chip-inactive",
                  )}
                >
                  All visits
                </button>
                {visitDates.map((visitDate) => (
                  <button
                    key={visitDate}
                    type="button"
                    onClick={() => setSelectedVisitDate(visitDate)}
                    className={cn(
                      "chip",
                      filterValue === visitDate ? "chip-active" : "chip-inactive",
                    )}
                  >
                    <CalendarDays className="size-3.5 opacity-70" />
                    {formatVisitDateLabelFromKey(visitDate)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {visitGroups.map((group, groupIndex) => (
            <section
              key={group.visitDate}
              className="space-y-3"
              style={{ animationDelay: `${groupIndex * 80}ms` }}
            >
              <div className="sticky top-[53px] z-20 -mx-4 border-y border-border/50 bg-background/80 px-4 py-2.5 backdrop-blur-2xl md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold tracking-[-0.03em] md:text-lg">
                      {group.label}
                    </h3>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {group.laptops.length}{" "}
                      {group.laptops.length === 1 ? "laptop" : "laptops"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {group.visitDate}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.laptops.map((laptop, index) => (
                  <LaptopCard
                    key={laptop.id}
                    laptop={laptop}
                    onSelect={handleSelectLaptop}
                    variantIndex={index + groupIndex}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <LaptopDetailDialog
        laptop={selectedLaptop}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
