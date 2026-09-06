import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("preview links distinguish a sibling website from escaped paths and missing local targets", async () => {
  const directory = await mkdtemp(join(tmpdir(), "meshcore-preview-links-"));
  try {
    await writeFile(join(directory, "site-manifest.json"), JSON.stringify({ siteBaseUrl: "https://canadaverse.org/meshcore-canada/" }));
    for (const [html, expectedStatus] of [
      ['<a href="https://canadaverse.org/">Canadaverse</a><a href="https://canadaverse.org/meshcore-canada/">Home</a>', 0],
      ['<a href="../">Escaped relative link</a>', 1],
      ['<a href="/assets/missing.svg">Escaped root-relative link</a>', 1],
      ['<img src="https://canadaverse.org/assets/missing.svg">', 1],
      ['<a href="https://canadaverse.org/meshcore-canada/missing/">Missing page</a>', 1]
    ]) {
      await writeFile(join(directory, "index.html"), html);
      const result = spawnSync(process.execPath, ["scripts/check-built-links.mjs", directory], { encoding: "utf8", windowsHide: true });
      assert.equal(result.status, expectedStatus, result.stderr || html);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
