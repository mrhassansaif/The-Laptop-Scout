"use client";

import Link from "next/link";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Lightbulb,
  Search,
  Terminal,
} from "lucide-react";

import { ChecklistCheckbox } from "@/components/checklist/checklist-checkbox";
import { CopyCommandButton } from "@/components/checklist/copy-command-button";
import { PowershellScriptBlock } from "@/components/checklist/powershell-script-block";
import { ScreenTestButton } from "@/components/checklist/screen-test-button";
import { Badge } from "@/components/ui/badge";
import type { ChecklistEntry } from "@/lib/checklist/data";
import { isCheckableEntryKind } from "@/lib/checklist/storage";
import { cn } from "@/lib/utils";

type ChecklistEntryRowProps = {
  entry: ChecklistEntry;
  completed?: boolean;
  onCompletedChange?: (completed: boolean) => void;
};

export function ChecklistEntryRow({
  entry,
  completed = false,
  onCompletedChange,
}: ChecklistEntryRowProps) {
  const checkable = isCheckableEntryKind(entry.kind);

  switch (entry.kind) {
    case "heading":
      return (
        <p className="px-1 pt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground first:pt-0">
          {entry.label}
        </p>
      );

    case "question":
      return (
        <div
          className={cn(
            "flex gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3 transition-colors duration-200",
            completed && "border-brand/20 bg-brand/5",
          )}
        >
          {checkable && onCompletedChange ? (
            <ChecklistCheckbox
              checked={completed}
              onChange={onCompletedChange}
              label={entry.text ?? "Checklist item"}
            />
          ) : null}
          <p
            className={cn(
              "text-sm leading-6 transition-all duration-200",
              completed && "text-muted-foreground line-through",
            )}
          >
            {entry.text}
          </p>
        </div>
      );

    case "check":
      return (
        <div
          className={cn(
            "flex gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3 transition-colors duration-200",
            completed && "border-brand/20 bg-brand/5",
          )}
        >
          {checkable && onCompletedChange ? (
            <ChecklistCheckbox
              checked={completed}
              onChange={onCompletedChange}
              label={entry.label ?? entry.text ?? "Checklist item"}
            />
          ) : null}
          <div className="space-y-1">
            {entry.label ? (
              <p
                className={cn(
                  "text-sm font-medium transition-all duration-200",
                  completed && "text-muted-foreground line-through",
                )}
              >
                {entry.label}
              </p>
            ) : null}
            {entry.text ? (
              <p
                className={cn(
                  "text-sm leading-6 text-muted-foreground transition-all duration-200",
                  completed && "line-through opacity-80",
                )}
              >
                {entry.text}
              </p>
            ) : null}
          </div>
        </div>
      );

    case "tip":
      return (
        <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            {entry.label ? (
              <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
                {entry.label}
              </p>
            ) : null}
            {entry.text ? (
              <p className="text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
                {entry.text}
              </p>
            ) : null}
          </div>
        </div>
      );

    case "shortcut":
      return (
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">{entry.label}</p>
          <Badge variant="secondary" className="font-mono text-xs">
            {entry.command}
          </Badge>
        </div>
      );

    case "command":
      if (entry.command === "powershell-winsat") {
        return (
          <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">{entry.label}</p>
              {entry.text ? (
                <p className="text-xs leading-5 text-muted-foreground">
                  {entry.text}
                </p>
              ) : null}
            </div>
            <PowershellScriptBlock />
          </div>
        );
      }

      return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3 dark:bg-white/[0.04]">
          <Terminal className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-1">
            {entry.label ? (
              <p className="text-sm font-medium">{entry.label}</p>
            ) : null}
            <code className="block break-all font-mono text-xs leading-5 text-foreground/90">
              {entry.command}
            </code>
          </div>
          {entry.command ? (
            <CopyCommandButton value={entry.command} className="shrink-0" />
          ) : null}
        </div>
      );

    case "note":
      return (
        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
          {entry.label ? (
            <p className="text-sm font-medium">{entry.label}</p>
          ) : null}
          {entry.text ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {entry.text}
            </p>
          ) : null}
          {entry.bullets?.length ? (
            <ul className="space-y-2 border-t border-border/60 pt-3">
              {entry.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-2 text-sm leading-6 text-muted-foreground"
                >
                  <span className="text-foreground/40">-</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );

    case "screen-test":
      if (!entry.screenColor) {
        return null;
      }

      return (
        <ScreenTestButton
          color={entry.screenColor}
          label={entry.label ?? entry.screenColor}
          hint={entry.hint}
        />
      );

    case "tool":
      return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3 transition-colors duration-200 hover:bg-muted/40">
          {entry.href ? (
            <Link
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${entry.label ?? "tool"} download`}
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <Download className="size-4" />
            </Link>
          ) : (
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Search className="size-4" />
            </span>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            {entry.href ? (
              <Link
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
              >
                {entry.label}
                <ExternalLink className="size-3.5 shrink-0 opacity-60" />
              </Link>
            ) : (
              <p className="text-sm font-medium">{entry.label}</p>
            )}
            {entry.text ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {entry.text}
              </p>
            ) : null}
          </div>
        </div>
      );

    default:
      return null;
  }
}

type ChecklistSectionCardProps = {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChecklistSectionCard({
  title,
  description,
  icon,
  children,
  className,
  open,
  onOpenChange,
}: ChecklistSectionCardProps) {
  return (
    <details
      className={cn(
        "group surface-raised overflow-hidden transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
      open={open}
    >
      <summary
        className="flex cursor-pointer list-none items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/20 md:px-5 [&::-webkit-details-marker]:hidden"
        onClick={(event) => {
          event.preventDefault();
          onOpenChange(!open);
        }}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
          {icon}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-base font-semibold tracking-[-0.02em]">{title}</h3>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </summary>
      <div className="space-y-2 border-t border-border/60 px-4 py-4 md:px-5">
        {children}
      </div>
    </details>
  );
}
