import type { Metadata } from "next";

import { ChecklistView } from "@/components/checklist/checklist-view";
import { MobileHeader } from "@/components/layout/mobile-header";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Checklist",
};

export default function ChecklistPage() {
  return (
    <>
      <MobileHeader title="Checklist" />
      <div className="page-shell">
        <PageHeader
          eyebrow="Inspection guide"
          title="Buyer Checklist"
          description="A structured, practical guide for inspecting laptops before handing over your money."
        />
        <ChecklistView />
      </div>
    </>
  );
}
