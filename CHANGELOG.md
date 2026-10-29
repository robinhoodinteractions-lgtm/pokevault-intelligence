# Changelog

## 1.1.0 — research dashboard hardening

- Added a research dashboard with curated catalogue count, valid quote coverage, and local watchlist count.
- Expanded card research entries with set and card-number metadata; sample topics are clearly differentiated from verified quotes.
- Added category and quote-availability filters plus sorting by name, category, and set.
- Persisted the local watchlist using localStorage and added CSV export.
- Added server-side Scrydex adapter with required credentials, timeout handling, raw NM quote filtering, strict numeric/currency validation, validated provider trend windows, exact variant labeling, and unavailable states.
- Added protection against ambiguous multi-variant quotes.
- Replaced placeholder npm test command with Node's built-in test runner and syntax checks.
- Added security response headers and documented environment variables.
- Preserved original project identity and existing Formspree endpoint; delivery remains unverified.
