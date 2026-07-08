import { CHECKLIST_SECTIONS } from "@/lib/checklist/data";

const OPEN_SECTIONS_KEY = "laptopscout-checklist-open-sections";
const COMPLETED_ITEMS_KEY = "laptopscout-checklist-completed";

export const DEFAULT_OPEN_SECTIONS = CHECKLIST_SECTIONS.slice(0, 2).map(
  (section) => section.id,
);

export function isCheckableEntryKind(kind: string): boolean {
  return kind === "question" || kind === "check";
}

export function getCheckableChecklistEntryIds(): string[] {
  return CHECKLIST_SECTIONS.flatMap((section) =>
    section.items
      .filter((entry) => isCheckableEntryKind(entry.kind))
      .map((entry) => entry.id),
  );
}

function readStringArray(key: string): string[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return null;
  }
}

function writeStringArray(key: string, values: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(values));
}

export function loadOpenSectionIds(): Set<string> {
  const stored = readStringArray(OPEN_SECTIONS_KEY);
  return new Set(stored ?? DEFAULT_OPEN_SECTIONS);
}

export function saveOpenSectionIds(sectionIds: Set<string>) {
  writeStringArray(OPEN_SECTIONS_KEY, [...sectionIds]);
}

export function loadCompletedItemIds(): Set<string> {
  const stored = readStringArray(COMPLETED_ITEMS_KEY);
  return new Set(stored ?? []);
}

export function saveCompletedItemIds(itemIds: Set<string>) {
  writeStringArray(COMPLETED_ITEMS_KEY, [...itemIds]);
}
