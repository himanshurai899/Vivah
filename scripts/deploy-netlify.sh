#!/usr/bin/env bash
set -euo pipefail

# Deploys the repo to Netlify using the site name 'vivah-wedding-os'.
# Requires NETLIFY_AUTH_TOKEN to be set in the environment.

SITE="vivah-wedding-os"

if [ -z "${NETLIFY_AUTH_TOKEN:-}" ]; then
  echo "ERROR: NETLIFY_AUTH_TOKEN is not set. Export your token and retry."
  echo "You can create a personal access token at https://app.netlify.com/user/applications#personal-access-tokens"
  exit 1
fi

echo "Deploying to Netlify site: $SITE"

# Use npx so users don't need a global install. --yes accepts installing if needed.
npx --yes netlify-cli deploy --prod --dir=. --site="$SITE" --auth="$NETLIFY_AUTH_TOKEN"

echo "Deploy finished. Visit https://vivah-wedding-os.netlify.app to view the site (may take a few seconds to update)."
