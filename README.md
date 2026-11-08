# AT Digital Hub — landing page

Company landing page for **AT Digital Hub** (Cebu, Philippines): Swiss Red visual direction, server-rendered content, a few small client components, and an inquiry form that only goes live once email delivery is configured.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Motion for React · Lucide icons · Inter (self-hosted via `next/font/local`)
- **No** database, CMS, auth or custom backend. The only server code is one Server Action that emails an inquiry.
- **Package manager:** pnpm (pinned in `package.json` → `packageManager`). Node ≥ 20.9.

## Local development

```bash
pnpm install
cp .env.example .env.local   # optional for local work; every value can stay empty
pnpm dev                     # http://localhost:3000
```

Without credentials the contact form renders **disabled with a "temporarily unavailable" notice** — it never fakes success.

| Script | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev server / production build / serve the build |
| `pnpm typecheck` | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) |
| `pnpm lint` | ESLint (`eslint-config-next` core-web-vitals + TypeScript) |
| `pnpm test` | Vitest + Testing Library (interaction and server-logic tests) |

> TypeScript is pinned to 5.9 and ESLint to 9: `typescript-eslint` currently supports TypeScript `<6.1`, so TypeScript 7 is intentionally not used.

## Project structure

```
src/app/            layout, page, globals.css, robots.ts, sitemap.ts, icon.svg, apple-icon, opengraph/twitter images
src/components/
  layout/           site-header (client: scroll state + mobile menu), site-footer
  sections/         hero, services, product, process (+ process-tabs client), about, contact (+ contact-form client)
  previews/         HTML/CSS product illustrations (synthetic data, labelled as such)
  ui/               button, section heading, wordmark, JSON-LD, ServiceLink
src/lib/
  site-config.ts    company facts, product name, optional external URLs (single source of truth)
  content.ts        typed section content (services, product, process, about, nav)
  indexing.ts       site URL + "may this deployment be indexed?" policy
  structured-data.ts  Organization JSON-LD
  contact/          schema (shared validation), delivery (server-only provider), inquiry (server logic), actions
```

**Renaming the product family:** change `siteConfig.product.name` in `src/lib/site-config.ts`; the UI, previews, metadata and form options all derive from it.

**Module availability:** each product module in `src/lib/content.ts` has an `availability` field (`unspecified` | `planned` | `in-development` | `available`). `unspecified` shows no status, so nothing implies a module is live. Set real values once confirmed.

## Environment variables

See [`.env.example`](.env.example). Nothing is committed with real values.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Production: yes** | Canonical origin (e.g. `https://www.your-domain.com`). A production build **fails** without it instead of guessing a domain. |
| `ALLOW_INDEXING` | Self-hosting only | Set `true` on the single production deployment when *not* on Vercel. Leave unset on Vercel. |
| `RESEND_API_KEY` | For the form | Server-only. Never prefix with `NEXT_PUBLIC_`. |
| `CONTACT_FROM_EMAIL` | For the form | Sender on a domain verified with Resend. `address` or `Name <address>`. |
| `CONTACT_TO_EMAIL` | For the form | Inbox(es) receiving inquiries. Comma-separated, max 5. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No (recommended) | Cloudflare Turnstile site key. The form shows a CAPTCHA **only when both** Turnstile keys are set. |
| `TURNSTILE_SECRET_KEY` | No (recommended) | Server-only Turnstile secret, used to verify each token. Never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Shown as a direct contact option **only if set**. |
| `NEXT_PUBLIC_UNEXORO_URL` | No | Renders an "Explore Unexoro" button **only if set** (https). |
| `NEXT_PUBLIC_LINKEDIN_URL` / `_FACEBOOK_URL` / `_GITHUB_URL` | No | Footer links and Organization `sameAs`, **only if set**. |
| `NEXT_PUBLIC_PRIVACY_URL` / `_TERMS_URL` | No | Footer policy links, **only if set**. |

`NEXT_PUBLIC_*` values and the contact-form availability are read **at build time** (the page is statically rendered and refreshed daily). After changing any variable, **redeploy**.

### Per-environment guidance (Vercel)

| Variable | Production | Preview | Development |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Set** to the real domain | Leave unset (falls back to the preview URL) | Unset |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Set | Optional. If set, previews send real email — use a test inbox, or leave unset so the form stays disabled | Unset |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Set | Set if the form is enabled in previews (add the preview host to the widget's hostnames, or use Cloudflare's test keys) | Unset, or Cloudflare's test keys |
| Optional public details | As available | Same as production if you want to review them | Unset |

## Contact delivery setup (Resend)

