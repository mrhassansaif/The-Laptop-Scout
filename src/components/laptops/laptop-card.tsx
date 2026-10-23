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
        "group w-full min-w-0 rounded-2xl text-left outline-none transition-transform duration-200 focus-visible:ring-4 focus-visible:ring-ring/30 active:scale-[0.98]",
        className,
      )}
    >
      <article className="wallet-card relative overflow-hidden rounded-2xl border border-border/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow,transform] duration-200 md:group-hover:-translate-y-0.5 md:group-hover:border-brand/25 md:group-hover:shadow-[0_14px_32px_rgba(15,23,42,0.1)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
            tint,
          )}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="line-clamp-2 text-base font-semibold leading-snug tracking-[-0.03em] break-words">
              {title}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {formatVisitDateTimeLabel(laptop.visitDate, laptop.createdAt)}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/70 text-brand shadow-sm backdrop-blur-sm">
            <Laptop className="size-4" />
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          {price ? (
            <Badge className="h-auto max-w-full gap-1 border-0 bg-brand py-1 whitespace-normal text-brand-foreground">
              <Tag className="size-3" />
              <span className="break-words">{price}</span>
            </Badge>
          ) : null}
          {laptop.shopNumber ? (
            <Badge
              variant="outline"
              className="h-auto max-w-full gap-1 bg-background/50 py-1 whitespace-normal backdrop-blur-sm"
            >
              <Store className="size-3 shrink-0" />
              <span className="break-words">Shop {laptop.shopNumber}</span>
            </Badge>
          ) : null}
        </div>

        {laptop.details ? (
          <p className="relative mt-3 line-clamp-2 text-sm leading-6 break-words text-muted-foreground">
            {laptop.details}
          </p>
        ) : (
          <p className="relative mt-3 text-sm text-muted-foreground/80">
            Tap to review the saved details.
          </p>
        )}

        <div className="relative mt-4 flex items-center justify-end border-t border-border/50 pt-3">
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
