@echo off
REM Deploy repository to Netlify site 'vivah-wedding-os' using npx netlify-cli
IF "%NETLIFY_AUTH_TOKEN%"=="" (
  echo ERROR: NETLIFY_AUTH_TOKEN is not set.
  echo Create a personal access token at https://app.netlify.com/user/applications#personal-access-tokens
  exit /b 1
)

set SITE=vivah-wedding-os

echo Deploying to Netlify site: %SITE%

npx --yes netlify-cli deploy --prod --dir=. --site=%SITE% --auth=%NETLIFY_AUTH_TOKEN%

echo Deploy finished. Visit https://vivah-wedding-os.netlify.app
