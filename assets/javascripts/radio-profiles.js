(function () {
  "use strict";
  var source = new URL("../radio-profiles.json", document.currentScript.src);
  var french = /^fr(?:-|$)/i.test(document.documentElement.lang);
  var profiles = [];
  var loading;

  function commands(id, hashMode) {
    var result = [];
    if (id && id !== "keep") {
      var profile = profiles.find(function (item) { return item.id === id; });
      if (!profile) throw new Error("Unknown radio profile");
      var radio = profile.radio;
      result.push("set radio " + [radio.frequency_mhz, radio.bandwidth_khz, radio.spreading_factor, radio.coding_rate].join(","));
    }
    if (["0", "1", "2"].indexOf(hashMode) !== -1) result.push("set path.hash.mode " + hashMode);
    return result;
  }

  function populate(select) {
    if (!loading) loading = fetch(source).then(function (response) {
      if (!response.ok) throw new Error("Radio profiles unavailable");
      return response.json();
    }).then(function (data) { profiles = data; });
    return loading.then(function () {
      profiles.forEach(function (profile) {
        var option = document.createElement("option");
        option.value = profile.id;
        option.textContent = (french ? profile.name_fr : profile.name) + " · " +
          profile.radio.frequency_mhz + " MHz";
        select.appendChild(option);
      });
    }).catch(function () {
      // Keep-current remains usable; never substitute a default when data fails.
      var notice = document.createElement("p");
      notice.setAttribute("role", "status");
      notice.textContent = french
        ? "Profils radio indisponibles. Les réglages actuels seront conservés."
        : "Radio profiles unavailable. Current settings will be kept.";
      select.after(notice);
    });
  }

  function label(id) {
    var profile = profiles.find(function (item) { return item.id === id; });
    return profile ? (french ? profile.name_fr : profile.name) + " · " + profile.radio.frequency_mhz + " MHz"
      : (french ? "Conserver les réglages actuels" : "Keep current settings");
  }
  window.MeshCoreRadioProfiles = { commands: commands, populate: populate, label: label };
}());
