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
