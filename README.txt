POKÉVAULT INTELLIGENCE
======================

Independent Pokémon TCG collector research workspace. Preserve the existing black, gold and emerald brand identity and project ownership.

## Current implementation

- Responsive single-page interface with a curated card research catalogue.
- Client-side search, category and quote-availability filters, and sorting.
- Watchlist saved in this browser's localStorage with remove, clear and CSV export.
- Netlify Function adapter for Scrydex raw Near Mint market estimates. It is server-side and does not expose API credentials to browser code.
- Pricing remains unavailable until SCRYDEX_API_KEY and SCRYDEX_TEAM_ID are configured in Netlify. No demo prices are displayed.
- Inquiry form still uses the project's existing Formspree endpoint. Browser acceptance is not proof of email delivery; test and confirm in the provider dashboard.
- Provider 7/30/90-day trend percentages are shown only when Scrydex returns finite values. PokéVault does not store its own price history.
- The adapter refuses to select arbitrarily when more than one card variant has a valid raw Near Mint quote.
- No accounts, cloud-synced watchlists, payment system, affiliate approval, database, or stored price history is implemented.

## Development (Node.js 18+)

Run in the repository root:

    npm run check

This checks server syntax, static HTML/inline JavaScript, and automated tests.

For a local preview, run:

    npx --yes netlify-cli dev

Open the local URL printed by the CLI. The serverless price endpoint requires Netlify Dev or a deployed Netlify site; a basic static server will show unavailable prices.

## Android / Termux

    pkg update
    pkg install git nodejs
    cd ~/PokeVault/pokevault-intelligence
    git status --short --branch
    npm run check
    npx --yes netlify-cli dev

If your folder path differs, run `pwd` and `ls` first and change into your actual cloned repository. Back up any local edits before switching branches. Do not paste credentials into chat or source files.

## Netlify configuration

Netlify reads `netlify.toml`, runs `npm run build`, publishes only the generated `dist/` directory, and discovers functions in `netlify/functions`. This keeps project documentation, tests, scripts, and environment examples out of the published static directory. Configure the two Scrydex variables in Netlify's environment settings only if live pricing is desired. The inquiry form requires a real submission test and verification in Formspree's submission dashboard.

Use a deploy preview after the feature branch is pushed and connected to Netlify. Production deploys should wait until preview, form delivery and pricing credentials have been verified.

## Data integrity

A Scrydex raw NM market estimate is not a completed sale, appraisal, or guaranteed resale amount. Retrieval time is labeled separately from the provider's quote timestamp. Missing or malformed prices remain unavailable. The curated catalogue count is not a market-wide statistic and the project does not claim investment returns.

## Ownership and provenance

Repository: https://github.com/robinhoodinteractions-lgtm/pokevault-intelligence
Project owner and original author: Robin Hood / repository account robinhoodinteractions-lgtm.
Preserve existing Git history, attribution, and independent-project/trademark disclosures. PokéVault Intelligence is not affiliated with or endorsed by Pokémon rights holders.
