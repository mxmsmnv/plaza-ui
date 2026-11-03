# PLAZA UI browser tests

End-to-end tests run real Chromium pages sequentially, using Playwright Core. They do not capture screenshots or submit forms.

## Run

Requires Node.js 20 or newer and Google Chrome or Chromium.

```sh
cd tests/e2e
npm ci
npm test
```

Chrome is detected at its standard macOS and Linux paths. For another installation, set `CHROME_PATH` to the browser executable.

The runner starts and closes a local static server automatically. It supports both the authoring workspace (`site/`) and the published repository (static files at the repository root).

```sh
# All component routes, including their generated states
npm run test:smoke

# Interaction scenarios at 390 px and 1280 px, followed by all routes
node run.cjs --all

# Test the published site, without starting a local server
UI_BASE_URL=https://mxmsmnv.github.io/plaza-ui/ node run.cjs

# Retest selected component routes
UI_COMPONENTS=accordion,tabs,dialog-close node run.cjs --smoke
```

A JSON report is written to `report.json`; override the destination with `UI_REPORT`. A failed assertion produces a nonzero exit status. An advertised state that cannot be reached fails the route check. Browser measurement warnings are recorded separately from script exceptions.

The interaction suite checks overview loading, search and profile filters, sidebar navigation, browser history, theme persistence, element navigation, code display, replay, native sizing, accordion pointer and keyboard behavior, tabs (including a stalled-image regression), booklet pages, rapid route changes, responsive crop bounds, source profile changes and focus retention while background dialogs prepare. Each route gets a fresh browser page, and the browser restarts after every 20 routes to bound memory during long runs. The route sweep checks completion of preview preparation, runtime error messages, accidental page scrolling and horizontal overflow.

Transformed iframe controls are clicked using coordinates mapped from the child viewport to the parent page. This avoids Playwright's unscaled iframe coordinates and exercises real pointer events.
