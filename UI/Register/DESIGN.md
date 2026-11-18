---
name: Monolith Engineering
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#a33800'
  on-secondary: '#ffffff'
  secondary-container: '#cd4800'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c1c'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#802a00'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  technical-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  technical-code:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies Swiss Editorial Design blended with Minimal Industrial engineering precision. Built for a high-performance electronic hardware and computing marketplace, the aesthetic balances the rigor of technical documentation with the stark clarity of international typographical style.

### Emotional Response & Personality
- **Precision & Reliability:** Unyielding structural discipline that inspires complete trust during high-value technical purchases.
- **Utilitarian Elegance:** Stripped of extraneous decoration; every line, division, and surface serves an ergonomic or informational purpose.
- **Editorial Sharpness:** High visual contrast, crisp mechanical rhythm, and authoritative typography communicate industrial power and modern technology.

### Aesthetic Foundation
- **Monochrome Engineering Canvas:** Architectural neutral surfaces ranging from stark white to dark carbon framing devices cleanly.
- **Single-Point Tension:** High-intensity electric orange (`#FF5C00`) used exclusively as a purposeful focal point for conversions, status calls, and primary calls to action.
- **Micro-Metric Data Display:** Dense technical specs, SKUs, and pricing treatments presented with monospace accuracy.

## Colors

The palette operates under a high-contrast industrial ethos. The background remains clean and expansive, letting product hardware renders stand out without chromatic competition.

### Core Roles & Tokens
- **Primary (`#171717`):** Deep carbon black for primary headlines, high-priority icons, dominant borders, and structural framing.
- **Accent / Secondary (`#FF5C00`):** Electric industrial orange. Reserved strictly for primary action states, interactive hovers, promotional tags, and checkout CTAs. Never used for decorative backgrounds or non-interactive containers.
- **Tertiary / Muted (`#737373`):** Neutral slate for secondary descriptions, specification labels, metadata timestamps, and disabled states.
- **Surface / Neutral (`#F5F5F5`):** Soft mechanical off-white for secondary cards, sub-navigation panels, and subtle module backdrops.
- **Canvas / Background (`#FFFFFF`):** Pure stark white for base screens and primary product showcase tiers.
- **Hairline Border (`#E5E5E5`):** 1px structural dividing lines across cards, tables, headers, and inputs.

### System Feedback States
- **Success (`#15803D`):** Inventory in-stock, successful checkout, verified status badges.
- **Warning (`#D97706`):** Low inventory alert, pending verification, payment timeouts.
- **Danger (`#DC2626`):** Out of stock, critical validation errors, transaction cancellations.

## Typography

The typographic hierarchy implements a three-family architecture tailored for technical e-commerce:

1. **Be Vietnam Pro (Display & Structural Headings):** Geometric, contemporary, and assertive. Provides strong architectural framing across editorial hero banners, product category labels, and landing section headers.
2. **Inter (Application UI & Editorial Body):** Neutral, legible, and balanced. Used for long descriptions, contextual copy, navigation menus, and form labels to maximize scanning speed.
3. **JetBrains Mono (Technical Engine):** Industrial monospace precision. Used exclusively for SKU identifiers, serial keys, inventory counts, currency formatting, and dimensional hardware specifications.

### Typographic Rules
- Numeric pricing is always typeset with tabular figures or within mono specs to ensure visual alignment during rapid price scanning.
- Section tags and metadata prefixes (e.g., `01. CATALOG`, `REV-2024`) use `technical-code` in all caps with loose tracking (+0.04em).

## Layout & Spacing

The layout is grounded in a strict 8px spatial grid, reinforcing an industrial workbench aesthetic where every element snaps to mathematical coordinates.

### Grid Framework
- **Desktop (>= 1280px):** 12-column layout with 24px (`1.5rem`) gutters and a centered maximum width container of 1440px with 32px (`2rem`) outer canvas margins.
- **Tablet (768px - 1279px):** 8-column layout with 16px (`1rem`) gutters and 24px (`1.5rem`) side margins.
- **Mobile (< 768px):** 4-column layout with 12px or 16px gutters and 16px (`1rem`) edge margins. Product grids collapse from 4 columns to 2 columns, then single column for spec-heavy comparisons.

