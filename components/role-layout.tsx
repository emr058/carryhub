"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, ChevronDown, ChevronRight, Grid2X2, Menu, Route, Settings2, Check, X,
  type LucideIcon
} from "lucide-react";
import { Badge, Card } from "@/components/ui";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  count?: string;
};

type NavGroup = {
  group: string;
  items: readonly NavItem[];
};

type Role = "Operasyon" | "Şirket" | "Kurye" | "Yönetici";

interface RoleLayoutProps {
  role: Role;
  navGroups: readonly {
    readonly group: string;
    readonly items: readonly {
      readonly id: string;
      readonly label: string;
      readonly icon: LucideIcon;
      readonly href: string;
      readonly count?: string;
    }[];
  }[];
  currentLabel: string;
  children: ReactNode;
}

const roleRoutes: Record<Role, string> = {
  "Operasyon": "/ops",
  "Şirket": "/company",
  "Kurye": "/courier",
  "Yönetici": "/ops/intelligence"
};

export default function RoleLayout({ role, navGroups, currentLabel, children }: RoleLayoutProps) {
  const [sidebar, setSidebar] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleRoleChange = (selectedRole: Role) => {
    router.push(roleRoutes[selectedRole]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebar && (
          <button
            aria-label="Menüyü kapat"
            onClick={() => setSidebar(false)}
            className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebar ? "w-64 translate-x-0" : "w-64 -translate-x-full"
          } fixed inset-y-0 left-0 z-40 overflow-hidden border-r bg-card transition-transform lg:sticky lg:w-64 lg:translate-x-0`}
        >
          {/* Brand Logo */}
          <div className="flex h-16 items-center gap-3 border-b px-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Route className="size-5" />
            </span>
            <div>
              <strong className="block text-sm tracking-tight">CarryHub</strong>
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Tekstil Lojistik Ağı
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="scrollbar-none flex h-[calc(100vh-8rem)] flex-col gap-6 overflow-y-auto p-3">
            {navGroups.map((group) => (
              <div key={group.group} className="flex flex-col gap-1">
                <span className="px-3 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground">
                  {group.group}
                </span>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) setSidebar(false);
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="size-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.count && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] ${
                            isActive ? "bg-primary-foreground/15" : "bg-muted"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Profile Block */}
          <div className="absolute bottom-0 left-0 right-0 border-t bg-card p-3">
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-muted">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                AK
              </span>
              <span className="min-w-0 flex-1 text-left">
                <strong className="block truncate text-xs">Ayşe Karaca</strong>
                <small className="text-muted-foreground">Merter Operasyon</small>
              </span>
              <Settings2 className="size-4 text-muted-foreground" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <button
                aria-label="Menüyü aç"
                onClick={() => setSidebar(!sidebar)}
                className="flex size-9 items-center justify-center rounded-lg border bg-card"
              >
                <Menu className="size-4" />
              </button>
              <div className="hidden items-center gap-2 text-xs sm:flex">
                <span className="text-muted-foreground">CarryHub</span>
                <ChevronRight className="size-3 text-muted-foreground" />
                <strong>{currentLabel}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifications(!notifications)}
                  aria-label="Bildirimler"
                  className="relative flex size-9 items-center justify-center rounded-lg border bg-card"
                >
                  <Bell className="size-4" />
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
                </button>
                {notifications && (
                  <Card className="absolute right-0 top-12 w-80 p-2 shadow-xl z-50">
                    <div className="p-3">
                      <strong className="text-sm">Operasyon bildirimleri</strong>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-xs">
                      CH-2838 teslimatı 18 dakika gecikiyor.
                    </div>
                    <div className="mt-1 rounded-lg p-3 text-xs">
                      CH-2840 için manuel atama bekleniyor.
                    </div>
                  </Card>
                )}
              </div>

              {/* Role Dropdown Selector */}
              <div className="relative group">
                <button className="flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold">
                  <Grid2X2 className="size-4 text-primary" />
                  {role}
                  <ChevronDown className="size-3" />
                </button>
                <div className="invisible absolute right-0 top-10 w-44 rounded-lg border bg-card p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 z-50">
                  {(["Operasyon", "Şirket", "Kurye", "Yönetici"] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs hover:bg-muted"
                    >
                      {r}
                      {role === r && <Check className="size-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* Content page */}
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
