import { expect, test } from "./site-fixtures.mjs";
import { readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { siteRoute } from "./site-route.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const siteRoot = join(root, ".tmp", "site");

function collectHtml(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? collectHtml(path)
      : entry.name.endsWith(".html")
        ? [path]
        : [];
  });
}

function routeFor(path) {
  const builtPath = relative(siteRoot, path).split(sep).join("/");
  if (builtPath === "index.html") return "/";
  if (builtPath.endsWith("/index.html")) {
    return `/${builtPath.slice(0, -"index.html".length)}`;
  }
  return `/${builtPath}`;
}

const renderedRoutes = collectHtml(siteRoot)
  .map(routeFor)
  .filter((route) => route !== "/404.html")
  .sort();

test("every rendered English and French page passes the layout smoke audit", async ({
  page,
}, testInfo) => {
  const auditedProject = ["chromium", "mobile-chromium"].includes(testInfo.project.name);
  test.skip(!auditedProject, "The full-site audit runs once per desktop/mobile layout");
  testInfo.setTimeout(240_000);

  const mobile = testInfo.project.name === "mobile-chromium";
  const problems = [];
  let activeRoute = "";
  let pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const route of renderedRoutes) {
    activeRoute = route;
    pageErrors = [];
    const response = await page.goto(siteRoute(route), {
      waitUntil: "domcontentloaded",
    });
    if (!response?.ok()) {
      problems.push(`${route}: HTTP ${response?.status() ?? "navigation failed"}`);
      continue;
    }

    await page.waitForLoadState("load");
    const result = await page.evaluate(({ isMobile }) => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" &&
          style.visibility !== "hidden" &&
          element.getClientRects().length > 0;
      };
      const describe = (element) => {
        const id = element.id ? `#${element.id}` : "";
        const className = typeof element.className === "string" && element.className.trim()
          ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}`
          : "";
        return `${element.tagName.toLowerCase()}${id}${className}`;
      };

      const ids = Array.from(document.querySelectorAll("[id]"))
        .map((element) => element.id)
        .filter(Boolean);
      const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

      const brokenLocalImages = Array.from(document.images)
        .filter((image) => {
          const source = image.currentSrc || image.src;
          if (!source || source.startsWith("data:")) return false;
          return new URL(source, location.href).origin === location.origin &&
            image.complete &&
            image.naturalWidth === 0;
        })
        .map(describe);

      const oversizedControls = Array.from(document.querySelectorAll(
        "input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='hidden']), select, button",
      ))
        .filter(visible)
        .map((element) => ({
          element: describe(element),
          height: Math.round(element.getBoundingClientRect().height),
        }))
        .filter(({ height }) => height > 96);

      const contentHeadings = Array.from(document.querySelectorAll("h1")).filter(visible);
      const languageLinks = {
        en: document.querySelectorAll("a[hreflang='en']").length,
        fr: document.querySelectorAll("a[hreflang='fr']").length,
      };

      const tableProblems = isMobile
        ? Array.from(document.querySelectorAll(".mc-table-wrap table")).flatMap((table) => {
            const wrapper = table.closest(".mc-table-wrap");
            const cells = Array.from(table.querySelectorAll("tbody td"));
            const issues = [];
            if (!table.classList.contains("mc-table--responsive")) {
              issues.push("table was not enhanced");
            }
            if (table.getBoundingClientRect().width > wrapper.getBoundingClientRect().width + 1) {
              issues.push("table is wider than its wrapper");
            }
            if (cells.some((cell) => !(cell.dataset.label || "").trim())) {
              issues.push("table has an unlabelled data cell");
            }
            return issues;
          })
        : [];

      return {
        title: document.title.trim(),
        headingCount: contentHeadings.length,
        duplicateIds,
        brokenLocalImages,
        oversizedControls,
        languageLinks,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        tableProblems,
      };
    }, { isMobile: mobile });

    if (!result.title) problems.push(`${route}: missing document title`);
    if (result.headingCount !== 1) {
      problems.push(`${route}: expected one visible content h1, found ${result.headingCount}`);
    }
    if (result.duplicateIds.length) {
      problems.push(`${route}: duplicate IDs ${result.duplicateIds.join(", ")}`);
    }
    if (result.brokenLocalImages.length) {
      problems.push(`${route}: broken local images ${result.brokenLocalImages.join(", ")}`);
    }
    if (result.oversizedControls.length) {
      problems.push(
        `${route}: oversized controls ${result.oversizedControls
          .map(({ element, height }) => `${element} (${height}px)`)
          .join(", ")}`,
      );
    }
    if (result.languageLinks.en === 0 || result.languageLinks.fr === 0) {
      problems.push(`${route}: missing English/French language switch links`);
    }
    if (mobile && result.documentWidth > result.viewportWidth + 1) {
      problems.push(
        `${route}: page width ${result.documentWidth}px exceeds ${result.viewportWidth}px viewport`,
      );
    }
    for (const issue of result.tableProblems) {
      problems.push(`${route}: ${issue}`);
    }
    for (const error of pageErrors) {
      problems.push(`${activeRoute}: page error ${error}`);
    }
  }

  expect(
    problems,
    `${renderedRoutes.length} rendered routes were audited in ${testInfo.project.name}`,
  ).toEqual([]);
});