1. Create a Resend account and **verify your sending domain** (DNS records).
2. Create an API key. Add `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (an address on the verified domain) and `CONTACT_TO_EMAIL` in Vercel → Project → Settings → Environment Variables (Production).
3. Redeploy. The form enables itself when all three are present and well-formed.
4. Send a real test inquiry from the deployed site and confirm the email arrives and that **Reply** goes to the visitor.

How it behaves:

- Server Action validates **every** field on the server (shared schema in `src/lib/contact/schema.ts`), rejects control characters in single-line fields, and treats all input as untrusted. Mail is plain text; the visitor's address is used as `Reply-To` only — never as the sender.
- All provider-specific code lives in `src/lib/contact/delivery.ts` (`server-only`). Swapping providers means replacing that one file.
- **Duplicate protection:** the submit button is disabled while pending, and each attempt carries an `Idempotency-Key` so a retried request can't deliver twice.
- **Bot friction:** an invisible honeypot field and a minimum fill time (3 s, measured in the browser and checked on the server) filter naive automated posts.
- **CAPTCHA (optional, recommended):** when both Turnstile keys are set, the form shows a Cloudflare Turnstile challenge and the send button stays disabled until it passes. The server verifies the token (provider code lives in `src/lib/contact/captcha.ts`) only after the input is valid, and fails closed: if Cloudflare can't be reached, nothing is sent and the visitor is asked to retry. Tokens are single-use, so the challenge resets after every attempt. Without the keys the form works with the honeypot and fill time only.
  - Setup: Cloudflare dashboard → Turnstile → **Add widget**, add your production domain (and any preview host) as hostnames, Managed mode. Copy the site key and secret into the two variables above and redeploy.
- **Rate limiting is not in code.** Add a Vercel Firewall rate-limit rule (Project → Firewall → Rules): match `POST` requests to `/`, e.g. 5 requests per 10 minutes per IP, action *Deny* (or *Challenge*). Server Action submissions are `POST`s to the page path, so this doesn't affect normal browsing.
- Failures are logged as `{ reason, status }` only — never names, email addresses or message text. A failed delivery shows an error (and the direct email if one is configured); success is shown only after the provider accepts the message.
- Without JavaScript the form cannot be completed (the timing field needs a script); the rest of the page, including navigation, works.

## Deploying to Vercel

Not deployed by this repository's setup. When you are ready:

1. Push to a Git provider and **Import Project** in Vercel (framework auto-detected; default build settings).
2. Add the environment variables above. Set `NEXT_PUBLIC_SITE_URL` for Production.
3. **Domain:** Project → Settings → Domains → add your domain and follow the DNS instructions. Pick one canonical host (e.g. `www`) and redirect the other to it, then use that exact origin as `NEXT_PUBLIC_SITE_URL` — canonical, Open Graph, sitemap and JSON-LD URLs all derive from it.
4. Deploy, then run the post-deploy checks below.

### Preview / staging indexing

Search engines may index **only** the production deployment. A deployment is indexable when `VERCEL_ENV === "production"` **and** `NEXT_PUBLIC_SITE_URL` is a valid URL (self-hosted: `NODE_ENV=production` + `ALLOW_INDEXING=true`). Everywhere else — Vercel previews, branch deployments, local builds — the site is `noindex` through four layers:

- `<meta name="robots" content="noindex, nofollow">`
- `robots.txt` → `Disallow: /`
- an empty `sitemap.xml`
- an `X-Robots-Tag: noindex, nofollow` response header

Custom domains attached to a *Preview* environment inherit this too. Optionally also enable Vercel's Deployment Protection for previews.

### Post-deploy checklist

- `https://<domain>/robots.txt` allows crawling and lists the sitemap; `…/sitemap.xml` lists the home page.
- View source: canonical, `og:image`, `twitter:image` and JSON-LD use the production domain; no `noindex` meta.
- Validate the social preview with the platforms' debuggers; check the Organization JSON-LD in the Rich Results Test.
- Submit a real inquiry end to end (see above).
- Submit the sitemap in Google Search Console / Bing Webmaster Tools.

## Before launch — missing inputs

| Item | Why it's needed |
| --- | --- |
| Logo-derived assets | The header, footer and Organization JSON-LD use the approved logo (`public/images/logo.png`, trimmed to `public/brand/logo.png` plus a white-lettering `logo-on-dark.png`). The favicons (`public/favicon-light.ico`, `favicon-dark.ico`) are the supplied files, served by colour scheme. The Apple touch icon is still an interim red "AT" monogram and the social preview (`opengraph-image.tsx`) is generated from text. Replace both with logo-based versions. If the logo changes, regenerate the two files in `public/brand/`. |
| Real Unexoro screenshots | All product visuals are **illustrative HTML/CSS with sample data**, labelled "Illustrative concept · Sample data." Swap in real, approved screenshots (use `next/image` with set dimensions) and drop the label when they are real. |
| Production domain | Required as `NEXT_PUBLIC_SITE_URL`. |
| Email delivery details | Verified sending domain, Resend API key, destination inbox. |
| Spam protection | Cloudflare Turnstile site key and secret; a Vercel Firewall rate-limit rule. |
| Public contact details | Optional: public email, social profiles, privacy policy and terms. A privacy policy is advisable because the form collects personal data. |
| Unexoro product URL | Optional; no "Explore Unexoro" button is shown until it exists. |
| Confirmed module status | Optional: set each module's `availability` in `content.ts` when verified. |
| Content review | Process explanations, engineering principles and the connected-workflow copy are drafted to the brief; confirm they match how you actually work. |

Not included by design: live chat (Anya AI can be added later once an integration exists), analytics, cookie banner, and a Content-Security-Policy (Next.js inline scripts need a nonce-based policy; add one if your compliance needs require it).
