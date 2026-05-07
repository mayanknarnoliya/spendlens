import { NextRequest, NextResponse } from "next/server";
import { runAudit, AuditInput } from "@/lib/auditEngine";
import { generateAuditSummary } from "@/lib/aiSummary";
import { nanoid } from "nanoid";

// Simple in-memory rate limiter (IP-based, 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Wait a minute and try again." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const auditInput: AuditInput = body;

    // Server-side validation
    if (!auditInput.tools || auditInput.tools.length === 0) {
      return NextResponse.json({ error: "Please add at least one tool" }, { status: 400 });
    }

    if (!auditInput.teamSize || auditInput.teamSize < 1) {
      return NextResponse.json({ error: "Team size must be at least 1" }, { status: 400 });
    }

    for (const tool of auditInput.tools) {
      if (tool.monthlySpend < 0) {
        return NextResponse.json({ error: "Monthly spend cannot be negative" }, { status: 400 });
      }
      if (tool.seats < 1) {
        return NextResponse.json({ error: "Seats must be at least 1" }, { status: 400 });
      }
    }

    const auditResult = runAudit(auditInput);
    const aiSummary = await generateAuditSummary(auditResult);
    const auditId = nanoid(10);

    return NextResponse.json({ auditId, result: auditResult, summary: aiSummary });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
