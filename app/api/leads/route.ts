import { NextRequest, NextResponse } from "next/server";
import { connectDB, Lead } from "@/lib/mongodb";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

function isBot(body: Record<string, unknown>): boolean {
  return Boolean(body.website);
}

async function sendEmail(to: string, monthlySavings: number, annualSavings: number) {
  if (!RESEND_API_KEY) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SpendLens <onboarding@resend.dev>",
        to: [to],
        subject: `Your AI Spend Audit — $${monthlySavings.toLocaleString()}/mo in savings found`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f172a;color:#fff;border-radius:12px;">
            <h1 style="font-size:24px;color:#ffffff;margin-bottom:8px;">💰 Your SpendLens Audit</h1>
            <p style="color:#94a3b8;font-size:16px;line-height:1.6;">
              We found <strong style="color:#34d399;">$${monthlySavings.toLocaleString()}/month</strong> 
              in potential savings — that's <strong style="color:#34d399;">$${annualSavings.toLocaleString()}/year</strong>.
            </p>
            ${monthlySavings >= 500 ? `
            <div style="background:#1e3a5f;border:1px solid #3b82f6;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0;color:#60a5fa;font-weight:600;">🎯 High savings detected</p>
              <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">
                You qualify for a free Credex consultation. We can help you save an additional 20–40% through discounted AI credits.
              </p>
              <a href="https://credex.rocks" style="display:inline-block;margin-top:12px;background:#3b82f6;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
                Book Free Consultation →
              </a>
            </div>` : ""}
            <p style="color:#64748b;font-size:13px;margin-top:32px;border-top:1px solid #1e293b;padding-top:16px;">
              Sent by SpendLens · Powered by <a href="https://credex.rocks" style="color:#60a5fa;">Credex</a>
            </p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("Email error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (isBot(body)) {
      return NextResponse.json({ success: true });
    }

    const {
      email, companyName, role, teamSize,
      auditId, monthlySpend, annualSavings,
      monthlySavings, savingsCategory, auditData,
    } = body;

    if (!email || !auditId) {
      return NextResponse.json({ error: "Email and audit ID required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Save to MongoDB
    await connectDB();
    await Lead.create({
      auditId,
      email,
      companyName: companyName || "",
      role: role || "",
      teamSize: teamSize || 0,
      monthlySpend: monthlySpend || 0,
      monthlySavings: monthlySavings || 0,
      annualSavings: annualSavings || 0,
      savingsCategory: savingsCategory || "low",
      auditData: auditData || {},
    });

    // Send confirmation email
    await sendEmail(email, monthlySavings || 0, annualSavings || 0);

    console.log(`✅ Lead saved + email sent: ${email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
