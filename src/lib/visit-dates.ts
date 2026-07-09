export function toVisitDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseVisitDateKey(visitDate: string): Date {
  const [year, month, day] = visitDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatVisitDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) {
    return "Today";
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatVisitDateLabelFromKey(visitDate: string): string {
  return formatVisitDateLabel(parseVisitDateKey(visitDate));
}

export function getUniqueVisitDates(visitDates: string[]): string[] {
  return Array.from(new Set(visitDates)).sort((a, b) => b.localeCompare(a));
}

export function formatPrice(price?: string): string | null {
  if (!price?.trim()) {
    return null;
  }

  const numeric = Number(price.replace(/[^\d.]/g, ""));

  if (Number.isFinite(numeric) && numeric > 0) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(numeric);
  }

  return price.trim();
}

export function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatVisitDateShort(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatVisitDateShortFromKey(visitDate: string): string {
  return formatVisitDateShort(parseVisitDateKey(visitDate));
}

export function formatVisitFilterLabel(
  visitDate: string,
  laptopCount: number,
): string {
  const countLabel = `${laptopCount} ${laptopCount === 1 ? "laptop" : "laptops"}`;
  return `${formatVisitDateShortFromKey(visitDate)} • ${countLabel}`;
}

export function formatVisitDateTimeLabel(
  visitDate: string,
  createdAt: Date,
): string {
  const dateLabel = formatVisitDateShort(parseVisitDateKey(visitDate));
  const timeLabel = formatTimeLabel(createdAt);
  return `${dateLabel} • ${timeLabel}`;
}

export function formatPriceInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat().format(Number(digits));
}

export function parsePriceInput(value: string): string {
  return value.replace(/\D/g, "");
}
