(function () {
  "use strict";
  var MAX_AGE = 5 * 60 * 1000;
  var CACHE_KEY = "meshcore-canada:network-totals:v1";
  var pending = null;
  var cache = null;

  function count(value) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid network count");
    return value;
  }

  function parseStats(overview, types) {
    if (!overview || !Array.isArray(types) || types.length > 16) throw new Error("Invalid network statistics");
    var result = { repeaters: 0, companions: 0, rooms: 0, sensors: 0, other: 0, total: 0,
      observers: count(overview.activeObservers), areas: count(overview.activeIatas), packets: count(overview.totalPackets),
      hours: count(overview.windowHours) };
    if (result.hours < 1 || result.hours > 168) throw new Error("Invalid reporting window");
    var seen = new Set();
    types.forEach(function (item) {
      var type = count(item.nodeType);
      if (seen.has(type)) throw new Error("Duplicate device type");
      seen.add(type);
      var field = ({ 1: "companions", 2: "repeaters", 3: "rooms", 4: "sensors" })[type] || "other";
      result[field] += count(item.count);
      result.total += item.count;
    });
    count(result.total);
    return result;
  }

  function readCache() {
    try {
      var saved = cache || JSON.parse(sessionStorage.getItem(CACHE_KEY));
      if (!saved || !Number.isFinite(saved.at) || saved.at > Date.now() || Date.now() - saved.at >= MAX_AGE) return null;
      ["repeaters", "companions", "rooms", "sensors", "other", "total", "observers", "areas", "packets", "hours"].forEach(function (key) { count(saved.stats[key]); });
      if (saved.stats.hours < 1 || saved.stats.hours > 168) return null;
      return saved;
    } catch (_) { return null; }
  }

  async function loadStats() {
    var saved = readCache();
    if (saved) return saved;
    if (pending) return pending;
    pending = (async function () {
      var controller = new AbortController();
      var timer = window.setTimeout(function () { controller.abort(); }, 8000);
      try {
        var responses = await Promise.all(["overview", "node-types"].map(async function (path) {
          var response = await fetch("https://dev.meshcore.ca/api/v1/stats/" + path, { signal: controller.signal, credentials: "omit" });
          if (!response.ok) throw new Error("Network statistics unavailable");
          return response.json();
        }));
        cache = { at: Date.now(), stats: parseStats(responses[0], responses[1]) };
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (_) { /* Counts work without storage. */ }
        return cache;
      } finally { window.clearTimeout(timer); controller.abort(); }
    })().finally(function () { pending = null; });
    return pending;
  }

  function initialize() {
    var root = document.querySelector("[data-network-summary]");
    if (!root || root.dataset.networkReady) return;
    root.dataset.networkReady = "true";
    var french = document.documentElement.lang.startsWith("fr");
    var locale = french ? "fr-CA" : "en-CA";
    var numbers = new Intl.NumberFormat(locale);
    var compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
    var summary = root.querySelector("summary");
    var total = root.querySelector("[data-network-total]");
    var updated = root.querySelector("[data-network-updated]");
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      try {
        var data = await loadStats();
        total.textContent = compact.format(data.stats.total);
        summary.setAttribute("aria-label", (french ? "Statistiques du réseau : " : "Network statistics: ") + numbers.format(data.stats.total) + (french ? " appareils connus" : " known devices"));
        root.querySelectorAll("[data-network-count]").forEach(function (element) {
          element.textContent = numbers.format(data.stats[element.dataset.networkCount]);
        });
        root.querySelectorAll("[data-network-other]").forEach(function (element) { element.hidden = !data.stats.other; });
        root.querySelector("[data-network-period]").textContent = french ? "Dernières " + data.stats.hours + " h" : "Last " + data.stats.hours + " hours";
        updated.textContent = (french ? "Mis à jour à " : "Updated ") + new Date(data.at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
        root.dataset.networkState = "ready";
      } catch (_) {
        total.textContent = "—";
        summary.setAttribute("aria-label", french ? "Statistiques du réseau indisponibles" : "Network statistics unavailable");
        root.querySelectorAll("[data-network-count]").forEach(function (element) { element.textContent = "—"; });
        root.querySelectorAll("[data-network-other]").forEach(function (element) { element.hidden = true; });
        updated.textContent = french ? "Totaux indisponibles pour le moment." : "Network totals are temporarily unavailable.";
        root.dataset.networkState = "unavailable";
      }
    }
    document.addEventListener("pointerdown", function (event) { if (!root.contains(event.target)) root.open = false; });
    root.addEventListener("focusout", function (event) { if (event.relatedTarget && !root.contains(event.relatedTarget)) root.open = false; });
    root.addEventListener("keydown", function (event) { if (event.key === "Escape" && root.open) { root.open = false; summary.focus(); } });
    document.addEventListener("visibilitychange", refresh);
    window.setInterval(refresh, MAX_AGE);
    refresh();
  }

  globalThis.MeshCoreNetworkStatus = { parseStats: parseStats };
  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
