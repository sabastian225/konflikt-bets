# Prop Intelligence — NBA & NFL

A Next.js dashboard designed for Vercel. ESPN supplies daily matchups, rosters and athlete game logs. The Odds API optionally supplies current sportsbook player-prop prices.

## Run locally

1. Install Node.js 20+.
2. Run `npm install` and `npm run dev`.
3. Open http://localhost:3000.
4. Optionally copy `.env.example` to `.env.local` and enter `ODDS_API_KEY` from https://the-odds-api.com/.

## Deploy free on Vercel

1. Upload this project to a GitHub repository.
2. On https://vercel.com/new import the repository, choose Next.js, and deploy.
3. Add `ODDS_API_KEY` in Project Settings → Environment Variables, then redeploy.
4. Vercel Hobby plan limits and external API usage/fees apply. Odds player-prop markets may require a paid Odds API tier.

## Computation

The engine considers only regular-season games before the selected date. It finds the **highest observed positive integer threshold** where at least 90% of available season games meet/exceed the threshold and each of the last five games meets/exceeds it. Minimum sample size: 10 games. Different stat categories are analyzed separately. A = >=95%, B = >=92%, C = >=90%. These are *descriptive grades*, not forecast probabilities. Missing game logs must never be interpreted as zeros. ESPN endpoints are undocumented and may change. Some rosters and game logs may fail; the dashboard displays a warning when requests fail.

## Odds comparison

The Odds API player props use half-point lines. The dashboard displays the best available **Over** odds only when the sportsbook line is strictly below the historical qualifying threshold, and identifies the bookmaker. For example, a historical 20+ points threshold can compare with Over 19.5, but not Over 20.5. This is not an EV model. Implied probability includes bookmaker margin and is not a true probability. Odds are separate from ESPN data. The app does not assert a profitable bet.

## Limitations / production checklist

- ESPN unofficial endpoints are not guaranteed to remain accessible or keep the same schema. Verify game-log field mapping against actual API payloads before relying on results.
- ESPN may use different stat labels and nested game-log structures for NBA/NFL. Validate both sports with representative player profiles.
- NBA player props and NFL props may not be covered by a free Odds API subscription. Missing odds show as unavailable rather than invented.
- Odds provider quotas: each event/market request may incur costs. Cache responses and monitor quota usage.
- The live data integration has not been verified against the real ESPN endpoints in this execution environment; consider this an implementation starter, not a production-certified scanner.
- Add persistent cache, injury filters, stat-source validation, rate limiting and scheduled background ingestion for reliable daily large-roster processing.
- Vercel serverless timeouts may be exceeded on large NBA slates; a background job and database are recommended for production.


## Repair notes (November 2026)
- Corrects NBA ESPN season numbering: 2026-27 season uses `season=2027`.
- Supports grouped and flat ESPN roster payloads.
- Reports roster and game-log failures separately.
- The site still requires live verification against ESPN endpoints and may be rate-limited.
- Deploy updated files to the same GitHub repository to trigger Vercel.

## Adjustable consistency filters

The dashboard now includes two sliders: season hit rate (0–100% in 5% steps) and last-five hit rate (0–100% in 20% steps). Default values remain 90% and 100%. Changing either slider triggers a new dashboard API request, recalculating the highest qualifying threshold for every player/stat. Minimum season sample remains 10 games. Last-five rate is computed from exactly five played games. Example: 80% = at least four of the last five games. The dashboard API accepts `seasonPct` and `recentPct` query parameters.
