#!/usr/bin/env bash
set -euo pipefail

echo "=== PokéVault Intelligence deployment ==="

if ! command -v netlify >/dev/null 2>&1; then
  echo "Netlify CLI is missing."
  echo "Install it with: npm install -g netlify-cli"
  exit 1
fi

if [ ! -f index.html ]; then
  echo "ERROR: index.html was not found."
  exit 1
fi

if [ ! -f netlify.toml ]; then
  echo "ERROR: netlify.toml was not found."
  exit 1
fi

echo "Checking Netlify authentication..."
netlify status

echo "Review the project before publishing."
echo "This command publishes to production."
read -r -p "Deploy to production now? Type DEPLOY to continue: " confirm

if [ "$confirm" != "DEPLOY" ]; then
  echo "Cancelled. No production deployment attempted."
  exit 0
fi

netlify deploy --prod --dir=.
