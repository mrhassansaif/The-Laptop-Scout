import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { MobileHeader } from "@/components/layout/mobile-header";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <MobileHeader title="Dashboard" />
      <div className="page-shell">
        <PageHeader
          eyebrow="Overview"
          title="Dashboard"
          description="A calm command center for today's scouting activity and recent laptop finds."
        />
        <DashboardOverview />
      </div>
    </>
  );
}
