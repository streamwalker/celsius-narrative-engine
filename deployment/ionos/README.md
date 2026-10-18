# Celsius · IONOS deployment kit

## Release scope

This is the FULL compiled React/Vite Celsius frontend, including Story Architect, not the earlier standalone HTML preview. The intended host is **IONOS Linux Web Hosting (Apache 2.4)** with the document root of a domain or subdomain assigned to a dedicated release directory. A domain-only plan, a MyWebsite editor slot, and an IIS/Windows plan are not equivalent targets. Verify the actual contract before upload.

The existing Supabase-compatible backend project is **jhtbircnacbdbixfzzkq**. Authentication, existing cloud projects, file storage and AI Edge Functions stay there. This package neither migrates the database to IONOS nor deploys Edge Functions. Do not switch to a similarly named Supabase project. The new Story Architect remains browser-local and requires JSON backups; moving the frontend does not add cloud synchronization.

**No live domain or webspace directory was selected or changed when preparing this kit. Public launch remains gated on the final-domain checks below.** No database or AI provider credentials are included. The built JavaScript contains the existing public client key, as intended; protection of private records still depends on server-side authorization and Row Level Security. Those controls are not proved by a successful frontend build.

## Files

- `Celsius-IONOS-Staging.zip`: first upload. Sends noindex headers and a disallow-all robots file. This discourages indexing but DOES NOT make the site private. Use IONOS directory password protection for private review.
- `Celsius-IONOS-Publish.zip`: same compiled app, without staging-wide noindex. Use only after launch acceptance.
- `SHA256SUMS.txt`: SHA-256 hashes for the two archives.
- `build-report.json`: build timestamp, source revision and remaining acceptance items.
- `check-live.py`: read-only HTTP/MIME/routing verification from your computer; no external Python packages.
- CI may also include `backend-check.json` and `dependency-audit.json`. The former checks public auth service reachability only, not an account login. An unavailable/incomplete audit is not a clean audit.

Each upload archive has `index.html`, `.htaccess`, `404.html`, `robots.txt`, `release.json`, favicon and `assets/` at its root. **Upload its extracted CONTENTS, including `.htaccess`, not the ZIP itself and not the outer deployment-kit directory.** Never upload repository source, `.env` files, `node_modules/`, SQL or this guide to public webspace.

## Safe upload and review

1. Confirm the exact domain/subdomain and IONOS Linux hosting contract. Do not repoint any existing HeroLinc, Streamwalkers, PicPoppit or client site based on its name alone. Export browser-local drafts first. Browser storage is scoped to origin: a different subdomain or HTTP-to-HTTPS change will not automatically bring those drafts along.
2. Record the current domain target and DNS records. Preserve the old site in its original directory. Create a NEW, empty directory, for example `/celsius/releases/RELEASE-ID-staging`. This is a proposed filesystem layout, not a confirmed account path.
3. Extract the staging archive locally and upload all its contents through Webspace Explorer or SFTP. Include dotfiles. In macOS Finder, Command-Shift-period toggles hidden-file visibility. Verify `index.html` and `.htaccess` are siblings and `assets/` is present.
4. Activate SSL for the review hostname before connecting it to the release directory. The supplied `.htaccess` redirects HTTP to HTTPS. It assumes TLS terminates at IONOS/Apache; do not place it behind a non-TLS/Flexible proxy without reviewing that configuration. It does not trust arbitrary forwarded headers.
5. In IONOS domain settings, connect the confirmed REVIEW hostname to the new release directory. A webspace directory is a server location, not a URL subpath. This build is for `https://HOST/`, not `https://HOST/celsius/`. Preserve unrelated DNS records, especially MX/TXT mail records. Do not replace all DNS records or install WordPress for this app.
6. In the EXISTING backend authentication settings, add the exact review-origin redirect URLs actually used by Celsius. The current app sends email/magic-link confirmation back to `https://HOST/`. Keep existing production redirect entries and Site URL unchanged during staging. This chat's Supabase connector could not access this particular backend project, so URL configuration and live RLS review remain pending in the backend's owning account/Cloud dashboard.
7. Run the HTTP checker and the signed-in acceptance below. A staging robot block is not an authorization mechanism. Do not advertise the staging app as a finished public release.

