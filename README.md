# Personal Command Center

Private financial dashboard hosted on Cloudflare Workers with Supabase authentication, MFA, account-scoped persistence and private receipt storage.

Production: https://personal-command-center.bjungtamu.workers.dev
GitHub: https://github.com/bjgurung/personal_command_center

## Free capture and insights release

- Reviewed text entry for common expense/income phrases and bill/invoice drafts.
- CSV column mapping, debit/credit and date formats, saved statement-header profiles, bad-row review and duplicate warnings.
- Browser Tesseract image OCR and PDF.js text-PDF extraction. Maximum receipt size 10 MB; PDF limit 10 pages. Scanned PDFs require an image upload. OCR drafts require review; no accuracy guarantee.
- Private receipt uploads and signed viewing links. JSON backups contain references only: download receipt files separately.
- Account balance checks, transfer/card-payment records, refund handling and personal/business labels.
- Monthly bill skip/restore, template editing and explicit existing-payment matching.
- Past/present/future report, source records, 30/60/90-day projections, invoice delay, cash buffer, variable spending, additional income and one-time purchase scenarios.
- Goal estimates, printable report, insight snooze/dismiss, backup restore preview, recoverable local pending snapshots and pause after save errors.
- New accounts start empty; existing data is retained.

## Validation and limits

Run `npx tsc --noEmit`, `node tests/model.test.mjs`, `node tests/capture.test.mjs`, and `npm run build`.
Authenticated browser and cross-device tests remain pending owner sign-in. OCR quality and live receipt storage are not claimed verified. Configured accounts drive usable cash; legacy opening cash applies only without accounts. Unconfigured account labels are flagged as incomplete data. No paid service or subscription is enabled. Free-tier quotas still apply.

The revised BRD (`docs/command-center-brd-v4.html`) preserves original requirements and documents partial/planned features explicitly. Original v3 is retained in `docs/command-center-brd-v3.html`.

## Setup

Use Node 22.13+ and npm. Copy `.env.example` to `.env.local` and configure the public Supabase URL and publishable key. Never use a secret/service-role key in browser code. The initial SQL migration was applied September 11, 2026. Cloudflare build variables mirror these values; main-branch pushes trigger deployment.

Storage ownership comes from Supabase JWT and RLS requires AAL2. Local pending snapshots are scoped to the signed-in user and cleared after successful saves. A conflict pauses saving; export/review recovery before reloading.


## Unified financial views and navigation (BRD v5)

Home now defaults to All with Personal and Business filters on the same layout. Desktop navigation has visible icon labels; mobile More includes descriptions. Scope and period are preserved in URL drill-downs. See `docs/command-center-brd-v5.html` for current behavior, migration guidance and the changed spending-based runway definition.

Run `node tests/scope.test.mjs` alongside the existing model/capture tests. Scope edits from filtered views merge into full state. Unassigned records remain in All until reviewed; missing scoped balances are not represented as zero.
