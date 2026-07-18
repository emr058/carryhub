"use client";

import type { ReactNode } from "react";
import { Truck } from "lucide-react";
import RoleLayout from "@/components/role-layout";

const courierNav = [
  {
    group: "KURYE İŞLEMLERİ",
    items: [
      { id: "courier", label: "Kurye Pazaryeri", icon: Truck, href: "/courier" }
    ]
  }
] as const;

export default function CourierLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="Kurye" navGroups={courierNav} currentLabel="Kurye Pazaryeri">
      {children}
    </RoleLayout>
  );
}
