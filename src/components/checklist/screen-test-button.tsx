"use client";

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  openScreenTestWindow,
  type ScreenTestColor,
} from "@/lib/checklist/screen-test";
import { cn } from "@/lib/utils";

const COLOR_STYLES: Record<
  ScreenTestColor,
  { swatch: string; button: string }
> = {
  WHITE: {
    swatch: "bg-white ring-1 ring-border",
    button: "bg-white text-foreground ring-1 ring-border hover:bg-zinc-100",
  },
  GREEN: {
    swatch: "bg-[#7CFC00]",
    button: "bg-[#7CFC00] text-emerald-950 hover:bg-[#6de600]",
  },
  RED: {
    swatch: "bg-red-500",
    button: "bg-red-500 text-white hover:bg-red-600",
  },
  BLACK: {
    swatch: "bg-black",
    button: "bg-black text-white hover:bg-zinc-800",
  },
};

type ScreenTestButtonProps = {
  color: ScreenTestColor;
  label: string;
  hint?: string;
};

export function ScreenTestButton({ color, label, hint }: ScreenTestButtonProps) {
  const styles = COLOR_STYLES[color];

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-3">
      <span
        className={cn("mt-0.5 size-4 shrink-0 rounded-full", styles.swatch)}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium">{label}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <Button
        type="button"
        size="sm"
        className={cn("shrink-0 gap-1.5", styles.button)}
        onClick={() => openScreenTestWindow(color)}
      >
        <ExternalLink className="size-3.5" />
        Open
      </Button>
    </div>
  );
}
