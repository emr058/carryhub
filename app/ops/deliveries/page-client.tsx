"use client";

import { useState } from "react";
import { DeliveriesView, DeliveryDrawer } from "@/components/carryhub-views";

export default function DeliveriesPageClient({ initialDeliveries }: { initialDeliveries: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <>
      <DeliveriesView initialDeliveries={initialDeliveries} onSelect={setSelected} />
      {selected && (
        <DeliveryDrawer delivery={selected} close={() => setSelected(null)} />
      )}
    </>
  );
}
