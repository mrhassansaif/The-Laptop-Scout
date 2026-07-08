import { ChevronRight, Laptop, Store, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { LaptopRecord } from "@/lib/types";
import {
  formatPrice,
  formatVisitDateLabelFromKey,
  formatVisitDateTimeLabel,
} from "@/lib/visit-dates";
import { cn } from "@/lib/utils";

function getLaptopTitle(laptop: LaptopRecord): string {
  return laptop.laptopName?.trim() || laptop.shopNumber?.trim() || "Untitled laptop";
}

const walletTints = [
  "from-violet-500/25 via-transparent to-sky-500/10",
  "from-sky-500/25 via-transparent to-emerald-500/10",
  "from-emerald-500/25 via-transparent to-amber-500/10",
  "from-amber-500/25 via-transparent to-rose-500/10",
  "from-rose-500/25 via-transparent to-violet-500/10",
] as const;

type LaptopCardProps = {
  laptop: LaptopRecord;
  onSelect: (laptop: LaptopRecord) => void;
  className?: string;
  variantIndex?: number;
};

export function LaptopCard({
  laptop,
  onSelect,
  className,
  variantIndex = 0,
}: LaptopCardProps) {
  const title = getLaptopTitle(laptop);
  const price = formatPrice(laptop.price);
  const tint = walletTints[variantIndex % walletTints.length];

  return (
    <button
      type="button"
      onClick={() => onSelect(laptop)}
      className={cn(
        "group w-full rounded-2xl text-left outline-none transition-transform duration-200 focus-visible:ring-4 focus-visible:ring-ring/15 active:scale-[0.98]",
        className,
      )}
    >
      <article className="wallet-card relative overflow-hidden rounded-2xl border border-border/60 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-brand/25 group-hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
            tint,
          )}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="line-clamp-2 text-base font-semibold leading-snug tracking-[-0.03em]">
              {title}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatVisitDateTimeLabel(laptop.visitDate, laptop.createdAt)}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-brand shadow-sm backdrop-blur-sm">
            <Laptop className="size-4" />
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          {price ? (
            <Badge className="gap-1 border-0 bg-brand text-brand-foreground">
              <Tag className="size-3" />
              {price}
            </Badge>
          ) : null}
          {laptop.shopNumber ? (
            <Badge variant="outline" className="gap-1 bg-background/50 backdrop-blur-sm">
              <Store className="size-3" />
              Shop {laptop.shopNumber}
            </Badge>
          ) : null}
        </div>

        {laptop.details ? (
          <p className="relative mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {laptop.details}
          </p>
        ) : (
          <p className="relative mt-4 text-sm text-muted-foreground/75">
            Tap to review the saved details.
          </p>
        )}

        <div className="relative mt-5 flex items-center justify-end border-t border-border/50 pt-3">
          <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
        </div>
      </article>
    </button>
  );
}

export function LaptopCardMeta({ visitDate }: { visitDate: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      {formatVisitDateLabelFromKey(visitDate)}
    </p>
  );
}

export { getLaptopTitle };
