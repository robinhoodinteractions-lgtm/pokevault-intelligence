# PokéVault Intelligence — environment configuration

## Required only for live price estimates

Configure these in Netlify Site configuration → Environment variables. Do not place real values in source files or commit them.

- `SCRYDEX_API_KEY` — API key from your Scrydex account.
- `SCRYDEX_TEAM_ID` — team ID from the same account.

The API adapter remains in an explicit unconfigured state when either value is missing. It never substitutes demo prices.

Official documentation:
- Authentication: https://scrydex.com/docs/getting-started/authentication
- Pokémon card endpoint and variants: https://scrydex.com/docs/pokemon/cards
- Price fields and conditions: https://scrydex.com/docs/getting-started/prices

Scrydex documents raw price records with a numeric `market`, three-letter currency and condition (NM, LP, MP, HP or DM). The current dashboard intentionally displays only raw Near Mint quotes and labels the underlying provider timestamp as unavailable because the documented raw price object does not specify a per-quote observation timestamp. `checked_at` is the time PokéVault retrieved the response, not the date the provider market estimate was calculated.

Before enabling production pricing, confirm your plan/credits, current provider terms, and that these quote fields are returned for the account's plan.
