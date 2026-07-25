"use client";

import type { ReactNode } from "react";
import { Building2, User } from "lucide-react";
import RoleLayout from "@/components/role-layout";

const companyNav = [
  {
    group: "FİRMA İŞLEMLERİ",
    items: [
      { id: "company", label: "Şirket İşlemleri", icon: Building2, href: "/company" },
    ],
  },
  {
    group: "HESAP",
    items: [
      { id: "profile", label: "Profil", icon: User, href: "/company/profile" },
    ],
  },
] as const;

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="Şirket" navGroups={companyNav} currentLabel="Şirket İşlemleri">
      {children}
    </RoleLayout>
  );
}
