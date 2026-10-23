"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyCommandButtonProps = {
  value: string;
  className?: string;
};

export function CopyCommandButton({ value, className }: CopyCommandButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => void handleCopy()}
        aria-label={copied ? "Copied" : "Copy command"}
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
