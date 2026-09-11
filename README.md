# Personal Command Center

A functional private finance dashboard based on the supplied BRD and visual reference. Built with React, TypeScript, Vinext/Vite, Recharts, accessible Base UI/Shadcn controls, Supabase, and Cloudflare Workers.

## Working features

- Financial overview with selectable reporting month, cash history, income allocation, priorities, obligations, receivables, runway, and savings goals.
- Personal/business/income ledger, gross and net W-2 entry, vendor rules, review queue, CSV preview, exact duplicate detection, transfer exclusion, and batch rollback.
- Fixed-value service invoices, draft editing/archival, sent/overdue/paid lifecycle, partial payments that create consulting income, and print-to-PDF invoice output.
- Monthly recurring bills, due calendar, and paid-bill expense creation.
- Needs/wants/savings budget allocation, configurable tax savings estimate, goal contributions, and goal editing.
- Client records with cash-margin drill-down and proposal pipeline.
- Deterministic insights and a clearly labeled three-month scenario.
- Gmail magic-link authentication, mandatory TOTP verification, account-scoped Supabase persistence, Row Level Security, input validation, and optimistic concurrency control.
- Private receipt bucket policies, append-only database audit events, JSON backup/restore, and CSV exports.
- Responsive layout and keyboard-accessible forms and navigation.

The initial records are clearly labeled samples. Start an empty workspace from Settings when ready.

## Intentional limitations relative to the full BRD

This version persists each user's validated workspace as a versioned Supabase document. It does not yet implement independent encrypted backups, receipt OCR, PDF statement parsing, email forwarding/digests, scheduled recurring generation, bank-format mapping profiles, near-duplicate reconciliation, infrastructure monitoring, document vaults, debts/assets, delivery tracking, or later tax intelligence. The tax feature is a configurable reserve percentage, not an IRS liability estimator. PDF export uses browser printing. No banking credentials are requested. CSV files are parsed in memory and only normalized records are saved.

Run the Supabase migration and configure an independent backup before using sensitive financial records.

## Development

Requires Node 22.13+ and npm.

```sh
npm install
npm run dev
npm run build
npx tsc --noEmit
node tests/model.test.mjs
```

Supabase migration: `supabase/migrations/202609110001_command_center.sql`. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` locally and as Cloudflare build variables. The publishable key is safe for browser use; never expose a secret or service-role key.

Supabase derives ownership from the signed-in JWT. Row Level Security requires both the matching user ID and an `aal2` MFA session. Concurrent stale writes preserve the newer cloud state; export pending changes before refreshing.

## Validation

TypeScript and the production build are checked. Model tests cover financial totals, partial/full payment recognition, overpayment rejection, transfer exclusion, soft deletion, quoted CSV parsing, duplicate fingerprints, backup round-trip, and invalid backup rejection. Local HTTP tests exercised authentication rejection, spoofed identity rejection, persistence/read-back, stale-write conflicts, and invalid-state rejection. Browser UI testing was not requested. Optional WebMCP scorecard-read and expense-prefill tools are feature-detected; no supported WebMCP validation context was available, so these are not claimed as verified.
