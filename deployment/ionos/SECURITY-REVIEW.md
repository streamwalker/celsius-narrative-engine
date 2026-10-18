# Celsius IONOS release: security and verification scope

This release is a static frontend candidate for staging. It is not an attestation that the whole application or backend is vulnerability-free.

## Browser dependencies remediated

The release audit identified high-severity findings in the older router, Lodash and XML parser. The feature branch updates react-router-dom to 7.18.4, pins the transitive lodash version to 4.18.1, and pins @xmldom/xmldom to 0.8.15. The obsolete MemoryRouter v6 future flags were removed from the test harness as part of the router migration. Application type checking, all 79 frontend tests, 27 release-guard tests and the complete build are rerun with the changed lockfiles. Do not use an earlier, pre-remediation archive from this conversation.

Tailwind's animation plugin is consumed only by tailwind.config.ts, not application runtime code. It is correctly classified as a devDependency. This classification is backed by a production module-graph guard: Tailwind, its animation plugin, PostCSS, Chokidar, fast-glob, braces and glob must be absent from emitted JavaScript chunks or the build fails. Moving the classification does not repair vulnerabilities in the development tooling.

## Remaining moderate CLI dependency advisory

The npm production dependency audit still reports the Mammoth -> argparse -> sprintf-js chain for GHSA-hp3w-g68c-fv3c. The upstream advisory lists no patched sprintf-js release. The app uses Mammoth's browser library for document text extraction, not its command-line executable. The Rollup build checks that argparse and sprintf-js are absent from the actual emitted browser module graph and records the result in bundle-policy.json. Do not expose Mammoth's CLI as a server endpoint or feed it untrusted format strings. Do not force npm's suggested downgrade to an ancient Mammoth version.

The audit gate allows only that specific documented advisory chain when the module exclusion is verified. It rejects high/critical production dependency findings, new advisory IDs, an incomplete audit, and any other unreviewed production dependency finding. This is a scoped exception, not a claim that npm audit has zero findings.

## Development tools are not deployed

The complete dependency audit, including devDependencies, is retained as full-development-audit.json and may contain additional high/critical development-tool findings. Those are a separate maintenance backlog, not patched by this release. Build only trusted source in an isolated environment. Do not expose Vite's development or preview server to the public; IONOS receives only the compiled HTML, CSS, JavaScript and artwork. No Node.js server, source map, package directory, environment file or source tree is included in the upload archives. A hardened build-tool upgrade remains follow-on work.

## Backend and hosting checks still required

The existing auth service responds to read-only health/settings requests. That does not verify a real account login, email delivery, redirect allowlists, row-level security, storage policies or AI functions. The current connector could not access management settings for backend project jhtbircnacbdbixfzzkq. Access in its owning account is required before changing auth URL settings or declaring private user data protected.

IONOS contract, hostname, webspace directory, certificate and live server behavior are unverified until a specific target is supplied and configured. The Apache rules were exercised on a local Apache/HTTPS server, not the user's IONOS account. CI browser tests use a fresh browser profile and block external network requests; their report does not certify live backend workflows.

The staging archive uses noindex signals, which are not access controls. Apply directory password protection for private staging. Keep the existing live release intact and export browser-local author drafts before changing origin. Follow START-HERE.md for the final-domain acceptance checklist and rollback plan.

## Primary references

https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
https://github.com/advisories/GHSA-6gmq-8vp8-gcm6
https://github.com/advisories/GHSA-hp3w-g68c-fv3c
https://reactrouter.com/upgrading/v6
https://supabase.com/docs/guides/auth/redirect-urls
https://vite.dev/guide/static-deploy.html
