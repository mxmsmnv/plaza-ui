# PLAZA UI — instructions for AI coding agents

These rules apply when building or changing an interface with PLAZA UI. They govern component selection and implementation; they do not authorize unrelated changes or replace higher-priority project instructions.

## Use only the existing design system

**Every visible UI element must reuse an existing PLAZA UI component, variant, state or documented composition. Do not invent new visual elements or create approximate lookalikes.**

The canonical repository is https://github.com/mxmsmnv/plaza-ui.
The live reference is https://mxmsmnv.github.io/plaza-ui/.

A new page may compose existing components. A new component, variant, token, icon or animation requires the user's explicit approval before implementation. Approval is limited to the specified addition; it does not permit a general redesign.

## Read the implementation before coding

Resolve the following paths against the PLAZA UI checkout, not against the consuming application. If no checkout is available, read the equivalent files from the canonical repository or live reference.

1. Read `catalog.json` to identify component IDs, selectors, profiles, variants and declared states. Use `content.ru.json` for human-readable names and descriptions.
2. Read `examples.json` to find the actual specimen paths for the selected component and profile.
3. Read the selected `examples/*.json` payloads, including `markup`, `styles`, `inline_css`, `body_class`, `ancestors`, `layout`, `runtime_context` and `runtime_scripts` when present.
4. Inspect the referenced CSS, assets and runtime modules. Open the component's live page (`#<component-id>`) to inspect the separate element and state sections where necessary. Applicable states are also discovered by `state-preview.js`; an inventory label alone is not implementation evidence.
5. Before editing, make a short mapping: requested UI part → component ID → specimen path/profile → required state → dependencies. Keep this in task notes or the implementation summary; do not add it to the product interface.

Do not guess behavior from a screenshot, a component name or a thumbnail. If the relevant implementation cannot be read, identify the missing source and do not fabricate it.

## Preserve the selected component

- Reuse actual markup, classes, assets and behavior. Preserve required wrappers, body/profile classes and runtime context when adapting to the host application.
- Use the profile requested by the task. When the application has an established profile, keep it. If the profile is genuinely ambiguous and affects the result, ask once before choosing; do not mix resort variants to create a new appearance.
- Preserve typography, hierarchy, spacing, colors, borders, radii, shadows, proportions, image treatment and responsive behavior from the selected example and its existing tokens.
- Use the existing layout and composition patterns. Content-driven repetition of an existing card or list item is allowed; invented containers, decorative sections or new spacing scales are not.
- Change text, links, images and data as the task requires, while keeping their semantic roles and the component structure. Write clear human copy. Do not invent facts, prices, testimonials or operational states.
- The catalog shell uses Inter. Component specimens have their own approved fonts, including Lora and Montserrat: use the specimen's typography for the product component, not the catalog shell's font by default.
- Use only icons already present in the chosen component or the design system's existing icon registry. The presence of Remix Icons does not authorize arbitrary icons from its full collection. Reuse the existing logo asset rather than typing a replacement wordmark.
- Do not add another UI kit, CSS framework, arbitrary design values or broad CSS overrides. Do not recreate a component from memory. Scope necessary integration styles and derive their values from the selected component or existing tokens.

## Keep behavior on the approved stack

- Use the existing Alpine.js CSP setup for simple UI state and event bindings.
- Use the existing GSAP/CustomEase setup and `PlazaMotion` helpers for procedural animations and frame scheduling. Reuse the selected component's durations, easing, offsets, sequencing and reduced-motion behavior.
- Preserve the existing small CSS hover transitions and required browser platform APIs. Do not add a second animation engine or competing event handlers to the same component.
- Preserve keyboard access, focus behavior, labels, ARIA relationships, disabled states, dialog dismissal and responsive/touch behavior. Do not implement an interaction only for pointer hover.
- The preview is a reference, not an installable standalone package: inspect and carry over its actual dependencies and required context. Keep one compatible framework bootstrap, initialize bindings once and clean up listeners, observers and animations when the component is removed.
- Preview-only controls, specimen cropping, sandbox restrictions and disabled demo submissions belong to the catalog. They are not product components. Connect application data and actions only within the requested task, preserving approved UI states and semantics.

## Handle gaps without inventing UI

If a requested element or required state is absent:

1. Check the catalog, specimen variants and existing compositions for a suitable match.
2. If a real match exists, reuse it and state which component was selected.
3. Otherwise, describe the specific gap, explain any existing alternative and ask whether the user wants that alternative or authorizes a new design-system addition.
4. Continue independent work using approved components. Leave the dependent part pending; do not silently insert a placeholder, generic UI-kit component or invented loading/error/empty state.

Routine content changes and composition of approved patterns do not need repeated approval. A request to build a page is not, by itself, approval to expand the design system.

## Verify and report honestly

Check the changed component's real behavior at the relevant desktop and mobile sizes, including the states affected by the task. Use focused checks proportional to the change. Create screenshots only when the user explicitly requests them.

Before finishing, confirm that each visible element maps to an existing component/specimen, no unauthorized variant or token was added, dependencies initialize once, and affected interactions and accessibility behavior work. Fix violations before delivery.

In the implementation summary, list the component IDs and specimen/profile choices used, the checks performed and any unresolved gap. Distinguish source reuse from adaptations. Do not claim pixel equality, complete state coverage or successful external integrations without evidence.
