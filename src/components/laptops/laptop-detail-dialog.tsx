"use client";

import { Laptop, Phone, Store, Tag } from "lucide-react";

import { getLaptopTitle } from "@/components/laptops/laptop-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { LaptopRecord } from "@/lib/types";
import {
  formatPrice,
  formatVisitDateTimeLabel,
} from "@/lib/visit-dates";

type LaptopDetailDialogProps = {
  laptop: LaptopRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/25 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-6 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function MetaTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/80 px-3 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function LaptopDetailDialog({
  laptop,
  open,
  onOpenChange,
}: LaptopDetailDialogProps) {
  if (!laptop) {
    return null;
  }

  const price = formatPrice(laptop.price);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto border-border/60 bg-card sm:max-w-lg">
        <DialogHeader className="pr-8">
          <div className="mesh-hero mb-2 flex size-12 items-center justify-center rounded-2xl border border-border/50 text-brand">
            <Laptop className="size-5" />
          </div>
          <DialogTitle className="text-title text-xl">
            {getLaptopTitle(laptop)}
          </DialogTitle>
          <DialogDescription>
            A saved laptop record from the shared visit log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {price ? (
              <Badge className="gap-1 border-0 bg-brand text-brand-foreground">
                <Tag className="size-3" />
                {price}
              </Badge>
            ) : null}
            <Badge variant="outline" className="gap-1 bg-muted/30">
              {formatVisitDateTimeLabel(laptop.visitDate, laptop.createdAt)}
            </Badge>
          </div>

          <DetailRow label="Details" value={laptop.details} />
          <DetailRow label="Laptop name" value={laptop.laptopName} />

          {(laptop.shopNumber || laptop.shopKeeperNumber) && (
            <>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <MetaTile
                  icon={<Store className="size-4" />}
                  label="Shop number"
                  value={laptop.shopNumber}
                />
                <MetaTile
                  icon={<Phone className="size-4" />}
                  label="Shop keeper's number"
                  value={laptop.shopKeeperNumber}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
