"use client";

import { useState } from "react";
import { CompanyView, DeliveryDrawer } from "@/components/carryhub-views";

export default function CompanyPageClient({
  initialDeliveries,
  companyId
}: {
  initialDeliveries: any[];
  companyId: string | null;
}) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <>
      <CompanyView
        initialDeliveries={initialDeliveries}
        companyId={companyId}
        onSelect={setSelected}
      />
      {selected && (
        <DeliveryDrawer delivery={selected} close={() => setSelected(null)} />
      )}
    </>
  );
}
