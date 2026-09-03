---
title: Choose a MeshCore role
description: Compare companions, repeaters, room servers, and observers by the job you want to do.
audience:
  - newcomer
  - first-time-user
task: choose-device-role
scope: upstream-meshcore
status: verified
owner: docs-ux
last_reviewed: 2026-09-03
review_by: 2027-07-19
tested_with:
  content_baseline: f608cfe
difficulty: beginner
estimated_time: 2-3 minutes
destructive: false
---

# Choose a MeshCore role

Choose a role based on the job the device will do.

| Role | Use it for | Relays mesh traffic? | Usually | Setup |
|---|---|---:|---|---|
| Companion | Send and receive messages | Normally no | Mobile; often pairs with a phone | [Set up a companion](companion.md) |
| Repeater | Improve local coverage | Yes | Fixed with continuous power | [Set up a repeater](repeater.md) |
| Room server | Keep a shared room available | Can, but not recommended | Fixed with continuous power | [Set up a room server](room-server.md) |
| Observer | Send heard network data to CoreScope | No | Fixed; requirements vary | [Set up an observer](observer.md) |

## Role details

**Companion nodes** are the small personal devices (handheld or portable) that let a user connect to the mesh.

- Run on battery or USB power.
- Usually pair with a smartphone over Bluetooth for messaging.
- Standalone options like the T-Deck include a screen and keyboard, but we don't recommend them for beginners since the firmware is still rough.
- Normally do not route packets. Client repeat is a limited off-grid feature; leave it off on an established public mesh unless local guidance says otherwise.

**Repeaters** are fixed installations, typically mounted at elevation (rooftop, tower, mast), that extend range and link mesh segments.

- Run continuously on mains or solar power. Most Ottawa repeaters operate on solar.
- Form the recommended routing **backbone** for an established mesh.

**Room servers** run specialized firmware that functions like a persistent chat room or mini-BBS.

- When a companion connects, it can retrieve up to **32 unseen messages**, similar to checking an inbox.
- Can repeat, but this is not recommended. Ottawa keeps repeat disabled on room servers and uses separate repeaters.
- Lack several repeater and remote-administration features. Use them as shared message rooms, not as network repeaters.

New to MeshCore? Start with a [companion](companion.md). Before buying or
flashing, confirm that the setup guide supports your device.

If none of these roles fits, [ask the community](get-help.md) before buying
hardware.
