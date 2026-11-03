"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright-core");
const report = {
  started_at: new Date().toISOString(),
  screenshots: false,
  checks: [],
  smoke: [],
};
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, async () => {
    await browser?.close();
    server?.close();
    process.exit(130);
  });
const chrome =
  process.env.CHROME_PATH ||
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
  ].find(fs.existsSync);
let browser,
  server,
  base = process.env.UI_BASE_URL;
async function check(name, fn) {
  if (process.env.UI_CHECKS && !name.includes(process.env.UI_CHECKS)) return;
  try {
    await fn();
    report.checks.push({ name, passed: true });
    console.log("PASS", name);
  } catch (e) {
    report.checks.push({ name, passed: false, error: e.message });
    console.log("FAIL", name, e.message.split("\n")[0]);
  }
}
async function ready(page, id) {
  await page
    .waitForFunction(
      (id) =>
        typeof controllers !== "undefined" && controllers.get(id)?.stateReady,
      id,
      { timeout: 10000, polling: 100 },
    )
    .catch(async (e) => {
      e.message +=
        " expected=" +
        id +
        " " +
        JSON.stringify(
          await page.evaluate(() => ({
            route: currentRoute,
            loading: loading.size,
            pending: pending.length,
            controllers: [...controllers].slice(0, 3).map(([id, c]) => ({
              id,
              ready: c.stateReady,
              note: c.stateNote.textContent,
              status: c.status.textContent,
            })),
          })),
        );
      throw e;
    });
}
async function settle(page) {
  await page.waitForFunction(
    () => typeof loading !== "undefined" && !loading.size && !pending.length,
    null,
    { timeout: 60000, polling: 100 },
  );
  await page.waitForFunction(
    () => [...controllers.values()].every((c) => c.stateReady),
    null,
    { timeout: 8000, polling: 100 },
  );
  await page.waitForTimeout(100);
}
async function open(page, id) {
  await page.goto(base + "?component=" + encodeURIComponent(id) + "#" + id);
  await ready(page, id);
  await settle(page);
}
async function physicalClick(page, frameLocator, element) {
  const r = await element.evaluate((n) => n.getBoundingClientRect().toJSON()),
    f = await frameLocator.evaluate((n) => ({
      r: n.getBoundingClientRect().toJSON(),
      s: new DOMMatrix(getComputedStyle(n).transform).a,
    }));
  await page.mouse.click(
    f.r.x + (r.x + r.width / 2) * f.s,
    f.r.y + (r.y + r.height / 2) * f.s,
  );
}
async function flows(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.setDefaultTimeout(7000);
  const mobile = width < 700;
  await check(`${width}: overview, search and profile filters`, async () => {
    await page.goto(base);
    await page.locator(".overview-stats").waitFor();
    assert.equal(await page.locator("iframe").count(), 0);
    await page.locator("#home-search").fill("кнопки");
    await page.waitForTimeout(150);
    assert.ok((await page.locator("#component-index li:visible").count()) > 0);
    assert.ok(
      (await page.locator("#component-index li:visible").count()) < 116,
    );
    await page.locator("#home-search").fill("НенайденныйКомпонент9876");
    await page.waitForTimeout(150);
    assert.equal(await page.locator("#overview .component-links>a").count(), 0);
    assert.match(
      await page.locator("#overview .overview-description").innerText(),
      /^0 /,
    );
    if (mobile) await page.locator("#menu-toggle").click();
    await page.locator("#search").fill("");
    await page.locator("#profile").selectOption("network");
    await page.waitForTimeout(150);
    const count = await page.locator("#component-index li:visible").count();
    assert.ok(count > 0 && count < 116);
    await page.locator("#profile").selectOption("");
  });
  await check(`${width}: sidebar, history, theme persistence`, async () => {
    if (
      mobile &&
      (await page.locator("#menu-toggle").getAttribute("aria-expanded")) !==
        "true"
    )
      await page.locator("#menu-toggle").click();
    await page.locator('.nav-group a[href="#layout-and-controls"]').click();
    await ready(page, "layout-and-controls");
    assert.equal(
      await page.locator("#menu-toggle").getAttribute("aria-expanded"),
      "false",
    );
    await settle(page);
    assert.equal(await page.evaluate(() => scrollY), 0);
    if (mobile) await page.locator("#menu-toggle").click();
    await page.locator("#theme-toggle").click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.reload();
    await ready(page, "layout-and-controls");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    if (mobile) await page.locator("#menu-toggle").click();
    await page.locator("#theme-toggle").click();
    await page.locator('.nav-group a[href="#profile-tokens"]').click();
    await ready(page, "profile-tokens");
    await page.goBack();
    await ready(page, "layout-and-controls");
    await page.goForward();
    await ready(page, "profile-tokens");
  });
  await check(
    `${width}: element jumps, code, replay and native size`,
    async () => {
      await open(page, "layout-and-controls");
      const jump = page
          .locator("#layout-and-controls>.section-heading .state-section-nav a")
          .filter({ hasText: "Позвонить" })
          .first(),
        id = await jump.getAttribute("href");
      await jump.click();
      await page.waitForTimeout(600);
      const top = await page
        .locator(id)
        .evaluate((n) => n.getBoundingClientRect().top);
      assert.ok(top >= 20 && top < 110, `heading top ${top}`);
      const section = page.locator(id),
        code = section.locator(":scope>.specimen .code-toggle").first();
      await code.click();
      assert.equal(await code.getAttribute("aria-expanded"), "true");
      assert.ok(
        (await section.locator(":scope>.specimen pre code").innerText())
          .length > 100,
      );
      await code.click();
      await section.locator(":scope>.specimen .native-size").click();
      assert.equal(
        await section
          .locator(":scope>.specimen .preview-viewport")
          .getAttribute("data-render"),
        "native",
      );
      await section.locator(":scope>.specimen .native-size").click();
      await section.locator(":scope>.specimen .replay-example").click();
      await page.waitForFunction(
        (id) => controllers.get(id.slice(1))?.stateReady,
        id,
      );
      assert.equal(
        await section
          .locator(":scope>.specimen .preview-placeholder")
          .isVisible(),
        false,
      );
      assert.equal(
        await page
          .locator(".nav-group a[aria-current=true]")
          .evaluate((n) => getComputedStyle(n).boxShadow),
        "none",
      );
    },
  );
  await check(
    `${width}: accordion pointer and keyboard, no page jumps`,
    async () => {
      await open(page, "accordion");
      assert.equal(await page.evaluate(() => scrollY), 0);
      const jump = page
          .locator("#accordion>.section-heading .state-section-nav a")
          .filter({ hasText: "Раскрыто:" })
          .first(),
        id = await jump.getAttribute("href");
      await jump.click();
      await page.waitForTimeout(600);
      const iframe = page.locator(id + ">.specimen iframe"),
        frame = page.frameLocator(id + ">.specimen iframe"),
        summary = frame.locator("summary").first(),
        details = frame.locator("details").first(),
        before = await page
          .locator(id)
          .evaluate((n) => n.getBoundingClientRect().top);
      for (const expected of [false, true, false, true]) {
        await physicalClick(page, iframe, summary);
        await page.waitForTimeout(1200);
        assert.equal((await details.getAttribute("open")) !== null, expected);
        const after = await page
          .locator(id)
          .evaluate((n) => n.getBoundingClientRect().top);
        assert.ok(
          Math.abs(after - before) <= 2,
          `section moved ${before} -> ${after} ${JSON.stringify(await page.evaluate(() => ({ y: scrollY, max: document.documentElement.scrollHeight - innerHeight })))}`,
        );
      }
      await summary.evaluate((n) => n.focus({ preventScroll: true }));
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1200);
      assert.equal(await details.getAttribute("open"), null);
    },
  );
  await check(`${width}: tabs switch panels`, async () => {
    await open(page, "tabs");
    const iframe = page.locator("#tabs>.specimen iframe"),
      frame = page.frameLocator("#tabs>.specimen iframe"),
      tab = frame.locator("[role=tab]").nth(1);
    await page.locator("#tabs>.specimen").scrollIntoViewIfNeeded();
    await physicalClick(page, iframe, tab);
    await page.waitForTimeout(500);
    assert.equal(await tab.getAttribute("aria-selected"), "true");
    const panel = await tab.getAttribute("aria-controls");
    assert.equal(
      await frame.locator('[id="' + panel + '"]').getAttribute("hidden"),
      null,
    );
  });
  await check(
    `${width}: tabs remain usable while an image is stalled`,
    async () => {
      await open(page, "tabs");
      let held;
      await page.route("**/slow-tab-image.svg", (route) => {
        held = route;
      });
      try {
        const iframe = page.locator("#tabs>.specimen iframe"),
          frame = page.frameLocator("#tabs>.specimen iframe"),
          tab = frame.locator("[role=tab]").nth(1),
          panel = await tab.getAttribute("aria-controls");
        await frame.locator('[id="' + panel + '"]').evaluate((n, url) => {
          const img = document.createElement("img");
          img.src = url;
          img.alt = "";
          n.append(img);
        }, base + "slow-tab-image.svg");
        await page.locator("#tabs>.specimen").scrollIntoViewIfNeeded();
        await physicalClick(page, iframe, tab);
        await page.waitForTimeout(1000);
        assert.ok(held, "slow image request was intercepted");
        assert.equal(
          await frame.locator('[id="' + panel + '"]').getAttribute("hidden"),
          null,
        );
        await held.fulfill({
          status: 200,
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
        });
        held = null;
        assert.equal(
          await frame
            .locator('img[src$="slow-tab-image.svg"]')
            .evaluate((img) => img.decode().then(() => img.naturalWidth)),
          1,
        );
      } finally {
        await held?.abort().catch(() => {});
        await page.unroute("**/slow-tab-image.svg");
      }
    },
  );
  await check(`${width}: booklet pages loaded without scrolling`, async () => {
    await open(page, "network-print-booklet");
    assert.equal(
      await page.locator("#network-print-booklet iframe").count(),
      6,
    );
    const state = await page.evaluate(() =>
      [...controllers.values()].map((c) => ({
        crop: !!c.crop,
        placeholder: !c.viewport.querySelector(".preview-placeholder").hidden,
        status: c.status.textContent,
      })),
    );
    assert.ok(
      state.every((c) => c.crop && !c.placeholder && !c.status),
      JSON.stringify(state),
    );
    assert.equal(await page.evaluate(() => scrollY), 0);
  });
  await check(
    `${width}: rapid route changes and overview cleanup`,
    async () => {
      await page.goto(base);
      await page.locator(".overview-stats").waitFor();
      for (const id of [
        "layout-and-controls",
        "profile-tokens",
        "icon-registry",
      ]) {
        if (mobile) await page.locator("#menu-toggle").click();
        await page.locator('.nav-group a[href="#' + id + '"]').click();
      }
      await ready(page, "icon-registry");
      await settle(page);
      assert.equal(
        await page.locator("#catalog>.component-section").count(),
        1,
      );
      assert.equal(await page.evaluate(() => scrollY), 0);
      await page.locator("#component-back").click();
      assert.equal(await page.locator("iframe").count(), 0);
      assert.equal(await page.locator("#overview").isVisible(), true);
    },
  );
  await check(
    `${width}: responsive crops remain inside their viewport`,
    async () => {
      await open(page, "layout-and-controls");
      for (const w of [320, 768, width]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.waitForTimeout(150);
        const bad = await page.evaluate(() =>
          [...controllers.values()]
            .filter((c) => c.crop && c.stateReady && !c.unavailableState)
            .filter((c) => {
              const s = new DOMMatrix(getComputedStyle(c.frame).transform).a,
                x = parseFloat(c.frame.style.left) + c.crop.x * s,
                y = parseFloat(c.frame.style.top) + c.crop.y * s;
              return (
                x < -0.5 ||
                y < -0.5 ||
                x + c.crop.width * s > c.viewport.clientWidth + 0.5 ||
                y + c.crop.height * s > c.viewport.clientHeight + 0.5
              );
            })
            .map((c) => c.section.id),
        );
        assert.deepEqual(bad, []);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
        );
      }
    },
  );
  await check(
    `${width}: wide native previews start at the visible left edge`,
    async () => {
      await open(page, "network-property-card");
      const id = await page.evaluate(
        () => [...controllers.values()].find((c) => c.crop)?.section.id,
      );
      assert.ok(id, "a cropped card example is present");
      const button = page.locator("#" + id + ">.specimen .native-size");
      await button.click();
      const x = await page.evaluate((id) => {
        const c = controllers.get(id);
        return parseFloat(c.frame.style.left) + c.crop.x;
      }, id);
      assert.ok(x >= 0 && x <= 25, `native target begins at ${x}`);
      await button.click();
    },
  );
  await check(
    `${width}: source profile changes rebuild previews once`,
    async () => {
      await open(page, "header-shell");
      const select = page.locator("#header-shell>.specimen .variant-select");
      assert.ok((await select.locator("option").count()) > 1);
      await select.selectOption("1");
      await page
        .waitForFunction(
          () => controllers.get("header-shell")?.data?.profile === "kislovodsk",
          null,
          { timeout: 10000 },
        )
        .catch(async () => {
          assert.equal(await select.inputValue(), "1");
        });
      await ready(page, "header-shell");
      await settle(page);
      const duplicates = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("#catalog [id]")].map(
          (n) => n.id,
        );
        return ids.filter((id, i) => ids.indexOf(id) !== i);
      });
      assert.deepEqual(duplicates, []);
      assert.equal(await page.evaluate(() => scrollY), 0);
    },
  );
  await check(
    `${width}: background dialogs do not steal search focus`,
    async () => {
      await page.goto(base + "?focus-check=" + width + "#dialog-close");
      await page
        .locator('#component-index a[href="#dialog-close"]')
        .waitFor({ state: "attached" });
      if (mobile) await page.locator("#menu-toggle").click();
      const search = page.locator("#search");
      await search.fill("кноп");
      await ready(page, "dialog-close");
      await settle(page);
      assert.equal(
        await search.evaluate((n) => document.activeElement === n),
        true,
      );
      await page.keyboard.type("ки");
      assert.equal(await search.inputValue(), "кнопки");
    },
  );
  await page.close();
}
async function smoke() {
  const catalog = await (await fetch(base + "catalog.json")).json();
  const only = process.env.UI_COMPONENTS?.split(",");
  let page,
    index = 0;
  for (const item of catalog.filter((c) => !only || only.includes(c.id))) {
    if (index && index % 20 === 0) {
      await browser.close();
      browser = await chromium.launch({
        executablePath: chrome,
        headless: true,
        args: ["--disable-background-networking"],
      });
    }
    index++;
    page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const id = item.id;
    const result = { id };
    try {
      await open(page, id);
      const state = await page.evaluate(() => ({
        y: scrollY,
        frames: document.querySelectorAll("iframe").length,
        runtimeWarnings: [...controllers].flatMap(([id, c]) =>
          (c.runtimeWarnings || []).map((warning) => ({ id, warning })),
        ),
        runtimeErrors: [...controllers]
          .filter(([, c]) => c.runtimeError)
          .map(([id, c]) => ({ id, error: c.runtimeError })),
        statuses: [...document.querySelectorAll(".specimen-status")]
          .map((n) => n.textContent)
          .filter(Boolean),
        unavailable: [...controllers]
          .filter(([, c]) => c.unavailableState)
          .map(([id, c]) => ({ id, note: c.stateNote.textContent })),
        empty: [...controllers]
          .filter(([, c]) => !c.stateReady)
          .map(([id]) => id),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        blankCrops: [...controllers]
          .filter(
            ([, c]) =>
              (c.isolateTarget || c.data.layout?.print) &&
              c.stateReady &&
              !c.unavailableState &&
              (!c.crop || c.frame.style.visibility === "hidden"),
          )
          .map(([id]) => id),
        viewportMismatches: [...controllers]
          .filter(
            ([, c]) =>
              c.crop &&
              !c.data.layout?.print &&
              parseFloat(c.frame.style.height) !==
                (c.mobile ? 844 : c.data.layout?.viewport?.height || 800),
          )
          .map(([id]) => id),

        duplicateIds: [...document.querySelectorAll("#catalog [id]")]
          .map((n) => n.id)
          .filter((id, i, ids) => ids.indexOf(id) !== i),
      }));
      Object.assign(result, state);
      assert.equal(state.y, 0, "unexpected page scroll");
      assert.deepEqual(
        state.statuses.filter((text) => /Не удалось/.test(text)),
        [],
      );
      assert.deepEqual(state.empty, []);
      assert.deepEqual(state.unavailable, []);
      assert.equal(state.overflow, false);
      assert.deepEqual(state.duplicateIds, []);
      assert.deepEqual(state.viewportMismatches, []);
      result.passed = true;
    } catch (e) {
      result.passed = false;
      result.error = e.message;
      result.diagnostics = await page
        .evaluate(() => ({
          loading: [...loading].map((c) => c.section.id),
          pending: pending.map((c) => c.section.id),
          unready: [...controllers]
            .filter(([, c]) => !c.stateReady)
            .map(([id, c]) => ({
              id,
              note: c.stateNote.textContent,
              status: c.status.textContent,
              active: c.active,
            })),
        }))
        .catch(() => null);
    }
    report.smoke.push(result);
    fs.writeFileSync(
      process.env.UI_REPORT || path.join(__dirname, "report.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    if (!result.passed) console.log("DETAIL", JSON.stringify(result));
    console.log(
      result.passed ? "SMOKE PASS" : "SMOKE FAIL",
      id,
      result.error?.split("\n")[0] || "",
      result.unavailable?.length
        ? `unavailable=${result.unavailable.length}`
        : "",
    );
    await page.close();
  }
}
(async () => {
  try {
    if (!base) {
      const root = fs.existsSync(path.resolve(__dirname, "../../site"))
        ? path.resolve(__dirname, "../../site")
        : path.resolve(__dirname, "../..");
      const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      };
      server = http.createServer((req, res) => {
        const file = path.resolve(
          root,
          "." +
            decodeURIComponent(new URL(req.url, "http://localhost").pathname),
        );
        const candidate =
          fs.existsSync(file) && fs.statSync(file).isDirectory()
            ? path.join(file, "index.html")
            : file;
        if (
          !candidate.startsWith(root + path.sep) ||
          !fs.existsSync(candidate)
        ) {
          res.writeHead(404);
          return res.end();
        }
        res.writeHead(200, {
          "Content-Type":
            mime[path.extname(candidate)] || "application/octet-stream",
          "Access-Control-Allow-Origin": "*",
        });
        const stream = fs.createReadStream(candidate);
        stream.on("error", () => res.destroy());
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      base = "http://127.0.0.1:" + server.address().port + "/";
    }
    if (!base.endsWith("/")) base += "/";
    report.base_url = base;
    browser = await chromium.launch({
      executablePath: chrome,
      headless: true,
      args: ["--disable-background-networking"],
    });
    report.browser = await browser.version();
    if (process.argv.includes("--smoke")) await smoke();
    else {
      for (const width of [390, 1280]) await flows(width);
      if (process.argv.includes("--all")) await smoke();
    }
  } catch (e) {
    report.fatal = e.stack;
    console.error(e);
  } finally {
    await browser?.close();
    if (server) await new Promise((r) => server.close(r));
    report.finished_at = new Date().toISOString();
    if (!report.checks.length && !report.smoke.length)
      report.fatal = "No matching browser checks were selected";
    const output = process.env.UI_REPORT || path.join(__dirname, "report.json");
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
    const failed =
      report.checks.filter((c) => !c.passed).length +
      report.smoke.filter((c) => !c.passed).length +
      (report.fatal ? 1 : 0);
    console.log(
      "RESULT",
      report.checks.length + report.smoke.length,
      "checks;",
      failed,
      "failed;",
      output,
    );
    process.exitCode = failed ? 1 : 0;
  }
})();
