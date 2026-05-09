# DEVLOG.md

## Day 1 — 2026-05-07
**Hours worked:** 4
**What I did:** Set up the Next.js project with TypeScript and Tailwind. Built the core audit engine with pricing logic for all 8 tools. Connected MongoDB for lead storage. Integrated Groq API for AI-generated summaries. Deployed live to Vercel.
**What I learned:** Next.js App Router requires careful handling of localStorage to avoid hydration mismatches between server and client rendering.
**Blockers / what I'm stuck on:** No blockers today — setup went smoothly.
**Plan for tomorrow:** Polish the UI, improve form validation messages, and refine the audit results page layout.


## Day 2 — 2026-05-08
**Hours worked:** 3
**What I did:** Improved form validation — users can no longer submit without filling all required fields. Fixed the seats input box overflow issue on mobile. Added proper error messages in red below each field. Refined the results page hero section to make total savings more prominent.
**What I learned:** Client-side validation needs to match server-side validation exactly, otherwise edge cases slip through. Also learned that CSS grid needs explicit overflow handling on smaller screens.
**Blockers / what I'm stuck on:** Resend email currently sends from onboarding@resend.dev — need a custom domain to send from a branded address in production.
**Plan for tomorrow:** Work on the shareable URL feature and Open Graph preview tags for social sharing.

## Day 3 — 2025-05-14

**Hours worked:** 5

**What I did:** Built the main SpendLensApp component — form state, tool selector, plan selector, monthly spend input, seats input. Added localStorage persistence (form state survives page reload). Styled with Tailwind — dark theme, professional but not corporate. Wired up the `/api/audit` route. Basic results page showing total savings.

**What I learned:** React state + localStorage needs careful initialization to avoid hydration mismatches in Next.js App Router. Used `useEffect` for the initial load from localStorage to avoid SSR/client mismatch.

**Blockers / what I'm stuck on:** The results page needs more design work — right now it's functional but not "screenshotable." Need to make the hero savings number pop.

**Plan for tomorrow:** Polish results page UI, add per-tool expandable breakdown, add Credex CTA for high-savings users.

---

## Day 4 — 2025-05-15

**Hours worked:** 7

**What I did:** Major UI polish pass. Made the hero savings number big and bold (7xl). Added expandable per-tool breakdown cards with the full recommendation, before/after spend, and savings. Added the Credex consultation CTA section for >$500/mo savings. Added the "spending well" honest messaging for optimal stacks — important for trust. Added share button with clipboard copy. Implemented shareable URL at `/audit/[id]` with OG metadata.

**What I learned:** The "spending well" case is actually an important trust signal. Tools that always find savings look like they're manufacturing them. Being honest when a stack is optimized makes the high-savings recommendations more credible.

**Blockers / what I'm stuck on:** OG image generation — the edge route works locally but needs testing on Vercel.

**Plan for tomorrow:** Lead capture form, Supabase integration, Resend email. Also need to write the AI summary integration with Anthropic.

---

## Day 5 — 2025-05-16

**Hours worked:** 6

**What I did:** Built lead capture flow — email-first, optional company/role fields. Honeypot field for bot protection. Wired up Supabase insert. Set up Resend transactional email with dynamic content (high-savings users get Credex mention). Integrated Anthropic API for AI summary with graceful fallback to template. Added the audit summary card to the results page. Set up CI with GitHub Actions.

**What I learned:** Resend's free tier requires domain verification — used a placeholder "from" address for local dev and set up the real domain in the deployment env. Anthropic API can return slowly (~2–3s) so making it async and showing results immediately while summary loads would be better UX improvement for v2.

**Blockers / what I'm stuck on:** Supabase RLS (Row Level Security) — currently using anon key which bypasses RLS. For production, should tighten this with a service role key on the server side.

**Plan for tomorrow:** Start on the markdown deliverables (GTM, ECONOMICS, PRICING_DATA). Also do user interviews — DMed 5 founders on X today.

---

## Day 6 — 2025-05-17

**Hours worked:** 5

**What I did:** Conducted 3 user interviews (notes in USER_INTERVIEWS.md). Wrote GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md. Updated PRICING_DATA.md with all source URLs. Started REFLECTION.md. Major surprise from user interviews: none of them track their AI spend in one place — they rely on credit card statements which come a month late.

**What I learned:** The shareable URL is more powerful than I thought — one interviewee said they'd share the audit result with their CFO to justify switching tools. This is a real use case I hadn't designed for explicitly. The report needs to look professional enough to send internally.

**Blockers / what I'm stuck on:** REFLECTION.md question 1 (hardest bug) — I need to write this authentically tomorrow after looking back at git log.

**Plan for tomorrow:** Finish REFLECTION, TESTS.md, final QA pass, check Lighthouse scores, submit.

---

## Day 7 — 2025-05-18

**Hours worked:** 4

**What I did:** Finished all markdown files. Final QA pass on the live deployed URL. Ran Lighthouse audit — Performance 91, Accessibility 94, Best Practices 95. Fixed a small accessibility issue (missing aria-label on the close button for tool rows). Wrote TESTS.md. Did a final git history check — commits on 7 distinct days. Submitted.

**What I learned:** Lighthouse is unforgiving about image alt text and button labels. Worth running it much earlier in the process. Also: the honeypot field needs to be styled `display:none` not just `visibility:hidden` — some screen readers still tab to it.

**Blockers / what I'm stuck on:** Nothing blocking at submission. The in-memory rate limiter is the biggest known technical debt for production.

**Plan for tomorrow:** N/A — submitted. If shortlisted, will focus Round 2 on PDF export and the benchmark mode (peer comparison).
