---
version: "1.0"
name: "minifoot."
description: "Design system for Minifoot, a quiet, dense, keyboard-first football manager."
colors:
  primary: "#0B0D10"
  ink-950: "#08090C"
  ink-900: "#0B0D10"
  ink-800: "#14171C"
  ink-700: "#1B2027"
  ink-600: "#252B33"
  ink-500: "#2A3038"
  ink-400: "#3A4250"
  ink-300: "#5A6371"
  ink-200: "#8A93A0"
  ink-100: "#C4CAD3"
  ink-050: "#ECEFF4"
  pitch: "#4ADE80"
  pitch-deep: "#22C55E"
  whistle: "#FACC15"
  card: "#F87171"
  bone: "#ECEFF4"
typography:
  text-3xs:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 0
  text-2xs:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 0
  text-xs:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  text-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  text-base:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  text-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: -0.02em
  text-xl:
    fontFamily: Geist
    fontSize: 25px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: -0.02em
  text-2xl:
    fontFamily: Geist
    fontSize: 31px
    fontWeight: 700
    lineHeight: 40px
    letterSpacing: -0.02em
  text-3xl:
    fontFamily: Geist
    fontSize: 39px
    fontWeight: 700
    lineHeight: 48px
    letterSpacing: -0.02em
  text-display:
    fontFamily: JetBrains Mono
    fontSize: 56px
    fontWeight: 700
    lineHeight: 64px
    letterSpacing: 0
  mono-sm:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0
rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 10px
  lg: 14px
  pill: 9999px
spacing:
  space-0: 0px
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-5: 20px
  space-6: 24px
  space-8: 32px
  space-10: 40px
  space-12: 48px
  space-16: 64px
  space-20: 80px
components:
  app-shell:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink-050}"
    typography: "{typography.text-base}"
  splash:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.bone}"
    typography: "{typography.text-3xl}"
    padding: "{spacing.space-6}"
  logo-wordmark:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.bone}"
    typography: "{typography.text-3xl}"
  logo-monogram:
    backgroundColor: "{colors.ink-800}"
    textColor: "{colors.bone}"
    typography: "{typography.text-lg}"
    rounded: "{rounded.md}"
    width: 64px
    height: 64px
  logo-monogram-dot:
    backgroundColor: "{colors.pitch}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.pill}"
    width: 4px
    height: 4px
  sidebar:
    backgroundColor: "{colors.ink-800}"
    textColor: "{colors.ink-200}"
    rounded: "{rounded.none}"
    width: 248px
  panel:
    backgroundColor: "{colors.ink-800}"
    textColor: "{colors.ink-050}"
    typography: "{typography.text-base}"
    rounded: "{rounded.md}"
    padding: "{spacing.space-5}"
  border-subtle:
    backgroundColor: "{colors.ink-500}"
    textColor: "{colors.ink-050}"
    height: 1px
  panel-elevated:
    backgroundColor: "{colors.ink-700}"
    textColor: "{colors.ink-050}"
    typography: "{typography.text-base}"
    rounded: "{rounded.md}"
    padding: "{spacing.space-5}"
  tooltip:
    backgroundColor: "{colors.ink-600}"
    textColor: "{colors.ink-050}"
    typography: "{typography.text-xs}"
    rounded: "{rounded.sm}"
    padding: "{spacing.space-2}"
  divider:
    backgroundColor: "{colors.ink-400}"
    textColor: "{colors.ink-100}"
    height: 1px
  text-disabled:
    backgroundColor: "{colors.ink-050}"
    textColor: "{colors.ink-300}"
    typography: "{typography.text-sm}"
  modal-backdrop-surface:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.bone}"
  button-primary:
    backgroundColor: "{colors.pitch}"
    textColor: "{colors.ink-900}"
    typography: "{typography.text-sm}"
    rounded: "{rounded.sm}"
    height: 44px
    padding: "{spacing.space-4}"
  button-primary-hover:
    backgroundColor: "{colors.pitch-deep}"
    textColor: "{colors.ink-900}"
    typography: "{typography.text-sm}"
    rounded: "{rounded.sm}"
    height: 44px
  button-secondary:
    backgroundColor: "{colors.ink-700}"
    textColor: "{colors.bone}"
    typography: "{typography.text-sm}"
    rounded: "{rounded.sm}"
    height: 36px
    padding: "{spacing.space-4}"
  button-danger:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.card}"
    typography: "{typography.text-sm}"
    rounded: "{rounded.sm}"
    height: 36px
  table-header:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.ink-200}"
    typography: "{typography.text-2xs}"
    height: 36px
  table-row:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.bone}"
    typography: "{typography.text-sm}"
    height: 36px
  table-row-hover:
    backgroundColor: "{colors.ink-800}"
    textColor: "{colors.bone}"
    typography: "{typography.text-sm}"
    height: 36px
  table-row-selected:
    backgroundColor: "{colors.ink-700}"
    textColor: "{colors.bone}"
    typography: "{typography.text-sm}"
    height: 36px
  badge-warning:
    backgroundColor: "{colors.whistle}"
    textColor: "{colors.ink-900}"
    typography: "{typography.text-3xs}"
    rounded: "{rounded.xs}"
    padding: "{spacing.space-2}"
  badge-danger:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-900}"
    typography: "{typography.text-3xs}"
    rounded: "{rounded.xs}"
    padding: "{spacing.space-2}"
  badge-success:
    backgroundColor: "{colors.pitch}"
    textColor: "{colors.ink-900}"
    typography: "{typography.text-3xs}"
    rounded: "{rounded.xs}"
    padding: "{spacing.space-2}"
