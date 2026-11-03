# PLAZA UI

PLAZA UI is a browsable design-system reference for the PLAZA Spa network, Kislovodsk and Zheleznovodsk websites: reusable interface elements, real component examples, their states and motion.

![PLAZA UI](assets/plaza-ui-doodle.png)

It is made for designers, developers and AI coding agents who need to build interfaces from the existing PLAZA components while preserving their appearance and behavior.

**Version:** 1.0.0 · **Version code:** 100<br>
**Catalog tooling author:** Maxim Semenov<br>
**Website:** [smnv.org](https://smnv.org)<br>
**Email:** [maxim@smnv.org](mailto:maxim@smnv.org)

If this project helps your work, consider supporting future development: [GitHub Sponsors](https://github.com/sponsors/mxmsmnv) or [smnv.org/sponsor](https://smnv.org/sponsor/).

## What PLAZA UI Does

- Organizes 116 component families and 189 examples into eight categories.
- Finds components by name, purpose and website profile.
- Shows individual elements and applicable states in separate sections.
- Preserves original component typography, geometry, styles and rendering algorithms.
- Provides desktop and phone views, themes, animation replay, 1:1 sizing and HTML inspection.
- Includes navigation, cards, galleries, forms, content sections, effects and print examples.
- Opens all examples and state sections of the selected component immediately, without scrolling.
- Gives AI agents explicit rules for reusing only approved components and states.

## Browse the Library

[Open PLAZA UI](https://mxmsmnv.github.io/plaza-ui/?v=1.0.0).

Start with the overview, search or choose a category. Opening a component shows its examples and source references. The overview itself has no live component frames.

The catalog interface uses Inter, the original PLAZA logo and the existing Remix Icons selection. Component specimens retain their own approved fonts and styles, including Lora and Montserrat.

## Run Locally

This is a static website. No build step or runtime CDN is required.

```sh
python3 -m http.server 8047
```

Open [localhost:8047](http://localhost:8047/).

## Alpine.js and GSAP

Alpine.js 3.17.5 CSP owns UI state and event bindings. GSAP 3.15.0 and CustomEase own procedural animations, frame scheduling and rendered CSS keyframes. Small CSS hover transitions and required browser platform APIs remain native.

Local bundles and their notices are included. The examples are integration references, not independent installable packages: check the referenced styles, context and runtime dependencies before reuse.

## AI Implementation Rules

Read [AGENTS.md](AGENTS.md) before implementing a task. Use only existing PLAZA UI components, variants, states, tokens and icons. A missing element requires an explicit decision; do not silently invent one.

Merge these scoped rules into a consuming project's instructions or attach the file to the AI task. Preserve that project's existing instructions.

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for structure, component reuse, runtime behavior and verification limits.

See [CHANGELOG.md](CHANGELOG.md) for the initial release notes.

The source inventory and detailed evidence are maintained in the private [plaza-components](https://github.com/mxmsmnv/plaza-components) archive. This public repository contains no WordPress PHP, database export or credentials.

## Author

Catalog tooling and documentation: Maxim Semenov<br>
[smnv.org](https://smnv.org)<br>
[maxim@smnv.org](mailto:maxim@smnv.org)

Original PLAZA components and media remain attributed to their respective owners.

## License

See [LICENSE](LICENSE): MIT for original catalog tooling and documentation only. Original PLAZA materials and third-party dependencies retain their own rights and terms. Notices are included in `licenses/` and bundle headers.
