# METRICS.md

## North Star Metric

**Qualified leads per week** — defined as email captures from users whose audit showed ≥$100/month in potential savings.

**Why:** SpendLens is a B2B lead-generation tool for Credex. The only metric that connects tool usage to business outcome is the volume of qualified prospects entering Credex's pipeline. Total audit completions is a vanity metric if the users completing audits have $0 in savings. DAU is wrong — people use this tool once per quarter at most. Email captures without savings context aren't actionable for Credex's sales team.

A "qualified lead" is specifically an email where `monthly_savings >= 100`. This is the segment Credex can actually help, and the segment most likely to book a consultation.

---

## 3 Input Metrics That Drive the North Star

**1. Audit completion rate**
`(audits submitted) / (form sessions started)`

This measures whether the form is too long, confusing, or asking for information people don't have handy. Target: ≥ 70%. If this drops, the form needs simplification.

**2. Email capture rate on qualified audits**
`(emails captured where savings ≥ $100) / (audits completed where savings ≥ $100)`

This measures whether the lead capture moment is compelling enough. Target: ≥ 35%. If this is low, the report page isn't building enough trust before asking for the email.

**3. Average savings per audit**
`sum(monthly_savings) / count(audits)`

This measures whether we're attracting the right users. If average savings per audit is very low (<$50), we're attracting individuals and solo devs, not the engineering managers and CTOs who are Credex's actual customers. Distribution channel targeting should shift if this drops.

---

## What to Instrument First

1. **form_start** — user adds first tool to the form
2. **audit_submitted** — user clicks "Run My Free Audit"
3. **audit_completed** — results page loads successfully
4. **email_captured** — user submits lead capture form
5. **share_clicked** — user copies the shareable URL
6. **credex_cta_clicked** — user clicks the Credex consultation link

These six events trace the full funnel. PostHog or Plausible (privacy-friendly) are the right tools — not GA4, which has a steeper setup and overkill for this.

---

## Pivot Trigger

**If email capture rate drops below 15% for two consecutive weeks**, or **if average savings per audit drops below $30** for two consecutive weeks — that triggers a pivot conversation.

The first signal means the results aren't compelling enough to create urgency around email capture. The fix is either better results design (make savings more salient) or a different incentive for capturing the email (PDF export, benchmark report, etc.).

The second signal means we're attracting the wrong audience — individual developers, not engineering managers. The GTM strategy needs to shift to higher-intent channels (Rands Leadership Slack vs r/ExperiencedDevs).

The pivot isn't necessarily to a different product — it might be as small as restructuring the email capture incentive or adjusting the distribution channel. The numbers define when to have that conversation, not when to have already made the decision.
