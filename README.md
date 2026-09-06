# MeshCore Canada

Community documentation and network tools for [meshcore.ca](https://meshcore.ca/),
in English and French. Built with MkDocs Material and small browser scripts.

## Work locally

Use Python 3.13 and Node.js 22.19 or newer. From the repository root:

```sh
python -m pip install -r requirements-docs.txt
npm ci
npm run docs:build
python -m http.server 4173 --bind 127.0.0.1 --directory .tmp/site
```

Open `http://127.0.0.1:4173/`. Rebuild after editing. Build output belongs in
`.tmp/`, not in a commit. `npm run docs:build:preview` builds for subpath hosting.

## Where to make changes

- Pages: `docs/`. Update each English `.md` and French `.fr.md` pair; retain old
  heading anchors when changing titles.
- Navigation, theme, and shared templates: `mkdocs.yml` and `overrides/`.
- Community listings: `data/communities.json` and `data/communities.fr.json`.
  Run `python scripts/validate-communities.py --write` after editing the source.
  It generates the directory pages and `docs/assets/radio-profiles.json`.
- Region tools: `docs/assets/regions/` and `docs/config/editor/`.
  Follow the boundary proposal workflow; do not hand-edit generated geography.
- Broker settings: `docs/analyzer/observer-config.json`. The build generates the
  broker reference table from this file, including its no-JavaScript version.
- Anonymous submissions: `tools/region-proposal-gateway/`. The site and gateway
  deploy separately; check the gateway README before changing their contract.

Never commit credentials, private keys, precise private locations, or test
submissions containing personal information. Human maintainers review changes
before publication; an automated test is not hardware or policy approval.

## Check a change

```sh
python scripts/validate-content.py
python scripts/validate-communities.py
python scripts/validate_community_submission.py
python -m unittest discover -s tests/content -p "test_*.py"
npm run test:content
npm run test:editor
npm run check:links
npx playwright install chromium firefox webkit
npm run test:browser
npm run audit:lighthouse
```

The broker-helper tests need Bash and PowerShell (`pwsh`); on Windows they use
Git Bash. They run in temporary directories, do not install software, and never
connect to a real broker. Browser submission tests intercept requests locally.

For region, gateway, or automation changes, also run:

```sh
python -m pip install -r scripts/requirements-regions.txt
python -m pip install -r tools/region-proposal-gateway/requirements.txt
node scripts/validate-regions.cjs
python scripts/verify-region-geometry.py
python scripts/verify-region-geometry.py --partition docs/assets/regions/canada-region-partition-digital.geojson
python -m unittest discover -s tools/region-proposal-gateway/tests
python -m unittest discover -s tests/automation
```

The quality workflow runs these checks on pull requests. Publishing is a separate
reviewed workflow; opening a PR does not authorize deploying it or changing brokers.
See [the September audit follow-up](maintenance/site-audit-2026-09-04.md) for the
current fixes, test coverage, and confirmations still needed from maintainers.
