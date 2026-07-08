import type { Metadata } from "next";

import { MobileHeader } from "@/components/layout/mobile-header";
import { PageHeader } from "@/components/layout/page-header";
import { VisitsView } from "@/components/visits/visits-view";

export const metadata: Metadata = {
  title: "Visits",
};

export default function VisitsPage() {
  return (
    <>
      <MobileHeader title="Visits" />
      <div className="page-shell">
        <PageHeader
          eyebrow="Visit log"
          title="Visits"
          description="Browse every scouting day as a polished timeline. Same-day saves stay together automatically."
        />
        <VisitsView />
      </div>
    </>
  );
}
