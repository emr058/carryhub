"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Command, Route, SlidersHorizontal, WalletCards, BarChart3, Link2, ShieldCheck
} from "lucide-react";
import RoleLayout from "@/components/role-layout";

const opsNav = [
  {
    group: "PAZARYERİ",
    items: [
      { id: "command", label: "Operasyon Merkezi", icon: Command, href: "/ops" },
      { id: "deliveries", label: "Canlı Teslimatlar", icon: Route, count: "24", href: "/ops/deliveries" },
    ]
  },
  {
    group: "YÖNETİM",
    items: [
      { id: "pricing", label: "Fiyatlandırma", icon: SlidersHorizontal, href: "/ops/pricing" },
      { id: "finance", label: "Finans & Mutabakat", icon: WalletCards, count: "6", href: "/ops/finance" },
      { id: "intelligence", label: "Pazaryeri Analitiği", icon: BarChart3, href: "/ops/intelligence" },
    ]
  },
  {
    group: "PLATFORM",
    items: [
      { id: "integrations", label: "Entegrasyonlar", icon: Link2, href: "/ops/integrations" },
      { id: "security", label: "Güven & Güvenlik", icon: ShieldCheck, href: "/ops/security" },
    ]
  }
] as const;

export default function OpsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Find the label matching the current path dynamically
  let activeLabel = "Operasyon Merkezi";
  for (const group of opsNav) {
    const item = group.items.find((x) => x.href === pathname);
    if (item) {
      activeLabel = item.label;
      break;
    }
  }

  return (
    <RoleLayout role="Operasyon" navGroups={opsNav} currentLabel={activeLabel}>
      {children}
    </RoleLayout>
  );
}
