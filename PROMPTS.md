# PROMPTS.md

## Audit Summary Prompt

Used in `lib/aiSummary.ts` for generating the personalized ~100-word summary on the results page.

### The Prompt

```
You are a concise AI spend analyst. Write a 80-100 word personalized audit summary for a startup team.

Context:
- Team size: {teamSize}
- Primary use case: {useCase}
- Current total spend: ${totalCurrentSpend}/month
- Total potential savings: ${totalMonthlySavings}/month (${totalAnnualSavings}/year)
- Savings category: {savingsCategory}

Tools being used:
{toolsList — each tool with plan, current spend, and possible savings}

Write a professional, specific, and encouraging summary that:
1. Acknowledges their current stack concisely
2. Highlights the biggest saving opportunity
3. Gives one actionable recommendation
4. Ends with the total savings figure

Do NOT use markdown, bullet points, or headers. Plain paragraph only. Be direct and data-driven.
```

### Why I wrote it this way

**Plain paragraph only** — The summary appears inside a styled card on the results page. Markdown bullets would render as raw text. I want the AI to write in continuous prose that reads like analyst commentary, not a list.

**"Be direct and data-driven"** — Early drafts without this constraint produced vague summaries like "Your AI tool usage seems to be growing." The data-driven constraint pulls the model toward using the actual numbers from the context.

**Numbered structure in the prompt** — Telling the model what the four parts of the summary should be in order produces much more consistent output than just asking for "a good summary."

**80-100 word limit** — I tried shorter (50 words) and longer (200 words). 50 words was too thin to be interesting; 200 words was too long for a callout card. 80-100 is readable in under 20 seconds.

### What I tried that didn't work

1. **"Write as a CFO advisor"** — Produced overly formal language that felt wrong for a startup audience. Dropped the persona.

2. **Asking for markdown with a headline** — The bold headline the model kept generating broke the card design and looked generic ("**Your AI Spend is Optimizable!**"). Removed.

3. **Including raw pricing data in the prompt** — Sending the full tool comparison table made the model try to analyze pricing instead of summarizing the audit. Kept only the pre-computed savings figures.

4. **Temperature 0** — Responses became too formulaic — almost identical for similar inputs. Switched to default temperature for more natural variation between similar audit profiles.

### Fallback behavior

If the Anthropic API fails (429, 5xx, timeout), `generateFallbackSummary()` runs instead. It uses the same context data to produce a deterministic summary using string interpolation. The fallback targets two cases:
- **Optimal stack** — acknowledges good spending discipline
- **Savings found** — names the top savings tool and cites the total figure

The fallback is intentionally less polished but always accurate.