### Spacing Scale & Rhythm
- Spacing values derive strictly from the base 8 system (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- Card padding remains uniformly structured at `space-md` (16px) for compact listings and `space-lg` (24px) for expansive hero or product detail panels.

## Elevation & Depth

This design system departs from heavy skeuomorphic drop shadows, opting instead for crisp structural planes inspired by precision-milled hardware.

### Low-Contrast Outlines & Tonal Planes
- **Surface Elevation:** Depth is achieved primarily through surface shifts—from white canvases (`#FFFFFF`) to container surfaces (`#F5F5F5`), bordered by razor-sharp 1px lines (`#E5E5E5`).
- **Hairline Definition:** All cards, dialogs, inputs, and drawers use continuous 1px strokes (`#E5E5E5`) to maintain mechanical definition.
- **Micro Ambient Shadow:** Where overlay separation is imperative (e.g., sticky navigation bars, modals, flyout carts), use an ambient shadow with zero color tint:
  - `box-shadow: 0 4px 20px -2px rgba(23, 23, 23, 0.06), 0 2px 6px -1px rgba(23, 23, 23, 0.04);`
- **Focus & Selection Elevation:** Interactive focus states eschew heavy shadows in favor of a crisp 2px offset ring in `#171717` or `#FF5C00`.

## Shapes

The geometric architecture relies on balanced, subtle radii that prevent the interface from appearing either clinical or toy-like.

### Radii Guidelines
- **Core Radius (`8px` / `0.5rem`):** Applied systematically across product cards, image viewports, standard buttons, and text input fields.
- **Secondary Small Radius (`4px` / `0.25rem`):** Applied to internal tags, monospace technical chips, mini counters, and badge pills.
- **Nested Containers:** Inner items nested within an 8px card maintain a 4px corner radius to preserve concentric visual harmony.

## Components

### Buttons
- **Primary CTA:** Solid `#FF5C00` background with `#FFFFFF` text. Bold weight, 8px border radius, 0px border. Hover transitions to `#E05200`. Active state subtly scales to 0.99.
- **Secondary / Monolith Dark:** Solid `#171717` background with `#FFFFFF` text. Used for technical triggers, filters, and standard navigational commits.
- **Ghost / Outlined:** `#FFFFFF` background with 1px `#E5E5E5` border and `#171717` text. On hover: background shifts to `#F5F5F5` and border shifts to `#171717`.
- **Icon Buttons:** Fixed 40x40px or 36x36px containers with 8px radius, enclosed in a 1px `#E5E5E5` frame.

### Chips & Badges
- **Status Tags (In Stock / SKU):** Monospace font (`JetBrains Mono`), uppercase, 11px, with 4px border radius. Padding: 2px 8px.
- **Filter Chips:** 32px height, 1px `#E5E5E5` border, `#F5F5F5` inactive background. When active: `#171717` background with `#FFFFFF` text.

### Form Inputs & Search Fields
- **Search Bar:** Prominent 48px height with 1px `#E5E5E5` border, `#FFFFFF` or `#F5F5F5` background, housing a 16px search icon. Text placeholder in `#737373`.
- **Text Inputs:** 40px height, 8px radius, 12px horizontal padding. Border highlights to `#171717` on focus with no glowing halo. Error states invoke `#DC2626` border with monospace error captions below.

### Cards & Hardware Displays
- **Product Cards:** Constructed on `#FFFFFF` with a 1px `#E5E5E5` perimeter border and 8px corner radius.
- **Image Staging:** Products sit on uniform `#F5F5F5` neutral background plates within the card, framed cleanly to highlight industrial silhouettes.
- **Metadata Stack:** Card anatomy follows strict order: Brand/Category (11px Mono uppercase, `#737373`), Product Title (14px Be Vietnam Pro, `#171717`), Rating Stars with numeric count, and Primary Price (16px JetBrains Mono bold) paired with an instant cart icon button.

### Tables & Specification Lists
- Data rows feature alternating `#FFFFFF` and `#F5F5F5` rows separated by 1px hairline rules.
- Hardware spec keys are styled in `#737373` Inter regular, while matching values are rendered in `#171717` JetBrains Mono.