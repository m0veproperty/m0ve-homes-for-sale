---
name: M0VE — Homes for sale
description: Shared editorial property interface with retained imagery and evidence.
colors:
  ink: "#153345"
  paper: "#faf8f3"
  muted: "#536570"
  purple: "#6945c5"
  soft: "#eee8f8"
  line: "#d9dce0"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  body:
    fontFamily: "'M0VE Sans', Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  label:
    fontFamily: "'M0VE Sans', Arial, sans-serif"
    fontSize: "11px"
    lineHeight: 1.5
    letterSpacing: "0.12em"
rounded:
  button: "10px"
components:
  header-action:
    backgroundColor: "{colors.purple}"
    textColor: "#fff"
    rounded: "{rounded.button}"
    padding: "12px 18px"
---

# Design System: M0VE — Homes for sale

## Overview

Warm paper, navy evidence and purple actions unify the existing property imagery and atlas compositions. Georgia headlines provide an editorial voice; Manrope keeps controls and data legible.

This is a code-derived refresh of the established direction, not a new identity. Source: `m0ve-system.css` and this project's existing page styles. Responsive rules are documented from source; mobile visual QA has not been performed.

## Colors

Purple marks primary actions and emphasized editorial words. Navy carries text and dark evidence bands. Warm paper is the main canvas; muted blue-gray supports secondary copy, lavender provides soft panels, and pale gray defines boundaries. Retain illustration colors and page-specific data accents.

## Typography

The display token describes major headings; second-level headings use a 1.12 line height. Manrope is served under the CSS family name M0VE Sans. Main reading copy generally uses 15–17px, controls 13–16px and evidence captions 12px. Eyebrows remain 11px; some map and chart annotations are smaller. Numerical evidence uses tabular figures where assigned. At 600px the shared headline rule uses `clamp(38px,10.8vw,54px)`, with page-specific overrides taking precedence.

## Layout

The shared header uses a 4.5% horizontal inset and an 84px minimum height. At 900px it changes to 20px side padding, a 76px minimum height and a menu-triggered vertical navigation. At 600px shared content wrappers use viewport width minus 40px. Section navigation can scroll horizontally.

The filter toolbar becomes three columns at 1100px and two at 760px, with location and the filter action spanning the latter grid. Small-screen detail facts use two columns; result controls and comparison tray wrap.

## Elevation & Depth

Paper, tonal panels and thin borders supply most hierarchy. Shared headers are flat; the open mobile navigation uses a restrained shadow (`0 18px 30px #15334512`). Preserve shadows within original illustrations rather than flattening their visual construction.

## Shapes

Shared actions use gently rounded corners. Panels retain their page-specific 12–16px radii; illustration geometry is independent of UI corner rules. Menu and most icon controls have a 44px minimum target. These are component rules, not a claim that every legacy control has the same dimensions.

## Components

Header actions use purple and white; navigation has muted text and purple current-page links. Preserve the actual M0VE logo. Shared fields use purple carets and accents; text-entry controls reach 16px at 600px. Keyboard focus uses a 3px purple outline with a 4px offset. Shared actions depress by 1px when active. Reduced-motion CSS minimizes transition and animation duration.

Property photography leads each listing. Prices use Manrope at 32px and weight 600; card titles use Manrope at 20px. Preserve filters, save controls, galleries and comparisons, and keep asking prices distinct from estimates.

The shared logo is served from `m0ve-home-page`; Manrope is served from `m0ve-homes-for-sale`. These remain first-party cross-project asset dependencies.

## Do's and Don'ts

- Do preserve the existing imagery, atlas forms, interactions and factual caveats.
- Do keep keyboard focus visible and respect reduced-motion preferences.
- Don't treat the shared type sizes as universal: small labels and chart annotations retain documented exceptions.
- Don't substitute decorative shadows for the existing paper, border and tonal hierarchy.
