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
last_reviewed: 2026-09-02
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
| Companion | Send and receive messages | No | Mobile; often pairs with a phone | [Set up a companion](companion.md) |
| Repeater | Improve local coverage | Yes | Fixed with continuous power | [Set up a repeater](repeater.md) |
| Room server | Keep a shared room available | No | Fixed with continuous power | [Set up a room server](room-server.md) |
| Observer | Send heard network data to CoreScope | No | Fixed; requirements vary | [Set up an observer](observer.md) |

## Role details

**Companion nodes** are the small personal devices (handheld or portable) that let a user connect to the mesh.

- Run on battery or USB power.
- Usually pair with a smartphone over Bluetooth for messaging.
- Standalone options like the T-Deck include a screen and keyboard, but we don't recommend them for beginners since the firmware is still rough.
- Companion nodes do **not** route packets. They can communicate directly with each other, but **only repeaters** perform routing across the MeshCore network.

**Repeaters** are fixed installations, typically mounted at elevation (rooftop, tower, mast), that extend range and link mesh segments.

- Run continuously on mains or solar power. Most Ottawa repeaters operate on solar.
- Form the stable **backbone** of the network.
- Are the **only devices** that perform packet routing.

**Room servers** run specialized firmware that functions like a persistent chat room or mini-BBS.

- Store the last **32 messages** sent to them.
- When a companion connects, it retrieves the stored messages, similar to checking an inbox.
- While they technically can repeat, this is strongly discouraged. Ottawa disables repeat on room servers, and the developers have discussed removing the option entirely.
- Room servers are **not full repeaters** and lack many repeater features. Use them as static message boards or shared chat nodes, not as repeaters.

New to MeshCore? Start with a [companion](companion.md). Before buying or
flashing, confirm that the setup guide supports your device.

If none of these roles fits, [ask the community](get-help.md) before buying
hardware.
