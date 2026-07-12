"use client";

import { useMemo, useState } from "react";
import {
  Battery,
  BookOpen,
  Cpu,
  Gauge,
  Heart,
  Keyboard,
  MemoryStick,
  MonitorCheck,
  RotateCcw,
  Search,
  Shield,
  Stethoscope,
  Terminal,
  Wrench,
} from "lucide-react";

import {
  ChecklistEntryRow,
  ChecklistSectionCard,
} from "@/components/checklist/checklist-section";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CHECKLIST_FOOTER,
  CHECKLIST_SECTIONS,
  type ChecklistEntry,
  type ChecklistSection,
} from "@/lib/checklist/data";
import {
  getCheckableChecklistEntryIds,
  isCheckableEntryKind,
  loadCompletedItemIds,
  loadOpenSectionIds,
  saveCompletedItemIds,
  saveOpenSectionIds,
} from "@/lib/checklist/storage";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  questions: <Stethoscope className="size-5" />,
  shortcuts: <Keyboard className="size-5" />,
  checkup: <MonitorCheck className="size-5" />,
  battery: <Battery className="size-5" />,
  ratings: <Gauge className="size-5" />,
  processor: <Cpu className="size-5" />,
  ram: <MemoryStick className="size-5" />,
  "system-info": <Terminal className="size-5" />,
  tools: <Wrench className="size-5" />,
  boost: <Shield className="size-5" />,
};

function entryMatchesQuery(entry: ChecklistEntry, query: string): boolean {
  return JSON.stringify(entry).toLowerCase().includes(query);
}

function sectionMatchesQuery(section: ChecklistSection, query: string): boolean {
  const haystack = [section.title, section.description ?? ""]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function filterChecklistSections(query: string): ChecklistSection[] {
  if (!query) {
    return CHECKLIST_SECTIONS;
  }

  return CHECKLIST_SECTIONS.map((section) => {
    if (sectionMatchesQuery(section, query)) {
      return section;
    }

    const matchingItems = section.items.filter((entry) =>
      entryMatchesQuery(entry, query),
    );

    if (matchingItems.length === 0) {
      return null;
    }

    return {
      ...section,
      items: matchingItems,
    };
  }).filter((section): section is ChecklistSection => section !== null);
}

type ChecklistStickyControlsProps = {
  completedCount: number;
  totalCount: number;
  progress: number;
  onClear: () => void;
};

function ChecklistStickyControls({
  completedCount,
  totalCount,
  progress,
  onClear,
}: ChecklistStickyControlsProps) {
  return (
    <div
      className={cn(
        "sticky top-[53px] z-20 -mx-4 mb-1 border-b border-border/50 bg-background/85 px-4 py-3 backdrop-blur-2xl",
        "supports-backdrop-filter:bg-background/75",
        "md:top-0 md:-mx-6 md:rounded-2xl md:border md:border-border/60 md:bg-card/95 md:px-4 md:py-3.5 md:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]",
        "dark:md:shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_8px_32px_rgba(0,0,0,0.35)]",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-medium uppercase tracking-[0.12em]">
              Progress
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {completedCount}/{totalCount}
              <span className="ml-1.5 text-muted-foreground">({progress}%)</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {completedCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full shrink-0 bg-background/60 sm:w-auto sm:min-w-[9.5rem]"
            onClick={onClear}
          >
            <RotateCcw className="size-4" />
            <span className="sm:hidden">Clear</span>
            <span className="hidden sm:inline">Clear Checklist</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ChecklistView() {
  const [query, setQuery] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(
    loadOpenSectionIds,
  );
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(
    loadCompletedItemIds,
  );

  const checkableEntryIds = useMemo(() => getCheckableChecklistEntryIds(), []);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(
    () => filterChecklistSections(normalizedQuery),
    [normalizedQuery],
  );

  const visibleOpenSectionIds = useMemo(() => {
    if (!normalizedQuery) {
      return openSectionIds;
    }

    const next = new Set(openSectionIds);
    filteredSections.forEach((section) => next.add(section.id));
    return next;
  }, [filteredSections, normalizedQuery, openSectionIds]);

  const completedCount = checkableEntryIds.filter((id) =>
    completedItemIds.has(id),
  ).length;

  const progress =
    checkableEntryIds.length === 0
      ? 0
      : Math.round((completedCount / checkableEntryIds.length) * 100);

  function handleSectionOpenChange(sectionId: string, open: boolean) {
    setOpenSectionIds((current) => {
      const next = new Set(current);
      if (open) {
        next.add(sectionId);
      } else {
        next.delete(sectionId);
      }
      saveOpenSectionIds(next);
      return next;
    });
  }

  function handleCompletedChange(itemId: string, completed: boolean) {
    setCompletedItemIds((current) => {
      const next = new Set(current);
      if (completed) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      saveCompletedItemIds(next);
      return next;
    });
  }

  function handleClearChecklist() {
    const next = new Set<string>();
    setCompletedItemIds(next);
    saveCompletedItemIds(next);
    setClearDialogOpen(false);
  }

  return (
    <div className="animate-soft-in space-y-4 pb-4 md:space-y-5">
      <div className="mesh-hero surface-card p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-[0_8px_24px_color-mix(in_oklch,var(--brand)_30%,transparent)]">
            <BookOpen className="size-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-title">Laptop check-up guide</h2>
            <p className="text-subtitle max-w-2xl">
              Questions to ask, commands to run, screen tests to open, and
              tools to verify the laptop before you buy.
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions, commands, tools..."
            className="h-12 bg-background/70 pl-10 backdrop-blur-sm"
          />
        </div>
      </div>

      <ChecklistStickyControls
        completedCount={completedCount}
        totalCount={checkableEntryIds.length}
        progress={progress}
        onClear={() => setClearDialogOpen(true)}
      />

      {filteredSections.length === 0 ? (
        <div className="surface-inset px-4 py-10 text-center">
          <p className="text-sm font-medium">No checklist items match your search.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword like battery, RAM, or screen.
          </p>
        </div>
      ) : (
        filteredSections.map((section) => (
          <ChecklistSectionCard
            key={section.id}
            title={section.title}
            description={section.description}
            icon={
              SECTION_ICONS[section.id] ?? (
                <Stethoscope className="size-5" />
              )
            }
            open={visibleOpenSectionIds.has(section.id)}
            onOpenChange={(open) => handleSectionOpenChange(section.id, open)}
          >
            {section.items.map((entry) => (
              <ChecklistEntryRow
                key={entry.id}
                entry={entry}
                completed={completedItemIds.has(entry.id)}
                onCompletedChange={
                  isCheckableEntryKind(entry.kind)
                    ? (completed) => handleCompletedChange(entry.id, completed)
                    : undefined
                }
              />
            ))}
          </ChecklistSectionCard>
        ))
      )}

      <footer className="surface-inset px-4 py-5 text-center">
        <p className="inline-flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
          {CHECKLIST_FOOTER}
          <Heart
            className="size-4 fill-red-500 text-red-500"
            aria-hidden
          />
        </p>
      </footer>

      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title="Clear checklist?"
        description="This will uncheck all completed items. Your section expand/collapse state will stay as it is."
        confirmLabel="Clear Checklist"
        onConfirm={handleClearChecklist}
      />
    </div>
  );
}
