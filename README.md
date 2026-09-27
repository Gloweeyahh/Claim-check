# CLAIMCHECK

A digital health-literacy intervention: users type a health claim, then work
through a five-stage PAUSE → IDENTIFY → CHECK → VERIFY → DECIDE process.

Claim entry is manual only — there's no link/URL submission or social-platform
scraping. The VERIFY stage still does real, live evidence retrieval: an AI
call turns the claim into search queries, which hit PubMed's E-utilities API
and (if configured) a WHO/CDC-restricted Google Programmable Search Engine.
A second AI call then synthesizes the verdict strictly from what was actually
retrieved — it's instructed never to invent outside facts, and to answer
"unclear" whenever the evidence is too thin to judge.

## Structure

```
claimcheck/
  client/   React + Vite frontend
  server/   Express backend (evidence retrieval + AI assessment API)
```

## Setup

### 1. Backend

```
cd server
npm install
cp .env.example .env
```

Edit `.env` and add:
- `GEMINI_API_KEY` — from aistudio.google.com/apikey, free tier, no card needed, powers claim analysis and the final assessment
- `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` — optional, powers the live WHO/CDC evidence search. Without these, `/api/verify` still works using PubMed alone.
- `NCBI_API_KEY` — optional, raises PubMed's rate limit

```
npm run dev
```

Runs on http://localhost:5000.

### 2. Frontend

```
cd client
npm install
cp .env.example .env
npm run dev
```

Runs on http://localhost:5173 and calls the backend at the URL in `.env`.

## What's real right now

- Manual claim entry — the only input path, fully wired, no mocks
- PAUSE and CHECK stages — real client-side logic, not mocked
- VERIFY stage — a real AI call (Gemini) turns the claim into search queries, which
  hit PubMed's E-utilities API for real (free, no key needed) and, if configured,
  a Google Programmable Search Engine restricted to who.int/cdc.gov
- DECIDE stage — a second AI call synthesizes the verdict, "why", and sources
  strictly from the evidence actually retrieved
- Timeouts everywhere in the pipeline (each external call, plus an overall
  45s cap on `/api/verify`) so a slow or unresponsive API fails with a real
  error instead of hanging the UI forever
- A "Try again" retry button on the Verify/Decide stages if a check fails —
  including a specific message for the common Render free-tier case (the
  server waking up from sleep taking longer than the request)

## Analyzing usage

Every real verify call writes a row to a `checks` table in Supabase (claim text,
claim type, verdict, headline, evidence count, timestamp — no names, no IPs). To look at it:

- **Browse it visually:** Supabase dashboard → your `claimcheck` project →
  **Table Editor** → `checks`. Works fine from a phone browser, no SQL needed.
- **Quick stats:** Supabase dashboard → **SQL Editor**, e.g.:
  ```sql
  select verdict, count(*) from checks group by verdict;
  select claim_type, count(*) from checks group by claim_type order by 2 desc;
  ```

Logging is optional and fails silently if `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` aren't set — verify still works either way.

**Before collecting real users' claims for your practicum analysis:** check
with your MPH supervisor about informed consent / ethics approval. This logs
what people typed, which counts as data from human participants even without
names attached.

## A tradeoff worth knowing

Since evidence retrieval is now purely automated (no user-submitted link to
anchor it), the AI's search-query generation step carries a bit more weight —
if it picks poor search terms for an ambiguous claim, PubMed/WHO/CDC may come
back with little relevant evidence, and the assessment should (and is
instructed to) fall back to "unclear" in that case rather than guess.

## Next step

Some real gaps worth tackling next:
- Rate limiting / caching on `/api/verify` — every check currently makes 2 AI calls
  plus several evidence-source calls; caching by claim text would cut cost and latency
  for repeat checks
- Basic tests for the evidence and AI service functions
- Deployment (Netlify for the client, Render for the server) — already live; see
  the deployment steps covered earlier in the project conversation
