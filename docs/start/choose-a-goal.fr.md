---
title: Choisir un type d’appareil MeshCore
description: Comparez les appareils compagnons, les répéteurs, les serveurs de salon et les observateurs selon leur rôle.
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

# Choisir un type d’appareil MeshCore

Choisissez l’appareil selon ce qu’il doit faire.

| Type | À quoi sert-il? | Relaie le trafic du réseau? | Utilisation habituelle | Configuration |
|---|---|---:|---|---|
| Appareil compagnon | Envoyer et recevoir des messages | Non | Mobile; souvent jumelé à un téléphone | [Configurer un compagnon](companion.md) |
| Répéteur | Améliorer la couverture locale | Oui | Fixe et alimenté en continu | [Configurer un répéteur](repeater.md) |
| Serveur de salon | Garder un salon partagé accessible | Non | Fixe et alimenté en continu | [Configurer un serveur de salon](room-server.md) |
| Observateur | Transmettre à CoreScope les données radio captées | Non | Fixe; les besoins varient selon la méthode | [Configurer un observateur](observer.md) |

## Détails des rôles

**Les appareils compagnons** sont les petits appareils personnels (portatifs ou mobiles) qui permettent à un utilisateur de se connecter au réseau maillé.

- Fonctionnent sur pile ou par USB.
- Se jumellent habituellement à un téléphone intelligent par Bluetooth pour la messagerie.
- Les appareils autonomes comme le T-Deck ont un écran et un clavier, mais nous ne les recommandons pas aux débutants, car leur micrologiciel est encore rudimentaire.
- Les compagnons ne routent **pas** les paquets. Ils peuvent communiquer directement entre eux, mais **seuls les répéteurs** assurent le routage dans le réseau MeshCore.

**Les répéteurs** sont des installations fixes, généralement montées en hauteur (toit, tour, mât), qui étendent la portée et relient les segments du réseau.

- Fonctionnent en continu sur le secteur ou à l’énergie solaire. La plupart des répéteurs d’Ottawa sont solaires.
- Forment la **dorsale** stable du réseau.
- Sont les **seuls appareils** qui routent les paquets.

**Les serveurs de salon** utilisent un micrologiciel spécialisé qui fonctionne comme un salon de clavardage persistant ou un mini-BBS.

- Conservent les **32 derniers messages** qui leur ont été envoyés.
- Lorsqu’un compagnon se connecte, il récupère les messages conservés, un peu comme on consulte une boîte de réception.
- Ils peuvent techniquement répéter, mais c’est fortement déconseillé. Ottawa désactive la répétition sur les serveurs de salon, et les développeurs ont envisagé de retirer complètement cette option.
- Les serveurs de salon ne sont **pas de vrais répéteurs** et n’offrent pas plusieurs de leurs fonctions. Utilisez-les comme babillards ou nœuds de clavardage partagés, et non comme répéteurs.

Vous découvrez MeshCore? Commencez par un
[appareil compagnon](companion.md). Avant d’acheter du matériel ou d’installer
un micrologiciel, vérifiez que le guide de configuration prend votre appareil
en charge.

Si aucun de ces choix ne convient,
[demandez conseil à la communauté](get-help.md) avant d’acheter du matériel.
