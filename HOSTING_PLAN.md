# Vivah Free Hosting Plan

This project is currently a static HTML, CSS, JavaScript, and JSON app. That makes it a good fit for free static hosting.

Recommended path: GitHub Pages from a public GitHub repository.

## Hosting Goals

- Make the app accessible to family members and collaborators through a public URL.
- Keep hosting free while the app remains a static site.
- Keep deployment simple enough to update through normal Git commits.
- Avoid backend, database, or account-login complexity until Phase 4.

## Important Privacy Note

The current app stores wedding data in JSON files under `data/`. If the repository or deployed site is public, those JSON files are public too.

Before publishing, replace real names, phone numbers, addresses, travel details, budgets, and vendor contacts with demo data, or use a private hosting workflow that does not expose sensitive information.

## Recommended Option: GitHub Pages

GitHub Pages is the best first option because this repository is already static and does not need a build step.

Official docs:

- GitHub Pages: <https://pages.github.com/>
- GitHub Pages limits: <https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits>

### Why GitHub Pages Fits

- Free for public repositories on GitHub Free.
- Works well for static sites with `index.html`.
- Supports HTTPS.
- Gives a shareable URL like `https://username.github.io/repository-name/`.
- Can use a custom domain later.
- No server maintenance.

### Constraints

- Public repository content is visible to everyone.
- Static only: no secure login, server-side editing, or private database.
- Not suitable for sensitive transactions or private wedding operations data.
- GitHub Pages is intended for static websites, documentation, portfolios, and project sites, not commercial SaaS hosting.

## GitHub Pages Deployment Steps

1. Create a GitHub repository named `vivah` or `Vivah`.
2. Push this project to the repository.
3. In GitHub, open the repository settings.
4. Go to `Pages`.
5. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Save the settings.
7. Wait for GitHub to publish the site.
8. Open the generated Pages URL.

Expected URL format:

```text
https://<github-username>.github.io/<repository-name>/
```

For example:

```text
https://himanshu.github.io/Vivah/
```

## Pre-Deployment Checklist

- Confirm `index.html` is in the repository root.
- Confirm all asset paths are relative, such as `assets/css/styles.css`.
- Confirm JSON files load from relative paths under `data/`.
- Remove or anonymize private wedding data.
- Test locally with:

```powershell
node dev-server.mjs
```

- Open:

```text
http://localhost:8080
```

- Verify dashboard, guests, vendors, finance, functions, and CSV export.

## Suggested Repository Settings

For a public demo:

- Repository visibility: `Public`
- Data: demo or anonymized only
- GitHub Pages source: `main` branch, `/root`
- Branch protection: optional
- Issues: optional

For real wedding operations:

- Repository visibility: `Private`
- Avoid GitHub Pages unless using a paid GitHub plan or a different private deployment option.
- Do not expose real guest, travel, hotel, vendor, or finance data in public JSON files.

## Free Alternatives

### Cloudflare Pages

Official docs:

- Cloudflare Pages: <https://pages.cloudflare.com/>
- Cloudflare Pages limits: <https://developers.cloudflare.com/pages/platform/limits/>

Good fit when:

- You want fast global static hosting.
- You want generous free static hosting limits.
- You may later use Cloudflare DNS or a custom domain.

Current free-plan notes from Cloudflare docs include 500 builds per month, one concurrent build, 20,000 files per site, and a 25 MiB maximum size for a single asset.

Recommended if GitHub Pages path handling becomes inconvenient.

### Netlify

Official site:

- Netlify pricing: <https://www.netlify.com/pricing/>

Good fit when:

- You want drag-and-drop deploys or Git-based deploy previews.
- You want an easy custom-domain setup.
- You may later need simple forms or serverless functions.

Watch-outs:

- Free usage has monthly limits.
- Sites can be paused if free-plan limits are exceeded.

### Vercel

Official docs:

- Vercel plans: <https://vercel.com/docs/accounts/plans>
- Vercel limits: <https://vercel.com/docs/limits/overview>

Good fit when:

- The project later moves to React, Next.js, or another frontend framework.
- You want strong Git-based preview deployments.

Watch-outs:

- The current vanilla static app does not need Vercel-specific features.
- Hobby plan limits and team or organization restrictions should be checked before relying on it.

## Recommendation Matrix

| Option | Best For | Main Concern | Recommendation |
| --- | --- | --- | --- |
| GitHub Pages | Simple public static site | Public repo/data visibility | Use first |
| Cloudflare Pages | Static site with generous edge hosting | Another platform to configure | Best alternative |
| Netlify | Easy previews and forms | Free usage limits | Good alternative |
| Vercel | Framework apps and previews | More than this app currently needs | Use later if the stack changes |

## Deployment Plan for Vivah

### Phase A - Public Demo

- Replace current JSON with safe sample data.
- Publish from GitHub Pages.
- Share the GitHub Pages URL with family or testers.
- Keep edits Git-based.

### Phase B - Semi-Private Sharing

- Keep the repository private.
- Use a hosting provider that supports private repository deploys on its free tier.
- Still avoid storing highly sensitive data in client-side JSON.
- Share the generated deployment URL only with intended users.

### Phase C - Real Multi-User App

When the app needs real login, private data, and collaborative editing:

- Add authentication.
- Move JSON data into a protected database.
- Add an API layer.
- Host frontend and backend separately or use a full-stack platform.
- Treat this as part of Phase 4, not the current static deployment.

## Git Commands

Use these after creating the GitHub repository:

```powershell
git add .
git commit -m "Add Vivah hosting plan"
git branch -M main
git remote add origin https://github.com/<github-username>/<repository-name>.git
git push -u origin main
```

If the remote already exists:

```powershell
git remote set-url origin https://github.com/<github-username>/<repository-name>.git
git push -u origin main
```

## Final Recommendation

Use GitHub Pages for the first hosted version if the deployed app contains demo data only.

Use Cloudflare Pages if you want a stronger free static-hosting alternative with generous limits.

Do not publish real wedding operations data through public static JSON files. Move to authentication and a protected backend before using this for sensitive live planning.
