# USER_INTERVIEWS.md

Three conversations conducted during the build week via DM and Slack. Each was 10–15 minutes. Notes taken immediately after.

---

## Interview 1 — R.M., Engineering Manager, Series A SaaS (~30 people), May 14

R.M. manages a team of 9 engineers at a logistics SaaS company. They're using GitHub Copilot Business for all devs, ChatGPT Team for the whole company, and Cursor Pro for 3 senior engineers who pushed for it.

**Direct quotes:**
> "Honestly I have no idea what we're paying total. I know the line items but I haven't added them up in months."

> "The finance team just asks me if we still need the tools. I say yes. Nobody's asking if we need all of them."

> "I'd switch tools if someone showed me a side-by-side with real numbers. I don't have time to research it myself."

**Most surprising thing:** R.M. said the reason they haven't evaluated the stack is not cost — it's that "switching has a switching cost too." They're worried about developer complaints if they remove a tool. They'd rather find savings within the existing tools than make a controversial removal. This is a meaningful insight — the audit should surface *within-tool* savings (plan downgrades) as prominently as *across-tool* savings (switches).

**What it changed:** I added the downgrade recommendation path much more prominently, and made the recommendation language about switches softer ("consider switching" vs "switch to").

---

## Interview 2 — P.K., Co-founder / CTO, Pre-seed startup (~8 people), May 15 (Indie Hackers Slack)

P.K. is building a developer productivity tool. Bootstrapped, very cost-conscious. Using Claude Pro personally, ChatGPT Plus personally, and Cursor Pro for all 3 engineers. Has not added any "team" plans — everyone has individual accounts.

**Direct quotes:**
> "I definitely have some overlap. I use Claude for writing and ChatGPT for coding questions sometimes. That's $40/month for probably 80% Claude."

> "I'd cancel one of them if I could figure out which one I'd miss less. But I don't want to experiment and lose a week of productivity."

> "Is there a way to export this and send it to my co-founder? She handles finance and she'd want to see this."

**Most surprising thing:** The desire to share the audit report *internally*. P.K. mentioned their co-founder specifically. This was a use case I hadn't explicitly designed for — the report as an internal document, not just a personal insight. The shareable URL feature became more important after this conversation. I also made the results page cleaner and more "presentable" — like something you'd share in a Notion doc.

**What it changed:** Prioritized the share button placement on the results page. Also refined the per-tool savings breakdown to look more like a professional audit report and less like a dashboard widget.

---

## Interview 3 — A.L., VP of Engineering, Series B company (~80 people), May 16 (X/Twitter DM)

A.L. manages a larger engineering org. They have GitHub Copilot Enterprise for all 40 engineers ($1,560/mo), ChatGPT Enterprise (negotiated, ~$2,400/mo), and a small team using Cursor Business (5 people, $200/mo).

**Direct quotes:**
> "We signed enterprise contracts a year ago when everyone was figuring this out. We probably over-committed."

> "The problem is I see the bill a month after it happens. By the time I notice something is wrong, we've already paid it twice."

> "I already know we're paying too much. What I need is someone to tell me which specific contract to renegotiate and what the leverage is."

**Most surprising thing:** A.L. doesn't need the *diagnosis* — they need the *negotiating ammunition*. At their scale, the savings aren't from switching tools or downgrading plans — they're from contract renegotiation. SpendLens can surface this, but it's a different recommendation than what I'd built. The Credex consultation angle makes much more sense at this scale — Credex can actually help renegotiate or buy discounted credits at volume.

**What it changed:** Reinforced that the Credex CTA should be prominent for high-savings cases. Also added the "buy credits" recommendation path for cases where the spend is large and the savings opportunity is through procurement, not plan switching. Made the CTA copy more specific: "At your spend level, a Credex consultation typically saves 20-40%."