## Acceptance checklist before publishing

- Valid HTTPS certificate; HTTP redirects to the intended host without a loop. Pick one canonical production hostname. Do not redirect to a guessed domain.
- `python3 check-live.py https://CONFIRMED-HOST --profile staging` passes. Replace the host with the actual one; never supply credentials on the command line.
- `/`, `/story-architect`, `/narrative-engine`, `/library`, `/characters`, `/terms`, `/privacy` and a nested route load directly and after refresh. The browser has no missing-JavaScript or MIME errors.
- Story Architect: create a disposable local story; edit it; reload the page; close and reopen the browser; export JSON; import it as a separate story. Confirm title and world edits survive. Export real work before changing origin.
- A real test user can sign in and sign out. Signup confirmation, magic links, password reset and any configured third-party login return to the final allowed origin. Do not send bulk test mail or create new production users automatically.
- A real authorized test user can view an existing permitted cloud project and save a disposable one; a second test user cannot access another user's private project. Public static sample artwork is not private backend data. Live RLS, role and storage-policy review must pass.
- Run one intentionally approved AI/formatting request and one file-upload/reading test; confirm authorization, billing limits and error handling. AI requests may consume credits. The deployment script deliberately does not do this automatically.
- Verify mobile layout and all customer-critical tools. Existing large-bundle/browser-data build warnings are not hidden. Dependency findings must be triaged; a build alone is not a security assessment.
- Review the existing legal pages, contact/support details and claims before a public launch. This kit does not certify their accuracy.

## Publish and roll back

After acceptance, create a DIFFERENT empty production release directory, upload the extracted publish archive, and verify its files/checksum. Connect the confirmed production domain to that directory only at the approved cutover. Update the backend Site URL to the canonical HTTPS production origin at cutover and keep required redirects. Run `python3 check-live.py https://CONFIRMED-HOST --profile production` and repeat the real sign-in/AI acceptance on that origin.

Do not mix staging and publish files or copy over an old directory containing stale files. Do not serve `/src` or run `vite preview` as the production web server. Hashed JavaScript/CSS are cached for one year; HTML/release metadata revalidate. Users with an already-open old tab may need a refresh after a release switch. Keep the prior release directory intact for rollback. Rollback means reconnecting the domain to the prior directory and restoring the previous auth URL configuration where necessary; do not delete the backend database. Local story exports protect author data independently of frontend rollback.

A frontend upload is NOT a backend migration and does not move uploaded art/database records. Keep the existing backend services and credits active.

## Rebuild from the review branch

Use Node.js 22, the repository's locked dependencies and the existing public frontend configuration. No private provider keys belong in a VITE variable. In a checkout containing the committed configuration:

```sh
bun install --frozen-lockfile
bunx tsc --noEmit -p tsconfig.app.json
bunx vitest run
node --test scripts/ionos/release.test.mjs
node scripts/ionos/release.mjs
node scripts/ionos/check-backend.mjs
```

The last two commands produce `ionos-release/`. The ZIP command is required (included with typical macOS/Linux systems). Never upload `.env` files: the public configuration is compiled into the app. A different authorized backend requires deliberate configuration and migration planning; the release guard otherwise rejects a project mismatch. The guard decodes legacy key claims but does not verify the JWT signature; the online reachability check tests server acceptance separately.

## Official references checked during preparation

- IONOS domain-to-directory requirements: https://www.ionos.com/help/domains/connecting-a-domain-to-your-webspace/connecting-a-domain-to-a-webspace-directory/
- IONOS Webspace Explorer: https://www.ionos.com/help/hosting/managing-webspace-with-webspace-explorer/what-is-the-webspace-explorer/
- IONOS Apache rewrite behavior: https://www.ionos.com/help/hosting/htaccess/notes-on-creating-rewrite-rules/
- IONOS HTTPS prerequisites and redirects: https://www.ionos.com/help/ssl-certificates/tips-for-setup-and-use/automatically-redirect-visitors-to-ssl-secured-site/
- Vite static deployment: https://vite.dev/guide/static-deploy.html
- Existing-backend retention with external frontend hosting: https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership
- Supabase auth redirects: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase public keys and RLS: https://supabase.com/docs/guides/database/secure-data
