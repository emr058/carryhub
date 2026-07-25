import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  try {
    const log = execSync("git log --oneline -20", {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: 5000,
    });

    const lines = log.trim().split("\n").filter(Boolean).map((line) => {
      const [hash, ...msg] = line.split(" ");
      return { hash, message: msg.join(" ") };
    });

    return NextResponse.json({ success: true, commits: lines });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
