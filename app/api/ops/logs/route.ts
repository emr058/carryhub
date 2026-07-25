import { NextResponse } from "next/server";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const LOG_DIRS = [
  process.cwd(),
  join(process.cwd(), ".next"),
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const file = url.searchParams.get("file") || "";

    // List available log files
    if (!file) {
      const files: { name: string; size: number; mtime: Date }[] = [];
      for (const dir of LOG_DIRS) {
        try {
          const entries = readdirSync(dir);
          for (const entry of entries) {
            const fullPath = join(dir, entry);
            const stat = statSync(fullPath);
            if (stat.isFile() && entry.endsWith(".log")) {
              files.push({
                name: entry,
                size: stat.size,
                mtime: stat.mtime,
              });
            }
          }
        } catch { /* skip unreadable dirs */ }
      }
      // Also check git log
      return NextResponse.json({ success: true, files: files.slice(0, 20) });
    }

    // Read specific file
    const fullPath = join(process.cwd(), file);
    if (!fullPath.startsWith(process.cwd())) {
      return NextResponse.json(
        { success: false, error: "Dosya yolu geçersiz." },
        { status: 403 }
      );
    }

    const content = readFileSync(fullPath, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim());

    // Return last 50 non-empty lines
    return NextResponse.json({
      success: true,
      content: lines.slice(-50).join("\n"),
      totalLines: lines.length,
      fileName: file,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
