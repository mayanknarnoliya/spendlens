# REFLECTION.md

## 1. The hardest bug this week

The hardest bug was a Next.js hydration mismatch that caused the entire form to flash and reset on initial load.

The symptom: the form rendered correctly server-side (with an empty tool list as default), but the client immediately re-rendered with the localStorage-saved state, causing a visible flash and a React hydration error in the console.

My first hypothesis was that `useEffect` wasn't running — but `console.log` confirmed it was. Second hypothesis: the localStorage read was happening during SSR. I added `typeof window === 'undefined'` guards, but the flash persisted.

The real issue took another hour to find: I was calling `useState` with a function that read from localStorage as the initializer argument — `useState(() => loadFromStorage() || defaultState)`. This ran on the server during SSR, and when it returned `null` (because `window` doesn't exist on the server), it set the initial state to `defaultState`. But on the client, React's hydration expected the same initial state as the server, so even the deferred `useEffect` caused a mismatch.

The fix: initialize `useState` with only the default state (never reading from localStorage at init time), then use a `useEffect` with no dependencies to load from localStorage after mount. This guarantees server and client agree on initial state, and localStorage hydration happens transparently after first render.

---

## 2. A decision I reversed mid-week

I originally designed the results page to show all tool recommendations expanded by default — the full reasoning visible without any clicks.

I reversed this on Day 4 after building it out and testing it. The problem: with 4+ tools, the results page was over 1,200px tall before the user even saw the hero savings number. The most important element — the total savings figure — was being buried below a wall of per-tool detail.

What made me reverse it: I opened the page on my phone. The first thing you see should be "you're wasting $X/month" — that's the hook. Instead I saw "GitHub Copilot Business · 3 seats · Recommendation: downgrade to Individual · Reason: ..." Nobody cares about the details until they've been hooked by the headline.

Switched to collapsed cards with a one-line summary (action type + savings) that expand on click. The hero now lands above the fold on any screen size.

---

## 3. What I'd build in week 2

The two features I'd prioritize:

**Benchmark mode** — "Your AI spend per developer is $X. Companies your size (10–50 people) average $Y." This requires real data, which is the hard part. I'd start by surveying SpendLens users who submit their email and asking for voluntary anonymized benchmarking. Even 50 data points would make this compelling.

**PDF export** — One of my user interview subjects said they'd share the audit with their CFO. A beautiful PDF export (not just a browser print) makes this a shareable internal document. I'd use `@react-pdf/renderer` for this. The PDF would include the tool breakdown, the AI summary, Credex branding, and a QR code back to the shareable URL.

I'd also add PostHog analytics to understand where users drop off in the form — if most people abandon after adding 3 tools, maybe the form is too long. That data would directly inform week 2 priorities.

---

## 4. How I used AI tools

**Claude (this app's own backend):** Used for the personalized summary feature. Wrote and tested the prompt iteratively — described the behavior I wanted, looked at outputs, refined.

**Claude.ai (claude.ai):** Used heavily for:
- Brainstorming the audit decision tree logic before writing code
- Reviewing TypeScript types for correctness
- Drafting the GTM.md and ECONOMICS.md sections (then heavily edited)
- Debugging the hydration bug — described the symptom and my hypotheses; Claude helped me think through the server/client lifecycle more carefully

**Cursor:** Used for autocomplete while writing the frontend component and the API routes. Specifically helpful for Tailwind class suggestions.

**What I didn't trust AI with:**
- The pricing data — verified every number manually against official pages. AI confidently cited wrong prices in testing.
- The audit logic decisions — AI suggested recommendations that sounded plausible but didn't hold up to scrutiny (e.g., recommending a tool switch based on cost alone without considering use-case fit).
- The git commit messages — wrote every one manually.

**One specific time AI was wrong:** I asked Claude to verify Windsurf's pricing and it confidently stated Pro was $12/month. The actual price on windsurf.com was $15/month. I caught this because I was independently checking every price, not trusting the AI's recall. This reinforced the decision to verify all pricing data manually.

---

## 5. Self-ratings

**Discipline: 7/10** — I spread work across 7 days and committed daily, but Day 1 was lighter than it should have been. I underestimated how long PRICING_DATA.md and the entrepreneurial files would take and ended up compressing them into Day 6-7.

**Code quality: 7/10** — The audit engine is clean, well-tested, and the types are tight. The frontend component is a bit long (900 lines) and would benefit from decomposing into smaller components. The API routes could use better error typing.

**Design sense: 8/10** — The results page looks sharp. The hero savings number is immediately legible and the Credex CTA is contextual rather than pushy. The form is functional but could be more delightful — adding animated transitions between steps would improve it.

**Problem-solving: 8/10** — Debugged the hydration bug without external help, made good architectural decisions early (deterministic audit logic vs AI), and designed the savings categories to be honest rather than always manufacturing savings.

**Entrepreneurial thinking: 7/10** — The user interviews surfaced real insights (the CFO-sharing use case, the late-statement problem). The GTM is specific rather than vague. But I didn't have time to validate the Economics estimates beyond research — a real founder would pressure-test those conversion numbers more rigorously.
