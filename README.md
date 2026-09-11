# Personal Command Center

A functional private finance dashboard based on the supplied BRD and visual reference. Built with React, TypeScript, Vinext/Vite, Recharts, accessible Base UI/Shadcn controls, and Cloudflare D1 through Sites.

## Working features

- Financial overview with selectable reporting month, cash history, income allocation, priorities, obligations, receivables, runway, and savings goals.
- Personal/business/income ledger, gross and net W-2 entry, vendor rules, review queue, CSV preview, exact duplicate detection, transfer exclusion, and batch rollback.
- Fixed-value service invoices, draft editing/archival, sent/overdue/paid lifecycle, partial payments that create consulting income, and print-to-PDF invoice output.
- Monthly recurring bills, due calendar, and paid-bill expense creation.
- Needs/wants/savings budget allocation, configurable tax savings estimate, goal contributions, and goal editing.
- Client records with cash-margin drill-down and proposal pipeline.
- Deterministic insights and a clearly labeled three-month scenario.
- Account-scoped cloud persistence with input validation and optimistic concurrency control; JSON backup/restore and CSV exports. Financial archives remain in the backup.
- Responsive layout and keyboard-accessible forms and navigation.

The initial records are clearly labeled samples. Start an empty workspace from Settings when ready.

## Intentional limitations relative to the full BRD

This is a working dashboard implementation, not completion of every BRD rollout phase. Sites account access and D1 replace the specified owner-managed Supabase/Postgres deployment. The current database persists each user's validated workspace as a versioned document, rather than the BRD's full normalized schema. It does not implement Supabase TOTP/RLS/Vault, immutable server audit history, independent encrypted backups, receipt OCR, PDF statement parsing, email forwarding/digests, scheduled recurring generation, bank-format mapping profiles, near-duplicate reconciliation, infrastructure monitoring, document vaults, debts/assets, delivery tracking, or later tax intelligence. The tax feature is a configurable reserve percentage, not an IRS liability estimator. PDF export uses browser printing. No banking credentials are requested. CSV files are parsed in memory and only normalized records are saved.

Configure the production security and independent backup controls before using sensitive financial records. Private Sites hosting alone is not the BRD's Supabase/TOTP security model.

## Development

Requires Node 22.13+ and npm.

```sh
npm install
npm run dev
npm run build
npx tsc --noEmit
node tests/model.test.mjs
```

Database definition: `db/schema.ts`. Migrations: `drizzle/`. Runtime logical binding: `DB` in `.openai/hosting.json`. Sites applies the bundled migrations during deployment. To initialize a local database, apply the SQL migration with Wrangler to the same `.wrangler/state` directory used by the preview. Local preview provides the built-in `/signin-with-chatgpt?return_to=%2F` sign-in.

The API requires the trusted Sites authenticated-user header; never expose the Worker directly outside the Sites identity boundary. It ignores client-supplied user IDs in record payloads and scopes all queries to the server-provided identity. Concurrent stale writes return HTTP 409 and preserve the newer cloud state; export pending changes before refreshing.

## Validation

TypeScript and the production build are checked. Model tests cover financial totals, partial/full payment recognition, overpayment rejection, transfer exclusion, soft deletion, quoted CSV parsing, duplicate fingerprints, backup round-trip, and invalid backup rejection. Local HTTP tests exercised authentication rejection, spoofed identity rejection, persistence/read-back, stale-write conflicts, and invalid-state rejection. Browser UI testing was not requested. Optional WebMCP scorecard-read and expense-prefill tools are feature-detected; no supported WebMCP validation context was available, so these are not claimed as verified.
