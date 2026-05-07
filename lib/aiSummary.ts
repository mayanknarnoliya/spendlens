import Groq from "groq-sdk";
import { AuditResult, TOOL_LABELS } from "./auditEngine";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAuditSummary(audit: AuditResult): Promise<string> {
  const toolsList = audit.tools
    .map(
      (t) =>
        `${TOOL_LABELS[t.toolId] || t.toolId} (Plan: ${t.plan}, ${t.seats} seat${t.seats !== 1 ? "s" : ""}, $${t.currentMonthlySpend}/mo) → potential saving: $${t.recommendation.monthlySavings}/mo`
    )
    .join("\n");

  const prompt = `You are a concise AI spend analyst for startups. Write an 80-100 word personalized audit summary.

Team size: ${audit.teamSize} people
Primary use case: ${audit.useCase}
Current total AI spend: $${audit.totalCurrentSpend}/month
Total potential savings: $${audit.totalMonthlySavings}/month ($${audit.totalAnnualSavings}/year)
Savings level: ${audit.savingsCategory}

Tools analyzed:
${toolsList}

Write a professional, specific, plain paragraph (no bullet points, no markdown, no headers).
Structure: acknowledge their stack → highlight biggest saving → one action → end with total savings number.
Be direct and data-driven. Max 100 words.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || generateFallbackSummary(audit);
  } catch (error) {
    console.error("Groq API error, using fallback:", error);
    return generateFallbackSummary(audit);
  }
}

function generateFallbackSummary(audit: AuditResult): string {
  const topSaving = [...audit.tools].sort(
    (a, b) => b.recommendation.monthlySavings - a.recommendation.monthlySavings
  )[0];
  const topToolName = TOOL_LABELS[topSaving?.toolId] || "your top tool";

  if (audit.savingsCategory === "optimal") {
    return `Your ${audit.teamSize}-person team is running a lean AI stack for ${audit.useCase} work. At $${audit.totalCurrentSpend}/month, you're on the right plans for your scale. No major optimizations found — a sign of good purchasing discipline. Keep an eye on seat counts as your team grows.`;
  }

  return `Your ${audit.teamSize}-person team is spending $${audit.totalCurrentSpend}/month on AI tools for ${audit.useCase} work. The biggest opportunity is with ${topToolName}, where a plan adjustment could save $${topSaving?.recommendation.monthlySavings}/month. In total, optimizing your stack could free up $${audit.totalMonthlySavings}/month — or $${audit.totalAnnualSavings}/year — without losing meaningful capability.`;
}
