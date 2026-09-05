# September 2026 site audit follow-up

This change follows the full English/French site audit against main
`c7569011b2a52546282ca034f0ff678b95cfba64`. It fixes the configuration and usability
problems without changing region boundaries, broker accounts, or deployment targets.

## Changes by audit finding

| Finding | Implemented change | Verification |
|---|---|---|
| A01 — Radio defaults | Configurator and observer commands preserve current radio/hash settings. Explicit Canada and BC Mesh profiles come from the community source. | Profile unit tests and bilingual command-generation journeys. |
| A02 — Broker slots | Helpers reuse Canada slots or choose free slots; unrelated connections survive. No-room failures leave the file untouched. Backups are unique. | Bash/PowerShell empty, one-line, occupied, existing, full, rerun, and restore fixtures. |
| A03 — Map handoff | Location, shared/extra paths, firmware, and radio choices reach configuration. Invalid saved locations offer recovery. | Bilingual map-to-config tests. |
| A04 — Language state | Map/config language links preserve supported selections, not arbitrary query fields. | Language-switch journey and source-page validation. |
| A05 — Ambiguous searches | Partial registry matches no longer block city lookup; genuine ambiguous matches offer selectable results. | Québec geocoder fixture and Victoria choices. |
| A06 — Observer role | Repeating defaults off and is separate from observing. Existing MQTT slots 3–6 are no longer cleared. | Command-builder tests and bilingual role/glossary review. |
| A07 — Region clarity | Shorter labels distinguish routing regions from coverage and radio networks; results link to communities. | Result/handoff journeys and source review. |
| A08 — Accessible tools | Theme-aware map surfaces and focus colours; province browsing is collapsible. Map controls no longer need a nested scrollbar, and the keyboard skip link cannot overlap buttons. | Light/dark focused-control contrast checks and desktop/mobile page sweep. |
| A09 — Fewer setup detours | Direct setup buttons precede checklists; unrelated automatic next-role links are removed. First-message steps precede app tracing. | Setup/content tests and existing route/anchor checks. |
| A10 — Language | Shorter EN/FR setup and maintenance wording; corrected observer definitions and byte labels. | Bilingual content checks and runtime journeys. |
| A11 — Region standard | Operator quick start precedes technical rules; draft status and incomplete network adoption are explicit. | Content/anchor checks; no authority edits. |
| A12 — Directory | Update links carry the exact community and page. Labels separate listing review from link checks. All 24 listings remain. | Generated-data validation and feedback-prefill tests. |
| A13 — Feedback | Title, description, and public acknowledgement are sufficient. Source-page context survives preview and submission. | Client/server schema tests, simulated submissions, older-gateway fallback. |
| A14 — Flashing | Erase and DFU steps are conditional; bootloader verification refers to the selected release, not a contradictory fixed version. | Content safety tests; no hardware was flashed. |
| A15 — Hardware wording | Removed an unverified antenna-length claim; distinguished shopping-basket costs from per-device cost; shortened French and maintenance prose. | Content review; experimental-build warnings remain. |
| A16 — Broker reference | Broker table is generated into HTML and works without JavaScript. Access inventory and existing admins remain linked. | Static-table and no-JavaScript browser tests. |
| A17 — Contributor/testing gaps | Added a contributor README, safety regressions, and mobile map/editor performance coverage. The interactive map loads automatically when visible, keeping its large display layer out of text-only lookups. | Existing quality workflow with downloadable Lighthouse reports; budgets are unchanged. |

The wording pass is targeted, not a claim that every sentence needed rewriting.
Existing URLs, community contributions, downloadable build files, and unresolved
safety warnings are retained.

## Required rollout order

The anonymous submission gateway deploys separately from the static site.
Deploy its backward-compatible change first and verify that `/config` reports
`communityIdeaOptionalDetails: true`; then publish the site. See the
[gateway runbook](../tools/region-proposal-gateway/README.md#short-form-rollout-order).
An older gateway cannot accept the shorter payload, so the site offers copy/GitHub
fallbacks instead of attempting a failing anonymous submission. The boundary-editor
contract is unchanged. No deployment is part of this PR.

## Human confirmations still needed

- **Regional maintainers:** formal adoption of the registry and the decision on
  boundary proposal #63. Published data is not evidence of network-wide adoption.
- **Community contacts:** current local radio profiles, overlap between communities,
  missing contact/language details, and the scope of earlier verification dates.
  No new verification dates or associations are invented here.
- **Build contributors:** exact hardware revisions, schematics, safe readings,
  climate limits, and reproduction evidence for the unfinished solar guides.
  The 1 W guide remains experimental; software checks do not certify hardware.
- **Infrastructure operators:** subscriber authentication details and retention/
  deletion policy. This PR does not change credentials or promise a retention period.

## Review checklist

- Inspect explicit Canada/BC Mesh commands and keep-current defaults.
- Check the map → configuration → French journey on a phone and desktop.
- Review short-form feedback in both languages, including the originating page.
- Confirm the gateway rollout prerequisite before merging for publication.
- Read the actual quality-workflow result for this PR; this document describes
  coverage and does not substitute for a passing run.
