"use client";

import { CalendarDays } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatVisitDateShortFromKey } from "@/lib/visit-dates";
import { cn } from "@/lib/utils";

export const ALL_VISITS = "all";

type VisitDateFilterProps = {
  visitDates: string[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function VisitDateFilter({
  visitDates,
  value,
  onValueChange,
  className,
}: VisitDateFilterProps) {
  return (
    <div className={cn("w-full", className)}>
      <Label
        htmlFor="visit-date-filter"
        className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        <CalendarDays className="size-3.5" />
        Filter by visit
      </Label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger id="visit-date-filter" className="w-full">
          <SelectValue placeholder="All Visits" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VISITS}>All Visits</SelectItem>
          {visitDates.map((visitDate) => (
            <SelectItem key={visitDate} value={visitDate}>
              {formatVisitDateShortFromKey(visitDate)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
