"use client";

import { useState } from "react";
import { CommandCenter, DeliveryDrawer } from "@/components/carryhub-views";
import type { Delivery } from "@/lib/data";

export default function OpsCommandPage() {
  const [selected, setSelected] = useState<Delivery | null>(null);

  return (
    <>
      <CommandCenter onSelect={setSelected} />
      {selected && (
        <DeliveryDrawer delivery={selected} close={() => setSelected(null)} />
      )}
    </>
  );
}
