"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui";

// ─── Git Log Panel ───────────────────────────────────────────
function GitLogPanel() {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ops/git-log")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCommits(d.commits);
        else setError(d.error);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">📋</span> Git Geçmişi
      </h3>
      {loading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Yükleniyor...</div>
      ) : error ? (
        <div className="text-xs text-red-500">{error}</div>
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto font-mono text-[11px]">
          {commits.map((c: any, i: number) => (
            <div key={i} className="flex gap-2 text-muted-foreground">
              <span className="text-blue-500 shrink-0">{c.hash.slice(0, 7)}</span>
              <span className="truncate">{c.message}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── SQL Runner ──────────────────────────────────────────────
function SqlRunner() {
  const [query, setQuery] = useState("SELECT * FROM \"User\" LIMIT 10");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ops/sql-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) setResult(data.result);
      else setError(data.error);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">🗄️</span> SQL Sorgulama
        <span className="text-[10px] text-muted-foreground ml-auto">sadece SELECT</span>
      </h3>
      <textarea
        className="w-full h-20 p-2 border rounded-md text-xs font-mono bg-background resize-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={run}
        disabled={loading}
        className="mt-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Çalışıyor..." : "▶ Çalıştır"}
      </button>
      {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
      {result && (
        <pre className="mt-2 p-2 bg-muted rounded-md text-[10px] font-mono max-h-[250px] overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </Card>
  );
}

// ─── Log Analyzer ────────────────────────────────────────────
function LogAnalyzer() {
  const [files, setFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ops/logs")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFiles(d.files);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function loadFile(name: string) {
    setSelected(name);
    setContent("");
    const res = await fetch(`/api/ops/logs?file=${name}`);
    const data = await res.json();
    if (data.success) setContent(data.content);
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">📊</span> Log Analizörü
      </h3>
      {loading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Taranıyor...</div>
      ) : files.length === 0 ? (
        <div className="text-xs text-muted-foreground">Log dosyası bulunamadı.</div>
      ) : (
        <div className="flex gap-2">
          <div className="w-1/3 space-y-1">
            {files.map((f, i) => (
              <button
                key={i}
                onClick={() => loadFile(f.name)}
                className={`block w-full text-left text-[11px] p-1.5 rounded truncate ${
                  selected === f.name
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {f.name}
                <span className="ml-1 opacity-60">({(f.size / 1024).toFixed(1)}KB)</span>
              </button>
            ))}
          </div>
          <div className="w-2/3">
            {content ? (
              <pre className="p-2 bg-muted rounded-md text-[10px] font-mono max-h-[300px] overflow-auto whitespace-pre-wrap">
                {content}
              </pre>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-8">
                Dosya seçin
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Telegram Test ───────────────────────────────────────────
function TelegramTest() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendTest() {
    setStatus("sending");
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `🧪 Ops Agent test mesajı — ${new Date().toLocaleTimeString("tr-TR")}`,
        }),
      });
      const data = await res.json();
      setStatus(data.success ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="text-lg">🔔</span> Telegram Bildirim
      </h3>
      <button
        onClick={sendTest}
        disabled={status === "sending"}
        className={`px-3 py-1.5 text-xs rounded-md ${
          status === "sent"
            ? "bg-green-600 text-white"
            : status === "error"
            ? "bg-red-500 text-white"
            : "bg-primary text-primary-foreground hover:opacity-90"
        } disabled:opacity-50`}
      >
        {status === "idle" && "📨 Test Bildirimi Gönder"}
        {status === "sending" && "⏳ Gönderiliyor..."}
        {status === "sent" && "✅ Gönderildi!"}
        {status === "error" && "❌ Hata"}
      </button>
      {status === "sent" && (
        <p className="mt-2 text-xs text-green-600">Telegram bildirimi başarıyla gönderildi.</p>
      )}
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function OpsIntelligencePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Ops Agent</h1>
        <p className="text-sm text-muted-foreground">
          Git geçmişi, SQL sorgulama, log analizi ve bildirimler.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GitLogPanel />
        <SqlRunner />
      </div>

      <LogAnalyzer />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TelegramTest />
        <Card className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
          <p className="text-xs">🛡️ Tüm SQL sorguları salt-okunur (SELECT-only) ve güvenlik filtreli</p>
          <p className="text-xs mt-1">Git log & log analizi local dosya sistemi ile sınırlı</p>
        </Card>
      </div>
    </div>
  );
}
