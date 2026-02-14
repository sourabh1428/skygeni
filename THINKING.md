# THINKING.md

## Assumptions made

- **Current quarter** is computed from the server's system date (e.g. Feb 2026 → 2026-Q1). No timezone or user preference; server locale is used.
- **Closed deals** = status `won` + `lost`. **Win rate** = won / (won + lost). If there are no closed deals, win rate is 0.
- **Stale deal** = open deal with `createdDate` more than 30 days ago (no `updatedDate` in schema, so creation date is used).
- **Low activity account** = account with no activity record in the last 14 days (activity `date` >= (today - 14 days)). Date comparison is string-based (ISO date) where applicable.
- **Target** is stored per quarter. The provided `targets.json` used monthly targets; the seed script aggregates by quarter (sum of months in each quarter). If the current quarter has no target row (e.g. 2026-Q1 when only 2025 data exists), `targetRevenue` is 0 and `gapPercent` is 0 to avoid division by zero.
- **Revenue trend:** A dedicated `GET /api/revenue-trend` endpoint returns last 6 months (`months`, `revenue`, `target`) so the dashboard can render a combined bar+line chart. Monthly target is derived from quarter target (target/3 per month).
- **Recommendations** are generated from risk factors and drivers only; 3–5 strings, no external ML or rules beyond the described logic.
- **Data path for seed:** When running `npm run seed` from `backend/`, `data/` is resolved as `../data` (repository root). JSON files must exist there.

## Data issues noticed

- **Schema mismatch with provided JSON:** The repo's JSON uses different field names than the initial plan:
  - Accounts: `account_id`, `industry` (we map `account_id` → id, `segment` used when present).
  - Reps: `rep_id` → id.
  - Deals: `deal_id`, `account_id`, `rep_id`, `stage`, `created_at`, `closed_at`. We map `stage` to status: "Closed Won" → won, "Closed Lost" → lost, else open. Some deals have `amount: null`; we treat as 0.
  - Activities: `activity_id`, `deal_id`, `timestamp`. We have no `accountId` in the activity file; we resolve `deal_id` → `account_id` via the deals data when seeding so that "low activity account" can be computed by account.
  - Targets: `month` (YYYY-MM) and `target`. We aggregate by quarter and create one Target per quarter.
- **Referential integrity:** Seed skips deals/activities when required foreign keys (e.g. accountId, repId) are missing. Activities whose `deal_id` does not exist in deals are skipped (no accountId to attach).
- **Dates:** Stored as strings (YYYY-MM-DD). No timezone normalization; comparisons and "last 14 days" use the server date.

## Tradeoffs chosen

- **In-memory vs SQL for some aggregates:** Summary and drivers use Prisma queries plus small in-memory steps (e.g. filtering by quarter, summing). Risk factors use a mix (groupBy for rep stats, then in-memory comparison to team average). Chosen for clarity and small dataset size; at scale, moving more into SQL would help.
- **Revenue trend:** Added `GET /api/revenue-trend` for a proper 6-month combined bar+line chart (revenue bars + target/trend line). Keeps the dashboard aligned with a professional CRM layout.
- **No React Query:** Plain `useState` + `useEffect` for data fetching to keep dependencies minimal and scope small.
- **Seed from repo-relative path:** Seed assumes it is run from `backend/` and reads `../data`. Documented in README so CI or other environments can run from the right place.
- **CORS:** Backend allows `http://localhost:5173` only. Sufficient for local dev with Vite proxy; production would need configurable origins.

## What breaks at 10x scale

- **Full table scans:** No pagination on risk-factors (stale deals, low activity accounts). Returning hundreds of rows will slow responses and the UI. Fix: add limits, pagination, or lazy-load sections.
- **N+1 or heavy queries:** Recommendations service calls risk-factors and drivers; risk-factors does multiple Prisma calls and in-memory loops. At 10x data, this could be slow. Fix: cache risk-factors/drivers per request, add DB indexes (e.g. on deal status + createdDate, activity date, accountId), consider materialized views or precomputed metrics.
- **SQLite:** Single writer, file-based. At 10x concurrent writes or size, consider PostgreSQL (or another server DB) and connection pooling.
- **No caching:** Every API call hits the DB. Fix: short TTL cache for summary/drivers, or background job that precomputes and stores metrics.
- **Frontend:** All data loaded on one page. With large risk tables, virtualize lists or paginate.

## What AI generated vs what was human decisions

- **AI-generated:** Project scaffolding, Prisma schema and seed script, API services and controllers, frontend API client and hooks, dashboard layout. UI was later refactored to Shadcn/Tailwind (header, dark summary strip, driver sparklines, risk/actions cards, combined revenue trend chart), plus `GET /api/revenue-trend` and D3 chart code. README and THINKING.md structure.
- **Human decisions (or would be in a real assignment):** Choice to support the existing repo JSON schema in the seed (field mapping, month→quarter aggregation, deal_id→accountId for activities), exact wording of recommendations in the service, handling of missing target (gap 0), and the content/framing of THINKING.md sections (assumptions, tradeoffs, scale).