---

## Overview

Minifoot is the football manager that respects your time. It is fast, dense, quiet, and built around one meaningful decision at a time.

The official wordmark is `minifoot.`: lowercase, typographic, and final. The dot is part of the name. The product should feel like a modern command center for Brazilian football, not a sports portal.

## Colors

The system uses an Ink surface scale plus four functional colors. Color is decision, not decoration.

- **Ink 900 (#0B0D10):** default app background.
- **Ink 800 (#14171C):** panels, cards, sidebar, inputs.
- **Ink 700 (#1B2027):** selected rows, hover surfaces, popovers.
- **Ink 600 (#252B33):** tooltips and higher raised surfaces.
- **Ink 500 (#2A3038):** subtle borders.
- **Ink 400 (#3A4250):** stronger dividers and structural borders.
- **Ink 300 (#5A6371):** disabled text.
- **Ink 200 (#8A93A0):** muted text and metadata.
- **Ink 100 (#C4CAD3):** strong secondary text.
- **Ink 050 / Bone (#ECEFF4):** primary text and logo on dark backgrounds.
- **Pitch (#4ADE80):** primary action, success, positive deltas, achievement, focus.
- **Pitch Deep (#22C55E):** hover state for Pitch.
- **Whistle (#FACC15):** warnings, yellow cards, light injuries, neutral alerts.
- **Card (#F87171):** red cards, severe loss, destructive action, danger.

Do not use blue, purple, orange accents, Brazilian flag motifs, or color gradients as screen backgrounds.

## Typography

Use Geist for display, body, labels, and UI. Use Geist Mono for tabular data. Use JetBrains Mono only for the large Match Day score.

Weights are limited to 400, 500, and 700. Italic is prohibited in the product UI.

Headings at `text-lg` and above use `letter-spacing: -0.02em`. Body text uses `0`. All-caps labels are rare and use `0.08em`.

Enable tabular numbers for data-heavy UI: standings, salaries, scores, values, and match stats.

## Logo

The primary logo is a wordmark:

```txt
minifoot.
```

Rules:

- Always lowercase.
- `mini` uses medium weight, `foot` uses bold.
- The final dot is part of the logo.
- No football icon, no gradient, no shadow, no uppercase version.
- Use the `mf.` monogram only for app icon, favicon, compact splash, or social avatar.

## Layout

The product is dashboard-first:

- Fixed compact sidebar.
- Dense main content.
- Tables as first-class UI.
- One dominant advance action in the lower-right area.
- No marketing hero inside the product.
- No decorative cards inside other cards.

Density is respect. Show data with hierarchy, not ornament.

## Components

Buttons:

- Primary: Pitch background, Ink 900 text, used only for the main commitment action.
- Secondary: Ink 700 background, Bone text, subtle border.
- Ghost: transparent, Bone text, Ink 800 hover.
- Danger: Card text, transparent background, Card border.

Tables:

- Default row height is 36px.
- Comfortable density may use 44px.
- Headers use small uppercase muted labels.
- No zebra rows.
- Selected row uses Ink 700 and a 2px Pitch indicator.
- Numeric columns use mono and tabular figures.

Cards:

- Background Ink 800.
- Border Ink 500.
- Radius 10px.
- Padding 20px.
- Use cards only for repeated status items, modals, popovers, and framed tools.

Focus:

```css
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: inherit;
}
```

## Motion

Motion is functional and rare.

- Fast: 120ms for hover, focus, and simple state changes.
- Base: 200ms for screen transitions and modal open.
- Slow: 320ms for splash or full-screen entry.

Nothing exceeds 320ms except one-off celebration moments. Respect `prefers-reduced-motion`.

## Voice

Short. Dry. Portuguese in the product.

Use:

- Elenco
- Tática
- Próxima rodada
- Avançar
- Salvar
- Mercado
- Lesão
- Aposentadoria

Avoid jargon and forced excitement.

Empty states can carry personality:

- "Departamento médico vazio. Aproveite enquanto dura."
- "Nenhuma proposta. Seu elenco está confortável - ou esquecido."
- "Sem manchetes. A imprensa está distraída."
- "Vitrine vazia. Por enquanto."

## Guardrails

Do:

- Use only tokens for color, typography, spacing, radius, motion, and focus.
- Keep the next action visible.
- Make every interaction work with mouse and keyboard.
- Preserve the 70/20/10 color balance: Ink, Bone, functional color.
- Test at 1280x720.

Don't:

- Add mascot, football decoration, stock players, flag motifs, glow, glassmorphism, or looping background animation.
- Use more than one accent color per screen.
- Hide actions until hover.
- Use drag-and-drop without keyboard parity.
- Make light mode the default.
