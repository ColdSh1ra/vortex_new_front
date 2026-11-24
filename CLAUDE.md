# Vortex site (vortex_new_front)

Marketing site for Vortex (https://crm-vortex.com): React 19 + TypeScript + Vite on the client,
Express 5 on the server, rendered server-side (SSR). Five languages: ua (default), en, pl, cz, sk.

## Layout

- `client/` — React app. Entries: `src/entry-client.tsx` (hydration), `src/entry-server.tsx`
  (`render()` + `loadBlogRoute()` used by the server). Routes in `src/routes/AppRouter.tsx`,
  pages in `src/pages/`, translations in `src/locales/` (`*.json`, plus `privacy/` and `integrations/`).
- `server/` — Express app, MVC: route → controller → service → model.
  - `src/app.js` builds the app (API, sitemap/robots, canonical redirects, static files, SSR).
    It does **not** listen; `src/server.js` calls `app.listen()` for local/VPS runs.
  - `src/services/cmsService.js` — content comes from the CMS API when `CMS_API_BASE_URL` is set,
    otherwise from the local file `server/data/vortex.json`.
  - Site form (`POST /api/trial-request`) → reCAPTCHA → Telegram + Director (`directorService.js`).
- `api/index.js` — Vercel serverless entry; just re-exports `server/src/app`.
- `shared/` — `site.json` (origin, language codes, static paths) used by client and server.
- `scripts/vercel-static.cjs` — copies the client build to `dist-vercel/` for Vercel's CDN.
- `docs/` — CMS API contract and handoff, SEO notes, plans.

## Commands (from repo root)

```bash
npm install && npm --prefix client install && npm --prefix server install
npm run dev            # server :5001 (nodemon) + Vite :5173 (proxies /api to :5001)
npm run build          # tsc --noEmit + client build (dist/client) + SSR build (dist/server)
npm run start:ssr      # build, then serve production SSR on :5001
npm run build:vercel   # build + copy static files to dist-vercel/
npm run vercel:check   # build, then run the function as Vercel ships it (traced files only,
                       # require(esm) off) and request every route — run before deploying
npm --prefix server test   # node --test server/test/*.test.js
```

Request/integration scripts (`requests:*`, `director:check`, `request:real`) are described in
README.md. `--live` runs send real Telegram messages and create real Director leads — don't run
them without being asked.

## Environment

Server env lives in `server/.env` (see `server/.env.example`): `TELEGRAM_BOT_TOKEN`,
`RECAPTCHA_SECRET_KEY`, `RECAPTCHA_ALLOWED_HOSTNAMES`, `CLIENT_ORIGINS`, `TRUST_PROXY`,
`CMS_API_BASE_URL`, `BLOG_API_BASE_URL`, `DIRECTOR_SITE_API`, `DIRECTOR_FORM_SECRET`, `BLOG_DEMO_MODE`.
Client build-time env lives in `client/.env`: `VITE_API_BASE_URL`, `VITE_RECAPTCHA_SITE_KEY`,
`VITE_BLOG_DEMO_MODE`. `VITE_*` values are baked into the bundle — never put secrets there.
Never commit `.env` files or print secret values.

## Vercel deployment

- Config in `vercel.json`: install all three packages, `npm run build:vercel`, serve `dist-vercel/`
  from the CDN, and rewrite everything else to the single function `api/index.js` (API + SSR).
- `index.html`, `robots.txt`, `sitemap.xml` and `.vite/` are intentionally left out of
  `dist-vercel/` — a static file would win over the function and skip SSR / generated routes.
- `functions["api/index.js"].includeFiles` must list everything the server reads at runtime
  (SSR bundle, HTML template, Vite manifest, locales, `server/data/vortex.json`, `shared/`).
  Globs like `client/dist/**` skip dot-directories, so `.vite/` is listed explicitly.
  If a page returns 503 on Vercel, check the function logs for `Page rendering failed`:
  ENOENT = a file missing from `includeFiles`; `CONTENT_UNAVAILABLE` = the CMS at `CMS_API_BASE_URL`
  is unreachable. A configured CMS never falls back to `vortex.json` (by design), so while the CMS
  is not live leave `CMS_API_BASE_URL` unset. As of 2026-11-23 both CMS hosts were not ready
  (HTTPS certificates issued for other domains, HTTP returns Apache 404 / an app error).
- The SSR bundle is imported with a literal path in `app.js` so Vercel's file tracer bundles it.
  `client/vite.config.ts` bundles React and react-router into it (`ssr.noExternal`): Vercel's
  tracer ships react-router's `index.mjs` but its runtime (no require(esm)) loads `index.js`.
- Vercel's runtime cannot `require()` ES modules: `jsdom` is pinned to 26.1.0 (newer versions pull
  in the ESM-only `@exodus/bytes`). Check new server dependencies with `npm run vercel:check`.
- Node 22 (`engines`). Serverless: filesystem is read-only and in-memory state is per instance.
- Env vars must be set in the Vercel project (server ones at runtime, `VITE_*` at build time).
  On Vercel set `TRUST_PROXY=1` rather than `loopback`, and add the production domain to
  `CLIENT_ORIGINS` and `RECAPTCHA_ALLOWED_HOSTNAMES`.

## Conventions

- Server is CommonJS; client is ESM/TypeScript. Server-facing user messages are in Ukrainian.
- After UI changes run `npm run build` (it type-checks) and check mobile/laptop/wide widths.
- Vertical rhythm tokens (`client/src/styles/base.css`): `--section-gap` between neighbouring blocks
  that share a background, `--block-gap` between separate blocks inside one section. The home page
  applies `--section-gap` per section pair at the end of `main.css` (scoped to `.home-route`).
