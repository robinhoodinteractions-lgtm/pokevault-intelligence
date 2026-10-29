# Release checklist

## Repository and build
- [ ] Inspect `git status --short --branch`, recent history, and the diff before editing or committing.
- [ ] Preserve existing project ownership, attribution, Git history, and black/gold/emerald design.
- [ ] `npm run check` passes on Node.js 22+.
- [ ] Build produces `dist/index.html`; generated `dist/` is not committed.
- [ ] GitHub Actions checks pass on the exact branch commit under review.

## Dashboard and mobile UX
- [ ] Catalogue search, category filter, quote-availability filter, and sorting work.
- [ ] Catalogue/category/quote/watchlist analytics update from actual local records.
- [ ] No market-wide statistics, portfolio valuations, or returns are inferred from the curated catalogue.
- [ ] Add/remove/clear watchlist and CSV export work; storage is accurately described as browser-local.
- [ ] Review keyboard focus, labels, status announcements, small-screen layout, and empty states on a phone.

## Market-data integrity
- [ ] Scrydex plan and current terms permit the intended use.
- [ ] Exact card IDs and returned variant/condition/currency are verified with a real provider response.
- [ ] Configure `SCRYDEX_API_KEY` and `SCRYDEX_TEAM_ID` in Netlify only.
- [ ] Missing, malformed, negative, ambiguous, or unsupported prices remain unavailable.
- [ ] Provider trends are shown only when returned as finite numbers.
- [ ] Provider retrieval time is not mislabeled as the underlying price observation date.
- [ ] No PokéVault-owned history, returns, or performance metrics are claimed unless dated observations and methodology are implemented.

## Inquiry form
- [ ] Confirm the Formspree endpoint is controlled by the project owner.
- [ ] Review validation, honeypot, success/failure messaging, and privacy guidance.
- [ ] Submit one clearly labeled test inquiry when ready to create a real submission.
- [ ] Verify the submission in Formspree and check email/notification delivery separately.

## Netlify and security
- [ ] Build command is `npm run build`, publish directory is `dist`, and functions directory is `netlify/functions`.
- [ ] Node.js runtime and CI use Node.js 22.
- [ ] Security headers and Content Security Policy are reviewed against the actual deployed site.
- [ ] Deploy a draft preview and inspect the build log.
- [ ] Verify `/.netlify/functions/card-prices` both without credentials and with authorized credentials.
- [ ] Open the preview and check it on mobile; test the form and watchlist.
- [ ] Production deploy is performed only after explicit owner approval and then verified at the public URL.

## Commercial and legal clarity
- [ ] Proposed paid services are labeled proposed; no checkout is represented as active.
- [ ] Affiliate links are not described as approved until approval and the correct link exist.
- [ ] Pokémon trademark/non-affiliation disclosure remains visible.
- [ ] No secrets, personal submissions, or credentials are included in source control or public build output.
