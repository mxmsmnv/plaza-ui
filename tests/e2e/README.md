# PLAZA UI browser tests

Run `npm ci && npm test` here with Node.js and Google Chrome. Override its executable with `CHROME_PATH` when needed.

The sequential Playwright Core suite starts and closes its own static server and browser. It checks the lightweight homepage, native document navigation, phone/desktop controls, separate element/state documents, legacy link redirects, mobile overflow and all 116 default component documents. Each smoke check uses a fresh browser page and verifies one ready iframe without a runtime exception. No screenshots or form submissions are made.

Use `UI_COMPONENTS=accordion,tabs node run.cjs` for a subset, or `UI_BASE_URL=https://mxmsmnv.github.io/plaza-ui/ node run.cjs` for the deployed site. Results are saved in `last-run.json`; set `UI_REPORT` for another destination. Failures return a nonzero exit code. These checks do not claim exhaustive pixel, state or breakpoint coverage.
