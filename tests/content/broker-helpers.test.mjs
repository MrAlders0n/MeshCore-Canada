import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const gitPath = spawnSync("git", ["--exec-path"], { encoding: "utf8" }).stdout?.trim();
const bash = process.platform === "win32" && gitPath ? resolve(gitPath, "../../../bin/bash.exe") : "bash";
const helpers = [
  ["Bash", bash, (dir) => [resolve("docs/analyzer/scripts/add-meshcore-ca-broker.sh").replaceAll("\\", "/"),
    "--device", "companion", "--mode", "env", "--no-restart", "--iata", "YOW", "--dir", dir.replaceAll("\\", "/")]],
  ["PowerShell", "pwsh", (dir) => ["-NoProfile", "-NonInteractive", "-File", resolve("docs/analyzer/scripts/add-meshcore-ca-packetcapture-broker.ps1"), "-Iata", "YOW", "-InstallDir", dir]],
];
const unrelated = (slot) => `PACKETCAPTURE_MQTT${slot}_SERVER=other${slot}.example\nPACKETCAPTURE_MQTT${slot}_ENABLED=false\nPACKETCAPTURE_MQTT${slot}_PASSWORD=fixture-only-${slot}\n`;

for (const [name, executable, args] of helpers) {
  for (const scenario of ["empty", "one line", "other connections", "existing Canada", "full", "one free slot"]) {
    test(`${name} preserves broker settings: ${scenario}`, () => {
      assert.ok(process.platform !== "win32" || name !== "Bash" || existsSync(executable), "Git Bash is required on Windows");
      const dir = mkdtempSync(join(tmpdir(), "mcc-broker-test-"));
      const config = join(dir, ".env.local");
      const initial = scenario === "empty" ? "" : scenario === "one line" ? "UNCHANGED=fixture\n" : scenario === "other connections" ? unrelated(1) + unrelated(3)
        : scenario === "existing Canada" ? unrelated(1) + "PACKETCAPTURE_MQTT4_SERVER=mqtt1.meshcore.ca\nPACKETCAPTURE_MQTT6_SERVER=mqtt2.meshcore.ca\n"
        : Array.from({ length: scenario === "full" ? 6 : 5 }, (_, i) => unrelated(i + 1)).join("");
      try {
        writeFileSync(config, initial);
        writeFileSync(join(dir, "packet_capture.py"), "# Install marker; never executed.\n");
        const run = () => spawnSync(executable, args(dir), { encoding: "utf8", timeout: process.platform === "win32" ? 60000 : 30000 });
        const first = run();
        if (["full", "one free slot"].includes(scenario)) {
          assert.notEqual(first.status, 0);
          assert.match(first.stderr + first.stdout, /Not enough empty broker slots/);
          assert.equal(readFileSync(config, "utf8"), initial);
          assert.equal(readdirSync(dir).filter((file) => file.includes(".bak.")).length, 0);
          return;
        }
        assert.equal(first.status, 0, first.stderr + first.stdout);
        const output = readFileSync(config, "utf8");
        for (const line of initial.trim().split("\n").filter(Boolean)) assert.ok(output.includes(line), line);
        for (const host of ["mqtt1.meshcore.ca", "mqtt2.meshcore.ca"]) {
          assert.equal(output.split("\n").filter((line) => line.trimEnd().endsWith("_SERVER=" + host)).length, 1);
        }
        if (scenario === "existing Canada") assert.match(output, /PACKETCAPTURE_MQTT4_SERVER=mqtt1.meshcore.ca/);
        const originalBackup = readdirSync(dir).find((file) => file.includes(".bak."));
        assert.equal(readFileSync(join(dir, originalBackup), "utf8"), initial);
        const second = run();
        assert.equal(second.status, 0, second.stderr + second.stdout);
        assert.equal(readFileSync(config, "utf8"), output, "repeated setup is idempotent");
        assert.equal(readdirSync(dir).filter((file) => file.includes(".bak.")).length, 2);
        copyFileSync(join(dir, originalBackup), config);
        assert.equal(readFileSync(config, "utf8"), initial, "backup restores original configuration");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
}
