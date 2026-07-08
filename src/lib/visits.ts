import type { LaptopRecord, LaptopVisitGroup } from "@/lib/types";
import {
  formatVisitDateLabelFromKey,
  parseVisitDateKey,
} from "@/lib/visit-dates";

export function groupLaptopsByVisitDate(
  laptops: LaptopRecord[],
): LaptopVisitGroup[] {
  const sorted = [...laptops].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const groups = new Map<string, LaptopVisitGroup>();

  for (const laptop of sorted) {
    const existing = groups.get(laptop.visitDate);

    if (existing) {
      existing.laptops.push(laptop);
      continue;
    }

    groups.set(laptop.visitDate, {
      visitDate: laptop.visitDate,
      label: formatVisitDateLabelFromKey(laptop.visitDate),
      laptops: [laptop],
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    b.visitDate.localeCompare(a.visitDate),
  );
}

export function filterLaptopsByVisitDate(
  laptops: LaptopRecord[],
  visitDate: string,
): LaptopRecord[] {
  return laptops
    .filter((laptop) => laptop.visitDate === visitDate)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getVisitDateCount(laptops: LaptopRecord[], visitDate: string) {
  return laptops.filter((laptop) => laptop.visitDate === visitDate).length;
}

export function getTodayVisitDateKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function pickDefaultVisitDate(visitDates: string[]): string | null {
  if (visitDates.length === 0) {
    return null;
  }

  const today = getTodayVisitDateKey();

  if (visitDates.includes(today)) {
    return today;
  }

  return visitDates[0];
}

export function visitDateToSortableDate(visitDate: string): Date {
  return parseVisitDateKey(visitDate);
}
