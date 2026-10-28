POKÉVAULT INTELLIGENCE — NETLIFY STARTER
========================================

FILES
- index.html: responsive static website with showcase search/sort, session-only watchlist, FAQs, and inquiry form.
- deploy-pokevault.sh: interactive Netlify CLI deployment helper.
- README.txt: these instructions.

IMPORTANT LIMITATIONS
- No deployment has been performed by this package.
- The site has no live market data, user accounts, payment processing, analytics backend, or database.
- Showcase entries are research topics, not live quotes or verified investment recommendations.
- The Formspree endpoint https://formspree.io/f/meaaobbq was supplied for this project. Test it and verify submissions in the Formspree dashboard before public launch.
- Netlify authentication and site selection may be required during first deployment.
- This site is independent and is not affiliated with Pokémon rights holders. No guaranteed returns.

TERMUX
1. Install Termux packages:
   pkg update
   pkg install nodejs
2. Extract this ZIP to a folder, then cd into that folder.
3. Run:
   chmod +x deploy-pokevault.sh
   npx --yes netlify-cli login
   ./deploy-pokevault.sh
4. Select production only when ready and type DEPLOY when prompted.

UBUNTU
1. Install prerequisites:
   sudo apt update
   sudo apt install -y nodejs npm unzip
2. Extract this ZIP and cd into the extracted folder.
3. Run:
   chmod +x deploy-pokevault.sh
   npx --yes netlify-cli login
   ./deploy-pokevault.sh

Netlify documentation:
https://docs.netlify.com/cli/get-started/

After deploying:
- Open the URL printed by Netlify and test on mobile.
- Submit the contact form and verify receipt in Formspree.
- Check the site’s title, links, and wording before sharing publicly.
