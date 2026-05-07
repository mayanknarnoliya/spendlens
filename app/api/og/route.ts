import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const savings = searchParams.get("savings") || "0";
  const annual = searchParams.get("annual") || "0";

  const html = `
    <html>
      <body style="margin:0;background:#030712;display:flex;align-items:center;justify-content:center;height:630px;width:1200px;font-family:system-ui,sans-serif;">
        <div style="text-align:center;">
          <div style="color:#60a5fa;font-size:18px;margin-bottom:16px;letter-spacing:2px;text-transform:uppercase;">SpendLens · AI Spend Audit</div>
          <div style="color:white;font-size:96px;font-weight:900;line-height:1;">$${Number(savings).toLocaleString()}</div>
          <div style="color:#9ca3af;font-size:36px;margin-top:8px;">/month in savings found</div>
          <div style="color:#4ade80;font-size:28px;margin-top:16px;">$${Number(annual).toLocaleString()}/year total opportunity</div>
          <div style="color:#6b7280;font-size:20px;margin-top:32px;">Run your free audit at spendlens.ai</div>
        </div>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
