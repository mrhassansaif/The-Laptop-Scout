import type { Metadata } from "next";

import { AddLaptopForm } from "@/components/laptops/add-laptop-form";
import { MobileHeader } from "@/components/layout/mobile-header";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Add Laptop",
};

export default function AddLaptopPage() {
  return (
    <>
      <MobileHeader title="Add Laptop" />
      <div className="page-shell max-w-4xl">
        <PageHeader
          eyebrow="Capture"
          title="Add Laptop"
          description="Save the essentials quickly. Every entry is automatically grouped into today's visit."
        />
        <AddLaptopForm />
      </div>
    </>
  );
}
