# MeshCore Canada UI/UX overhaul status

This file records the durable delivery and review contract for PR #66. Live
candidate evidence belongs in the pull request because the preview runtime can
change without a source edit.

## Baseline and scope

- Repository: `MeshCore-ca/MeshCore-Canada`
- Pull request: #66
- Integration branch: `agent/ui-ux-overhaul`
- Reconciled `main` commit: `99e8406fcc5d2d27ffbbcad54115e651917af371`
- Folded community-update source: PR #75 at `a47dfbc`
- Folded community submission: issue #78
- Production target after review and merge: `https://meshcore.ca/`
- Isolated review target: `https://canadaverse.org/meshcore-canada/`
- Review host: the existing Pi 5 `splashpage` service

## Delivery posture

PR #66 is deliberately consolidated. It is ready for maintainer review after
its exact candidate passes CI and the Pi 5 preview gate. Reviewer approval is
still required for the human-review items below, and preview work does not
authorize a production `meshcore.ca` deployment.

The preview is a complete no-index build, not a second content source. A preview
is accepted only when its manifest revision matches the pushed PR head, its
artifact digest matches the deployed files, and the running container records
both values. A reachable URL by itself is not deployment proof.

## Implemented overhaul

| Area | Result |
|---|---|
| Information architecture | Task-oriented Start, About, Tools, community, configuration, hardware, and contribution journeys |
| Homepage | Two primary goals, role routes, automatic local-first place lookup, and direct help/community paths |
| Community directory | 23 validated structured listings; province pages generated from `data/communities.json` |
| PR #75 | Five Alberta listings, refreshed YQL details, all 26 submitted URLs, and the national 3-byte StoonMesh baseline folded into the structured source |
| Issue #78 | Active Charlevoix (YML) listing, La Malbaie search aliases, public contact, verified website, and matching French copy |
| Search and privacy | Place searches use local region data first, then external geocoders when needed; the region map loads OpenStreetMap tiles automatically and documents the request in the privacy guide |
| Configuration tools | Accessible workbench, clearer editor containment, and preserved command/region semantics |
| Operations content | Named service credits, repeater loop-detection guidance, and current SenseCAP cable paths restored |
| Delivery | Separate strict production/preview builds, preview-wide noindex, deterministic artifact manifest, subpath-aware checks, and cache-busted custom assets |
| Accessibility | Keyboard-operable header/search, mobile labels, footer fallbacks, palette/contrast checks, and automated axe journeys |

## Automated evidence

The branch gates validate page metadata, bilingual parity, generated community
pages, region authority, proposal automation, browser journeys, accessibility,
responsive layouts, strict builds, links, and Lighthouse budgets. Exact counts,
CI runs, image identity, and public-route evidence are recorded on PR #66 for
the pushed candidate and rerun whenever its head changes.

## Protected behaviour

The overhaul must not change:

- region catalog or membership semantics;
- command generation, ordering, limits, or path meanings;
- fixed-anchor, jurisdiction, hierarchy, or geography invariants;
- proposal v1/v2 schemas or signed canonical payload behaviour;
- gateway permissions, signature domains, idempotency, or approval actors; or
- deterministic regeneration and fail-closed deployment checks.

Any diff in those outputs is a release blocker unless separately approved by
the appropriate maintainers.

## Preview deployment gate

The Pi 5 preview must satisfy every item below before it is reported live:

1. Build once from the pushed PR-head commit with that exact revision in
   `site-manifest.json`.
2. Confirm all preview pages are no-indexed and the preview sitemap is empty.
3. Recompute the manifest artifact digest from the deployed files.
4. Record the Git revision and artifact digest as container-image labels.
5. Validate Caddy configuration and run a production-equivalent canary first.
6. Apply subtree-wide `no-store` cache headers and `X-Robots-Tag: noindex,
   nofollow`.
7. Prove critical routes, assets, CSP behaviour, manifest identity, and the
   unrelated Canadaverse root before and after cutover.
8. Retain the pinned rollback image until public browser validation finishes.

## Human review register

PR #66 can be ready for review while these remain reviewer responsibilities.
They still block merge approval until the appropriate maintainers accept them:

- hardware, electrical, RF, product, price, and firmware facts;
- community ownership, status, language, contact freshness, or missing
  verification dates;
- region names, boundaries, hierarchy, or authority decisions;
- reviewed French technical and safety translations;
- analytics and privacy-retention policy;
- the complete mobile, keyboard, forced-colour, and assistive-technology
  experience; or
- the final production merge, DNS, firewall, secrets, and rollback decision.

Those items remain explicit review gates even when CI and the Pi preview pass.
