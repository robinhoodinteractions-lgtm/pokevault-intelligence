# Android / Termux development guide

These instructions are designed for an Android phone, including an Infinix device. The repository is the source of truth; this guide does not assume a desktop computer.

## 1. Check the tools

Open Termux from a trusted Termux distribution and run:

```bash
pkg update
pkg install git nodejs
node --version
npm --version
git --version
gh auth status
```

The project targets **Node.js 22 or newer**. If `node --version` reports an older major version, update Termux packages before running the checks. Never paste a GitHub token or provider key into chat, a source file, or a screenshot.

## 2. Clone the repository or inspect your existing copy

If you do not already have a clone:

```bash
git clone https://github.com/robinhoodinteractions-lgtm/pokevault-intelligence.git
cd pokevault-intelligence
```

If you already have the project, enter its actual folder and inspect it before changing branches:

```bash
cd ~/pokevault-intelligence
git status --short --branch
git remote -v
git log -5 --oneline
```

If your folder has another name or location, use that path instead. Do not overwrite uncommitted work. Save or commit it before switching branches.

## 3. Review the current research-dashboard branch

```bash
git fetch origin
git branch --all
```

If the feature branch is not already local:

```bash
git switch --track origin/feat/research-dashboard-data-quality
```

If it is already local:

```bash
git switch feat/research-dashboard-data-quality
git pull --ff-only
```

Only switch when your working tree is clean or your changes are safely saved. Review the branch and diff before committing or merging.

## 4. Run tests and build

From the repository root:

```bash
npm run check
```

This runs serverless-function syntax checks, static HTML/JavaScript checks, automated tests, and the build. The build creates `dist/index.html`; `dist/` is generated output and should not be committed.

Optional individual checks:

```bash
npm test
npm run build
git diff --check
git status --short
```

## 5. Preview on your phone

For a simple static preview:

```bash
npx --yes serve dist
```

Open the local address printed by Termux in the browser on the same phone. Press `Ctrl+C` in Termux to stop the server. This preview does not execute Netlify Functions, so prices will remain unavailable.

To test the website with its Netlify Function locally:

```bash
npx --yes netlify-cli login
npx --yes netlify-cli dev
```

Open the local URL printed by Netlify CLI. Without Scrydex environment variables, the function should return a safe unconfigured response and the interface should not invent prices.

## 6. Make a small change safely

```bash
git status --short --branch
git switch -c feat/describe-your-change
# Edit files with your preferred Termux editor.
npm run check
git diff --check
git diff
```

Review every changed file, then commit only the intended files:

```bash
git add index.html netlify.toml package.json README.txt tests scripts
git status --short
git commit -m "Describe the PokéVault improvement"
git push -u origin feat/describe-your-change
```

Open a pull request and review it before merging. Never add `.env`, API keys, access tokens, or real customer submissions to Git.

## 7. Configure a Netlify draft deploy

If this repository is not already linked to the intended Netlify site, run:

```bash
npx --yes netlify-cli login
npx --yes netlify-cli status
npx --yes netlify-cli link
npm run build
npx --yes netlify-cli deploy --dir=dist --functions=netlify/functions
```

Select the intended site when prompted. The last command creates a **draft deploy**, not a production release. Open the draft URL, review the build log, and test the page and function before considering production.

The repository configuration uses:
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node.js: 22
- Security headers, including a Content Security Policy that allows the existing inline UI and Formspree request.

Do not use `--prod` until you have reviewed the draft and explicitly decided to publish.

## 8. Configure live pricing safely

Only if you have a valid Scrydex account and have confirmed your plan permits the intended use, add `SCRYDEX_API_KEY` and `SCRYDEX_TEAM_ID` in Netlify's environment-variable settings. Keep values out of source code, terminal screenshots, and Git history. Redeploy if Netlify requires it, then test `/.netlify/functions/card-prices`. Without valid credentials or a valid unambiguous quote, the UI should show prices as unavailable.

## 9. Verify the inquiry form

The existing form posts to the project's configured Formspree endpoint. A successful browser response does not prove email delivery. When ready to create a real test submission, use a clearly labeled test inquiry, then verify the submission in the Formspree dashboard and check notification delivery separately. Do not submit private or payment information.

## 10. Production release rule

Use a draft deploy first. Confirm automated checks, mobile layout, search/filters, watchlist persistence and CSV export, function behavior, security headers, and form receipt. Publish to production only after the project owner has reviewed the preview and explicitly approved the production action.
