import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Clock3 } from "lucide-react";

export function Button({ children, variant = "primary", className = "", disabled = false, onClick }: { children: ReactNode; variant?: "primary" | "outline" | "ghost" | "danger"; className?: string; disabled?: boolean; onClick?: () => void }) {
  const styles = { primary: "bg-primary text-primary-foreground hover:opacity-90", outline: "border bg-card text-card-foreground hover:bg-muted", ghost: "text-muted-foreground hover:bg-muted hover:text-foreground", danger: "bg-destructive text-primary-foreground" };
  return <button disabled={disabled} onClick={onClick} className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`}>{children}</button>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "warning" | "danger" | "primary" }) {
  const styles = { neutral: "bg-muted text-muted-foreground", positive: "bg-primary/12 text-primary", warning: "bg-accent/14 text-accent", danger: "bg-destructive/12 text-destructive", primary: "bg-primary/12 text-primary" };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold ${styles[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgba(16,24,32,.03)] ${className}`}>{children}</section>;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="flex items-start justify-between gap-4 border-b px-5 py-4"><div className="flex min-w-0 flex-col gap-1"><h2 className="text-balance text-sm font-semibold">{title}</h2>{description && <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>}</div>{action}</header>;
}

export function Metric({ label, value, change, trend = "up", compact = false }: { label: string; value: string; change?: string; trend?: "up" | "down" | "flat"; compact?: boolean }) {
  return <div className={`flex flex-col gap-2 ${compact ? "p-4" : "p-5"}`}><div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-muted-foreground">{label}</span>{change && <span className={`flex items-center gap-1 text-[11px] font-semibold ${trend === "down" ? "text-destructive" : "text-primary"}`}>{trend === "down" ? <ArrowDownRight className="size-3" /> : trend === "up" ? <ArrowUpRight className="size-3" /> : null}{change}</span>}</div><strong className={`${compact ? "text-xl" : "text-2xl"} tracking-tight`}>{value}</strong></div>;
}

export function StatusBadge({ status }: { status: string }) {
  const danger = ["Gecikiyor", "Reddedildi", "Vadesi Geçti"].includes(status);
  const warning = ["Kurye Aranıyor", "Bekliyor", "İncelemede"].includes(status);
  const positive = ["Teslim Edildi", "Tamamlandı", "Aktif", "Doğrulandı"].includes(status);
  return <Badge tone={danger ? "danger" : warning ? "warning" : positive ? "positive" : "primary"}><Clock3 className="mr-1 size-3" />{status}</Badge>;
}

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-32 flex-col justify-between gap-4 rounded-lg border border-dashed bg-muted/40 p-4 opacity-75"><Badge tone="neutral">YAKINDA</Badge><div className="flex flex-col gap-1"><h3 className="text-sm font-semibold">{title}</h3><p className="text-xs leading-relaxed text-muted-foreground">{description}</p></div></div>;
}
