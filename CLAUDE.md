# sonoted-www

Marketing site for SoNoted at sonoted.ai. Built with Astro 6 + React islands + Tailwind CSS v4. Deployed on Railway.

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # add RESEND_API_KEY and INVITE_NOTIFY_EMAIL
pnpm dev
```

## Architecture

- **Astro 6 + Node adapter** -- `@astrojs/node` in standalone mode. Static pages are pre-rendered; API routes (`src/pages/api/`) add `export const prerender = false` to opt into SSR. Production entry point: `node dist/server/entry.mjs`.
- **React islands** -- interactive components (invite form, animations) use `client:load` or `client:visible`. Everything else is Astro (zero JS by default).
- **Tailwind CSS v4** -- configured via `@tailwindcss/vite` (no `tailwind.config.*` file). All design tokens are CSS custom properties defined in `src/styles/global.css`.

## Commit Gate

Before every commit:

1. `/simplify`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm build`
5. `pnpm format:check`

## Naming Conventions

- **Named exports only** in `.ts` and `.tsx` files. Astro `.astro` files and `src/pages/` are exempt (Astro requires default exports there).
- **No `any` types** -- use `unknown` + type narrowing.
- **Typed errors** -- extend a base `AppError` if needed. No bare `throw new Error('string')` in API routes.
- **No hardcoded hex/rgb values** outside `src/styles/global.css` token definitions.

## File Structure

```
public/          -- Static assets (favicon, og image)
src/
  components/    -- Astro and React components
    ui/          -- Primitive components (Button, Badge, Section)
  layouts/       -- Base.astro wraps every page
  pages/         -- Astro pages + API routes (src/pages/api/)
  styles/        -- global.css (Tailwind import + token definitions)
```

## GitHub

- **Never use the `gh` CLI** -- it authenticates as the wrong account.
- Use the GitHub API with PAT from git remote: `TOKEN=$(git remote get-url origin | sed 's|https://[^:]*:\([^@]*\)@.*|\1|')`
- Repo: `bsimpson96/sonoted-www`
- Project board: SoNoted (#1) -- same board as the main API

## Multi-Agent Workflow

Follows the same patterns as `seahawk/docs/MULTI-AGENT.md`. For this repo the parallel split is:

- Design system + Hero (#2, #3) in parallel with Invite form + API route (#5, #6)
- Domain config (#7) is independent infrastructure

## Security

- API route `/api/invite`: honeypot check before Zod parse. No PII in logs. Rate limiting via Vercel edge middleware.
- No email addresses in URLs or log output.
- `RESEND_API_KEY` must never be committed. It lives in `.env.local` (gitignored) and Railway environment variables.
