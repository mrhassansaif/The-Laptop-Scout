"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type ChecklistCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function ChecklistCheckbox({
  checked,
  onChange,
  label,
}: ChecklistCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
        checked
          ? "animate-check-pop border-brand bg-brand"
          : "border-border bg-card hover:border-brand/40",
      )}
    >
      <Check
        className={cn(
          "size-3 text-brand-foreground transition-all duration-200",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
    </button>
  );
}
