"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, ChevronRight, LogOut, Menu, Route, User, Settings2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui";

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

type RoleLabel = "Operasyon" | "Şirket" | "Kurye";

interface RoleLayoutProps {
  role: RoleLabel;
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

/** Map role label → profile URL */
const profileHref: Record<RoleLabel, string> = {
  Operasyon: "/ops/profile",
  Şirket: "/company/profile",
  Kurye: "/courier/profile",
};

export default function RoleLayout({ role, navGroups, currentLabel, children }: RoleLayoutProps) {
  const [sidebar, setSidebar] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  // Derive initials from email (or name if stored in user_metadata)
  const email = user?.email ?? "K";
  const initials = email.substring(0, 2).toUpperCase();
  const fullName =
    (user?.user_metadata?.name as string) ??
    email.replace(/@.*$/, "");

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

          {/* User Profile Block — real auth data */}
          <div className="absolute bottom-0 left-0 right-0 border-t bg-card p-3">
            <Link
              href={profileHref[role]}
              className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-muted transition"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                {initials}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <strong className="block truncate text-xs">{fullName}</strong>
                <small className="text-muted-foreground">{email}</small>
              </span>
              <User className="size-4 text-muted-foreground shrink-0" />
            </Link>
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
                      <strong className="text-sm">Bildirimler</strong>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                      Henüz bildirim bulunmuyor.
                    </div>
                  </Card>
                )}
              </div>

              {/* User menu (avatar + dropdown) */}
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  onBlur={() => setTimeout(() => setUserMenu(false), 200)}
                  className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                >
                  {initials}
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl border bg-card p-2 shadow-xl z-50">
                    <div className="border-b px-3 py-2">
                      <strong className="block text-xs truncate">{fullName}</strong>
                      <small className="text-muted-foreground text-[10px]">{email}</small>
                    </div>

                    <Link
                      href={profileHref[role]}
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs hover:bg-muted mt-1"
                    >
                      <Settings2 className="size-4 text-muted-foreground" />
                      Profili Düzenle
                    </Link>

                    <hr className="my-1 border-t" />

                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut className="size-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
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
