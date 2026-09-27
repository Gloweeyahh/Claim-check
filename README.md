# CLAIMCHECK

A digital health-literacy intervention: users submit a URL or type a health claim,
then work through a five-stage PAUSE → IDENTIFY → CHECK → VERIFY → DECIDE process.

This is the Step 3 scaffold — the AI claim-analysis layer and real evidence
retrieval (PubMed + WHO/CDC) are wired into `POST /api/verify`, and the
frontend's Verify and Decide stages now render whatever comes back from that
call instead of static sample content.

## Structure

```
claimcheck/
  client/   React + Vite frontend
  server/   Express backend (content extraction API)
```

## Setup

### 1. Backend

```
cd server
npm install
cp .env.example .env
```

Edit `.env` and add:
- `YOUTUBE_API_KEY` — free, from Google Cloud Console (enable "YouTube Data API v3", no OAuth needed for public metadata/comments)
- `GEMINI_API_KEY` — from aistudio.google.com/apikey, free tier, no card needed, powers claim analysis and the final assessment
- `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` — optional, powers the WHO/CDC evidence search (see the comments in `.env.example` for setup). Without these, `/api/verify` still works using PubMed alone.

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

- Manual claim entry — fully wired, no mocks
- Link entry — general public webpages are actually scraped (title/description/body)
- YouTube links — actually pulled via the YouTube Data API (title, description, top comments)
- Facebook/Instagram links — hit the documented fallback (no scraping API exists for
  either without app review; see the conversation history / practicum notes for why)
- PAUSE and CHECK stages — real client-side logic, not mocked
- VERIFY stage — a real AI call (Gemini) turns the claim into search queries, which
  hit PubMed's E-utilities API for real (free, no key needed) and, if configured,
  a Google Programmable Search Engine restricted to who.int/cdc.gov
- DECIDE stage — a second AI call synthesizes the verdict, "why", and sources
  strictly from the evidence actually retrieved (it's instructed never to invent
  outside facts, and to answer "unclear" when evidence is thin)

## Analyzing usage

Every real verify call writes a row to a `checks` table in Supabase (claim text,
source type, claim type, verdict, headline, evidence count, timestamp — no
names, no IPs). To look at it:

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

## Next step

Some real gaps worth tackling next:
- Rate limiting / caching on `/api/verify` — every check currently makes 2 AI calls
  plus several evidence-source calls; caching by claim text would cut cost and latency
  for repeat checks
- Better claim extraction for scraped webpages (currently just the page title —
  could ask the AI layer to pull the actual claim out of the body text instead)
- The TikTok Research API integration, pending application approval
- Basic tests for the evidence and AI service functions
- Deployment (Netlify/Vercel for the client, Render/Railway for the server)
