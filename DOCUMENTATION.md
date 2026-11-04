# PLAZA UI Documentation

**Version:** 1.0.0 · **Version code:** 100

## Repository Structure

| Path | Purpose |
| --- | --- |
| `index.html`, `app.js`, `style.css` | Catalog shell, search, categories and routing |
| `preview.js`, `state-preview.js` | Isolated specimens and their element/state sections |
| `framework.js` | Alpine bindings and GSAP animation/frame helpers |
| `catalog.json`, `content.ru.json` | Component inventory and human-readable copy |
| `examples.json`, `examples/` | Specimen index and payloads |
| `runtime/shared/` | Shared component behavior |
| `runtime/cards/` | Card, gallery and media behavior |
| `runtime/compositions/` | Page compositions, dialogs, navigation and print behavior |
| `assets/` | Selected public styles, media, icons and pinned framework bundles |
| `licenses/` | Third-party notices |
| `release.json`, `VERSION`, `VERSION_CODE` | Release identifiers |
| `AGENTS.md` | AI component-selection and reuse rules |

The runtime is already divided by responsibility. This is a JavaScript/Python static project, not a ProcessWire module; it does not define PHP traits.

## Reuse an Existing Component

1. Find its ID in `catalog.json` and choose the required profile.
2. Use `examples.json` to find the specimen payload.
3. Read its markup, styles, wrappers, body classes, layout, context and runtime dependencies.
4. Inspect the live element/state sections. Preserve the selected component's actual fonts, tokens, responsive behavior, keyboard semantics and motion parameters.
5. Integrate only the necessary source and dependencies into the target application. Keep a single compatible framework bootstrap and clean up observers, listeners and animations when removing a component.

The preview controls, sandbox restrictions, specimen cropping and disabled demo submissions belong to the catalog, not to a production product. Backend actions require task-specific implementation; no booking or server operation is simulated as a real submission here.

## Runtime and Loading

Alpine.js 3.17.5 CSP provides reactive catalog controls and UI event binding. GSAP 3.15.0 with CustomEase provides procedural motion and the frame scheduler; rendered CSS keyframes are transferred to GSAP timelines. Small CSS hover transitions, media/dialog APIs and view-transition lifetime remain native. The canvas fireworks renderer remains a third-party dependency.

The overview has no live specimen iframes. All selected-component sections are queued immediately, with at most three previews bootstrapping together. Loaded previews remain present; offscreen motion pauses without unloading their content. Video and expensive effects start on demand. Reduced motion follows the existing component behavior and preview preferences.

## Verification and Limits

The first release includes a sequential browser startup check of all 189 examples, eight representative interaction checks and ten framework contract checks. These checks were recorded during development; the public catalog retains component IDs, source-site references and dependency paths.

These checks are not exhaustive pixel comparisons and do not guarantee every state, breakpoint, print layout or external service. No screenshots were created. Source/profile selection and a real behavior check remain necessary for each integration.

## Rights

Read [LICENSE](LICENSE), the notices in `licenses/` and the original bundle headers. The original catalog tooling license does not relicense PLAZA source, specimen markup, branding, photos, media or third-party assets.

## Connection Order

`index.html` loads the local GSAP bundle, CustomEase, Alpine CSP, then `framework.js`, `icons.js`, `state-preview.js`, `preview.js` and `app.js`, all with `defer`. CSS is loaded with stylesheet links (`inter.css` and `style.css`).

`app.js` registers the `plazaCatalog` Alpine data component, calls `PlazaRuntime.start()` and fetches the catalog, examples index and human-readable copy. Each isolated specimen loads the same framework bootstrap before its own runtime modules. Component fonts and styles are taken from its selected JSON payload; catalog icons reference `assets/remix-icons.svg`.

GitHub Pages serves the ready static files. A local HTTP server is sufficient for preview; no frontend build step is required.

## Preview Fitting

Isolated element previews use stable source selectors, hide unrelated siblings without changing layout, and fit their full bounds into the available width. Preview padding scales with the content; small controls do not inherit a large scene minimum height. Bounds observers attach only to existing nodes. Original missing SVG context is supplied by the specimen's optional `svg_sources` field, referencing SVG from existing PLAZA examples.

Preview state setup scrolls only its own iframe. Catalog section navigation uses one cancellable GSAP scroll with the mobile header offset; asynchronous preview sizing preserves the current reading position.

## Browser verification

The repeatable Playwright Core suite is in `tests/e2e/`. Run `npm ci` and `npm test` there for desktop/mobile interaction checks, or `node run.cjs --all` to include every catalog route. See `tests/e2e/README.md` for browser paths, published-site testing and JSON reports. Tests run sequentially without screenshots.

Preparing frames remain hidden at a fixed viewport position until their state is ready, so native dialog autofocus cannot scroll the catalog. State readiness polling uses native timers and continues independently of paused offscreen animation. State setup begins after DOM initialization rather than waiting for every image to download. Unsupported states finish with an explicit explanation instead of an indefinite loading indicator.

Repeated rows with the same disclosure markup share a representative expanded state. State discovery stays within the selected specimen, so unrelated context controls are not advertised as component states. Source theme modes, gallery positions and medical goal variants use their dedicated states instead of inferring selection from arbitrary `aria-pressed` attributes. Replaying or changing a specimen creates a fresh iframe, and duplicate history events do not rebuild the same route twice. Background state setup restores the reader’s current search/control focus.

Element section identifiers use their original catalog keys independently of responsive target indexes. This prevents sections from overwriting each other and leaving orphaned preview loads. Position preservation anchors the visible specimen or the next nested heading when the viewport is in a gap between sections. Modal presets are offered only when the source trigger has its required local dialog content.

The catalog reserves only the document height needed for a requested heading to remain readable when the last accordion closes. This reserve resets when navigating to another component. Scroll preservation skips unnecessary layout scans at the top of the page; background initialization therefore scales with fewer repeated measurements.

Tab image preloading has a bounded wait; a stalled image cannot keep its panel hidden. Canonical [ResizeObserver loop notifications](https://www.w3.org/TR/resize-observer/#deliver-resize-loop-error) are retained as measurement warnings, separately from script exceptions; preview resize writes are scheduled outside observer delivery.

Crop coordinates are measured in the source viewport after local document scrolling. Ordinary previews keep their original viewport height; they never grow to the element’s position down a long page. Print pages may use their physical page height, while taller interactive elements retain a scrollable native viewport. Local image assets are explicitly permitted by the preview CSP.

The GSAP frame adapter suppresses synchronous callbacks during ticker subscription. This preserves asynchronous frame semantics after an idle wake, so visibility updates and component motion cannot become stuck. Browser disclosure tests wait for completed transitions and explicitly cover an idle ticker.

Each preview has an independent phone/desktop button in its toolbar, including element and state sections. The icon shows the current viewport; its tooltip describes the next mode. Separate state sections remain available. Print previews preserve enough source width to display the physical page in either mode.
