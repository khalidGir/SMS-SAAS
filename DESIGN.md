---
version: alpha
name: NexaSoft SMS
description: A centralized School Management System — multi-tenant enrollment, fee management, and role-based administration. Dark sidebar anchor with a light indigo-accented workspace.

colors:
  # ── Surface / Background ────────────────────
  surface-canvas: "#f9fafb"
  surface-panel: "#ffffff"
  surface-sidebar: "#111827"
  surface-sidebar-hover: "#1f2937"
  surface-sidebar-active: "rgba(139, 92, 246, 0.10)"
  surface-header: "#ffffff"
  surface-brand-icon: "#6c3aed"
  surface-brand-glow: "rgba(108, 58, 237, 0.30)"
  surface-input-disabled: "#f3f4f6"

  # ── Text ────────────────────────────────────
  text-primary: "#111827"
  text-secondary: "#6b7280"
  text-muted: "#9ca3af"
  text-caption: "#9ca3af"
  text-inverse: "#ffffff"
  text-link: "#7c3aed"
  text-sidebar-inactive: "#9ca3af"
  text-sidebar-active: "#c4b5fd"
  text-sidebar-hover: "#e5e7eb"
  text-sidebar-name: "#e5e7eb"
  text-header-title: "#111827"
  text-header-subtitle: "#6b7280"
  text-error: "#dc2626"
  text-label: "#374151"
  text-placeholder: "#9ca3af"

  # ── Border / Ring ────────────────────────────
  border-default: "#e5e7eb"
  border-default-80: "rgba(229, 231, 235, 0.80)"
  border-sidebar: "#1f2937"
  border-input: "#d1d5db"
  border-input-focus: "#6c3aed"
  border-dashed: "#d1d5db"

  # ── Interactive ──────────────────────────────
  primary-bg: "#6c3aed"
  primary-hover: "#5b21b6"
  primary-ring: "#8b5cf6"
  destructive-bg: "#dc2626"
  destructive-hover: "#b91c1c"
  secondary-border: "#d1d5db"
  secondary-text: "#374151"
  secondary-hover-bg: "#f9fafb"

  # ── Semantic Status (Financial) ──────────────
  financial-paid-bg: "#ecfdf5"
  financial-paid-text: "#047857"
  financial-paid-ring: "rgba(5, 150, 105, 0.20)"
  financial-partial-bg: "#fffbeb"
  financial-partial-text: "#b45309"
  financial-partial-ring: "rgba(217, 119, 6, 0.20)"
  financial-unpaid-bg: "#fff1f2"
  financial-unpaid-text: "#be123c"
  financial-unpaid-ring: "rgba(225, 29, 72, 0.20)"
  financial-overdue-bg: "#fff1f2"
  financial-overdue-text: "#be123c"
  financial-overdue-ring: "rgba(225, 29, 72, 0.20)"
  financial-refunded-bg: "#f8fafc"
  financial-refunded-text: "#64748b"
  financial-refunded-ring: "rgba(100, 116, 139, 0.20)"
  financial-voided-bg: "#f8fafc"
  financial-voided-text: "#94a3b8"
  financial-voided-ring: "rgba(148, 163, 184, 0.20)"

  # ── Semantic Status (Lifecycle) ──────────────
  lifecycle-active-bg: "#f0fdf4"
  lifecycle-active-text: "#15803d"
  lifecycle-active-ring: "rgba(22, 163, 74, 0.20)"
  lifecycle-suspended-bg: "#fefce8"
  lifecycle-suspended-text: "#a16207"
  lifecycle-suspended-ring: "rgba(202, 138, 4, 0.20)"
  lifecycle-expelled-bg: "#fef2f2"
  lifecycle-expelled-text: "#b91c1c"
  lifecycle-expelled-ring: "rgba(220, 38, 38, 0.20)"
  lifecycle-withdrawn-bg: "#f9fafb"
  lifecycle-withdrawn-text: "#6b7280"
  lifecycle-withdrawn-ring: "rgba(107, 114, 128, 0.20)"
  lifecycle-graduated-bg: "#eff6ff"
  lifecycle-graduated-text: "#1d4ed8"
  lifecycle-graduated-ring: "rgba(37, 99, 235, 0.20)"
  lifecycle-pending-bg: "#fefce8"
  lifecycle-pending-text: "#a16207"
  lifecycle-pending-ring: "rgba(202, 138, 4, 0.20)"
  lifecycle-transferred-bg: "#faf5ff"
  lifecycle-transferred-text: "#7e22ce"
  lifecycle-transferred-ring: "rgba(147, 51, 234, 0.20)"

  # ── Role Badge (Sidebar footer) ──────────────
  role-superadmin-bg: "rgba(168, 85, 247, 0.20)"
  role-superadmin-text: "#d8b4fe"
  role-superadmin-ring: "rgba(168, 85, 247, 0.30)"
  role-admin-bg: "rgba(59, 130, 246, 0.20)"
  role-admin-text: "#93c5fd"
  role-admin-ring: "rgba(59, 130, 246, 0.30)"
  role-registrar-bg: "rgba(34, 197, 94, 0.20)"
  role-registrar-text: "#86efac"
  role-registrar-ring: "rgba(34, 197, 94, 0.30)"
  role-accountant-bg: "rgba(217, 119, 6, 0.20)"
  role-accountant-text: "#fcd34d"
  role-accountant-ring: "rgba(217, 119, 6, 0.30)"
  role-parent-bg: "rgba(20, 184, 166, 0.20)"
  role-parent-text: "#5eead4"
  role-parent-ring: "rgba(20, 184, 166, 0.30)"

  # ── Toast ────────────────────────────────────
  toast-success-bg: "#16a34a"
  toast-error-bg: "#dc2626"
  toast-text: "#ffffff"

  # ── Icon accent (MetricCard) ─────────────────
  icon-accent-bg: "#f5f3ff"
  icon-accent-text: "#7c3aed"

typography:
  display:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: "700"
    lineHeight: 1.25
  heading-page:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: "700"
    lineHeight: 1.25
    letterSpacing: -0.025em
  heading-card:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: "600"
    lineHeight: 1.5
  body:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: 1.5
  label:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: "500"
    lineHeight: 1.5
  table-header:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: "600"
    lineHeight: 1.25
    letterSpacing: 0.05em
  caption:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: "400"
    lineHeight: 1.25
  metric-value:
    fontFamily: Geist
    fontSize: 1.875rem
    fontWeight: "700"
    lineHeight: 1.25
    letterSpacing: -0.025em
  badge:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: "500"
    lineHeight: 1.25
  code:
    fontFamily: "Geist Mono"
    fontSize: 0.75rem

rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  sidebar-width: 256px

components:
  # ── Sidebar ──────────────────────────────────
  sidebar-container:
    backgroundColor: "{colors.surface-sidebar}"
    borderRight: "1px solid {colors.border-sidebar}"
    width: "{spacing.sidebar-width}"
  sidebar-brand-icon:
    backgroundColor: "{colors.surface-brand-icon}"
    boxShadow: "0 1px 2px 0 {colors.surface-brand-glow}"
    rounded: "{rounded.lg}"
  sidebar-brand-text:
    typography: "{typography.heading-card}"
    color: "{colors.text-inverse}"
  sidebar-nav-inactive:
    color: "{colors.text-sidebar-inactive}"
    backgroundColor: transparent
  sidebar-nav-active:
    backgroundColor: "{colors.surface-sidebar-active}"
    color: "{colors.text-sidebar-active}"
    ring: "1px inset {colors.primary-ring}20"
    rounded: "{rounded.md}"
  sidebar-nav-hover:
    backgroundColor: "{colors.surface-sidebar-hover}"
    color: "{colors.text-sidebar-hover}"
  sidebar-footer-avatar:
    backgroundColor: "rgba(139, 92, 246, 0.20)"
    color: "{colors.text-sidebar-active}"
    rounded: "{rounded.full}"
  sidebar-footer-name:
    color: "{colors.text-sidebar-name}"

  # ── Header / TopBar ──────────────────────────
  header-container:
    backgroundColor: "{colors.surface-header}"
    borderBottom: "1px solid {colors.border-default}"
    height: 64px
  header-title:
    typography: "{typography.heading-card}"
    color: "{colors.text-header-title}"
  header-subtitle:
    typography: "{typography.caption}"
    color: "{colors.text-header-subtitle}"

  # ── Metric Card ──────────────────────────────
  metric-card:
    backgroundColor: "{colors.surface-panel}"
    border: "1px solid {colors.border-default-80}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  metric-card-hover:
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.10)"
    translateY: -2px
  metric-card-label:
    typography: "{typography.label}"
    color: "{colors.text-secondary}"
  metric-card-value:
    typography: "{typography.metric-value}"
    color: "{colors.text-primary}"
  metric-card-icon:
    backgroundColor: "{colors.icon-accent-bg}"
    color: "{colors.icon-accent-text}"
    rounded: "{rounded.lg}"
  metric-card-error:
    border: "1px dashed {colors.financial-unpaid-ring}"
    backgroundColor: "rgba(255, 241, 242, 0.50)"

  # ── Data Table ───────────────────────────────
  data-table-header-cell:
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.table-header}"
    color: "{colors.text-secondary}"
  data-table-body-cell:
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.body}"
  data-table-row-hover:
    backgroundColor: "{colors.surface-canvas}"
  data-table-empty:
    border: "1px dashed {colors.border-dashed}"
    rounded: "{rounded.lg}"

  # ── Status Badge ─────────────────────────────
  badge-base:
    rounded: "{rounded.full}"
    padding: "2px {spacing.sm}"
    typography: "{typography.badge}"
    ring: "1px inset"
  badge-paid:
    backgroundColor: "{colors.financial-paid-bg}"
    color: "{colors.financial-paid-text}"
    ringColor: "{colors.financial-paid-ring}"
  badge-partial:
    backgroundColor: "{colors.financial-partial-bg}"
    color: "{colors.financial-partial-text}"
    ringColor: "{colors.financial-partial-ring}"
  badge-unpaid:
    backgroundColor: "{colors.financial-unpaid-bg}"
    color: "{colors.financial-unpaid-text}"
    ringColor: "{colors.financial-unpaid-ring}"
  badge-overdue:
    backgroundColor: "{colors.financial-overdue-bg}"
    color: "{colors.financial-overdue-text}"
    ringColor: "{colors.financial-overdue-ring}"
    textDecoration: line-through
  badge-refunded:
    backgroundColor: "{colors.financial-refunded-bg}"
    color: "{colors.financial-refunded-text}"
    ringColor: "{colors.financial-refunded-ring}"
    textDecoration: line-through
  badge-voided:
    backgroundColor: "{colors.financial-voided-bg}"
    color: "{colors.financial-voided-text}"
    ringColor: "{colors.financial-voided-ring}"
    textDecoration: line-through

  # ── Buttons ──────────────────────────────────
  button-primary:
    backgroundColor: "{colors.primary-bg}"
    color: "{colors.text-inverse}"
    padding: "10px {spacing.lg}"
    rounded: "{rounded.lg}"
    fontWeight: "600"
    fontSize: "0.875rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-focus:
    ring: "2px {colors.primary-ring}"
    ringOffset: 2px
  button-primary-disabled:
    opacity: 0.5
    cursor: not-allowed
  button-destructive:
    backgroundColor: "{colors.destructive-bg}"
    color: "{colors.text-inverse}"
    padding: "10px {spacing.lg}"
    rounded: "{rounded.lg}"
    fontWeight: "600"
  button-destructive-hover:
    backgroundColor: "{colors.destructive-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-panel}"
    border: "1px solid {colors.secondary-border}"
    color: "{colors.secondary-text}"
    padding: "10px {spacing.lg}"
    rounded: "{rounded.lg}"
    fontWeight: "500"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover-bg}"

  # ── Forms ────────────────────────────────────
  input:
    backgroundColor: "{colors.surface-panel}"
    border: "1px solid {colors.border-input}"
    rounded: "{rounded.md}"
    padding: "8px {spacing.md}"
    typography: "{typography.body}"
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  input-focus:
    borderColor: "{colors.border-input-focus}"
    ring: "1px {colors.border-input-focus}"
  input-disabled:
    backgroundColor: "{colors.surface-input-disabled}"
  input-error:
    color: "{colors.text-error}"
    fontSize: "0.75rem"
  input-label:
    typography: "{typography.label}"
    color: "{colors.text-label}"
  input-required:
    color: "#ef4444"

  # ── Modal ────────────────────────────────────
  modal-backdrop:
    backgroundColor: "rgba(0, 0, 0, 0.40)"
    position: fixed
    inset: 0
    zIndex: 50
  modal-panel:
    backgroundColor: "{colors.surface-panel}"
    rounded: "{rounded.lg}"
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10)"
  modal-header:
    borderBottom: "1px solid {colors.border-default}"
    padding: "{spacing.lg} {spacing.xl}"
  modal-title:
    typography: "{typography.heading-card}"
    color: "{colors.text-primary}"
  modal-close:
    rounded: "{rounded.sm}"
    color: "{colors.text-muted}"
  modal-close-hover:
    backgroundColor: "{colors.surface-canvas}"
    color: "{colors.text-secondary}"
  modal-footer:
    borderTop: "1px solid {colors.border-default}"
    paddingTop: "{spacing.lg}"

  # ── Toast ────────────────────────────────────
  toast-success:
    backgroundColor: "{colors.toast-success-bg}"
    color: "{colors.toast-text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.lg}"
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)"
  toast-error:
    backgroundColor: "{colors.toast-error-bg}"
    color: "{colors.toast-text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.lg}"
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)"

  # ── Quick Action Card ────────────────────────
  quick-action:
    border: "1px solid {colors.border-default-80}"
    rounded: "{rounded.xl}"
    padding: "14px {spacing.lg}"
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    fontWeight: "500"
    fontSize: "0.875rem"
  quick-action-hover:
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.10)"
    translateY: -2px

  # ── Skeleton ─────────────────────────────────
  skeleton:
    backgroundColor: "#e5e7eb"
    animation: pulse
    rounded: "{rounded.sm}"
---

## Overview

NexaSoft SMS presents as a **professional, high-density administration tool** — authoritative without being cold. The visual language takes cues from premium financial dashboards and enterprise ERP systems: a deep slate navigation anchor, a clean light workspace, and controlled violet accents that guide action without demanding attention. Subtle motion (scale-in modals, shimmer skeletons, lift-on-hover cards) adds a layer of polish while remaining performant and accessible.

The layout follows a **fixed sidebar + scrollable content** pattern, desktop-first with no hamburger menu. The sidebar is the persistent structural anchor at 256px. Every pixel of the workspace is allocated to data density — generous whitespace on cards, tight spacing in tables.

## Colors

### Architecture

The palette is built on **three contrast tiers**:

| Layer | Token | Role |
|---|---|---|
| Canvas | `surface-canvas` (#f9fafb) | Full-page background — recedes behind all content |
| Surface | `surface-panel` (#ffffff) | Cards, tables, form containers — pure white for maximum legibility |
| Anchor | `surface-sidebar` (#111827) | Deep slate sidebar — creates a visual "weight" on the left edge |

### Brand Interaction

**Violet** (`primary-bg` #6c3aed) is the sole interactive driver — every primary button, active link, and focus ring uses it. It never appears as a background fill on the canvas or as text color in body copy. This keeps action points unmistakable.

### Status Semantics

Five **financial status** colors (emerald for paid, amber for partial, rose for unpaid/overdue, slate for refunded/voided) and seven **lifecycle** colors (green, yellow, red, gray, blue, purple) map to the `StatusBadge` component. Every badge is `rounded-full` with a `ring-1 ring-inset` at 20% opacity of the status's 600-weight — a subtle colored halo on an otherwise soft background.

### Role Badges

Role badges in the sidebar footer use muted, dark-compatible colors — 20% background, 300-weight text, 30% ring. Each role gets a unique hue: Super Admin (purple), Admin (blue), Registrar (green), Accountant (amber), Parent (teal).

## Typography

### Font Stack

- **Primary**: Geist Sans (`--font-geist-sans`) — used for all UI text
- **Mono**: Geist Mono (`--font-geist-mono`) — reserved for codes, IDs, receipt numbers, and financial amounts in table cells
- Zero external font loads. No Google Fonts. No `@font-face` declarations.

### Hierarchy

| Level | Size | Weight | Line Ht | Letter Spacing | Token |
|---|---|---|---|---|---|
| Display | 36px / 2.25rem | 700 Bold | 1.25 | — | `display` |
| Page heading | 24px / 1.5rem | 700 Bold | 1.25 | -0.025em | `heading-page` |
| Card heading | 18px / 1.125rem | 600 SemiBold | 1.5 | — | `heading-card` |
| Metric value | 30px / 1.875rem | 700 Bold | 1.25 | -0.025em | `metric-value` |
| Body / table cells | 14px / 0.875rem | 400 Normal | 1.5 | — | `body` |
| Label | 14px / 0.875rem | 500 Medium | 1.5 | — | `label` |
| Table header | 12px / 0.75rem | 600 SemiBold | 1.25 | 0.05em | `table-header` |
| Caption | 12px / 0.75rem | 400 Normal | 1.25 | — | `caption` |
| Badge | 12px / 0.75rem | 500 Medium | 1.25 | — | `badge` |
| Code / Mono | 12px / 0.75rem | 400 Normal | — | — | `code` |

### Type Color by Context

- **Page headings**: `text-primary` (#111827) — maximum contrast
- **Body / table**: `text-primary` (#111827)
- **Labels**: `text-label` (#374151) — slightly softer than headings
- **Secondary info**: `text-secondary` (#6b7280)
- **Captions / metadata**: `text-muted` (#9ca3af)
- **Placeholder text**: `text-placeholder` (#9ca3af)
- **Error messages**: `text-error` (#dc2626)
- **Sidebar inactive**: `text-sidebar-inactive` (#9ca3af)
- **Sidebar active**: `text-sidebar-active` (#a5b4fc)

## Layout & Spacing

### Page Structure

```
┌─────────────────────────────────────────────────┐
│                    TopHeader                     │
│  bg-white, border-b, h-64px                     │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│  Sidebar │         Main Content                 │
│  w-256px │         bg-gray-50                   │
│  bg-gray-│         p-6                          │
│  900     │                                      │
│          │  ┌─ heading-page ─────────────────┐  │
│          │  │ Page Title (text-2xl)          │  │
│          │  │ Welcome text (text-gray-500)   │  │
│          │  └────────────────────────────────┘  │
│          │                                      │
│          │  ┌─ Metric Cards (grid-cols-3) ───┐  │
│          │  │  [Card]   [Card]   [Card]       │  │
│          │  └────────────────────────────────┘  │
│          │                                      │
│          │  ┌─ Section ──────────────────────┐  │
│          │  │  Section title (table-header)  │  │
│          │  │  Content...                     │  │
│          │  └────────────────────────────────┘  │
├──────────┴──────────────────────────────────────┤
│              (scroll continues)                  │
└─────────────────────────────────────────────────┘
```

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Gap between icon and text in badges |
| `sm` | 8px | Table cell padding (px-3), small gaps |
| `md` | 16px | Standard padding (p-4), gap between cards |
| `lg` | 24px | Card inner padding (p-5, p-6) |
| `xl` | 32px | Section spacing, modal horizontal padding |
| `2xl` | 48px | Large section gaps |

### Grid Behavior

| Breakpoint | Width | Layout |
|---|---|---|
| Default | < 768px | Single column, full-width stacked |
| `md` | 768px+ | Metric cards switch to 3-column grid |
| `lg` | 1024px+ | Table densities tighten |
| `xl` | 1280px+ | Max content width constraints |

The sidebar is always visible at 256px. No hamburger menu. Desktop-first.

## Elevation & Depth

### Shadow Scale

| Level | Token | CSS Value | Component |
|---|---|---|---|
| Flat | — | None | Canvas background, sidebar |
| 1 | `metric-card` / `quick-action` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Default cards, secondary buttons |
| 2 | `metric-card-hover` / `quick-action-hover` | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` | Card hover state |
| 3 | `modal-panel` | `0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)` | Modal panels |
| 4 | `toast-success` / `toast-error` | `0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)` | Toast notifications |

### Modal Overlay

Backdrop: `fixed inset-0 z-50 bg-black/40` — a semi-transparent black scrim that disengages the background without hiding it entirely. On supported browsers, `backdrop-blur-sm` is applied for a frosted-glass effect.

## Motion & Animation

Motion is used sparingly — only where it adds perceived performance or interaction clarity. Every animation respects `prefers-reduced-motion`.

### Animation Registry

| Name | Duration | Easing | Element |
|---|---|---|---|
| `fadeIn` | 200ms | ease-out | Modal backdrops, page sections |
| `slideUp` | 250ms | ease-out | Toast enter |
| `scaleIn` | 200ms | ease-out | Modal panel enter (scale 0.95→1 + opacity) |
| `scaleOut` | 150ms | ease-in | Modal panel exit (scale 1→0.95 + opacity) |
| `shimmer` | 1.5s | linear, infinite | Skeleton loading bars |

### Modal Animation

Modals have a two-part enter sequence:
1. Backdrop fades in (200ms)
2. Panel scales in (200ms, 50ms stagger)

On close, the panel scales out (150ms) before the backdrop fades out.

### Skeleton Shimmer

Skeleton bars use a diagonal gradient sweep (`animate-shimmer`) rather than the default Tailwind `animate-pulse`. The shimmer moves left-to-right across a gradient of `gray-200` → `gray-100` → `gray-200`.

### Interactive Feedback

| Element | Rest | Hover | Active / Focus |
|---|---|---|---|
| Card / MetricTile | `shadow-sm` | `shadow-md translateY(-2px)` 200ms | — |
| Button (primary) | Flat | `brightness-90` | `ring-2 ring-primary-ring ring-offset-2` |
| Button (secondary) | Border | `bg-gray-50` | `ring-2 ring-gray-300 ring-offset-2` |
| Nav link (sidebar) | `text-gray-400` | `bg-gray-800 text-gray-200` 150ms | `bg-violet-500/10 text-violet-300` |
| Table row | — | `bg-gray-50` 100ms | — |
| Input | Border | — | `border-violet-500 ring-1 ring-violet-500` |

### Reduced Motion

When `prefers-reduced-motion: reduce` is set:
- All animations are disabled
- All transitions are set to 0.01ms duration
- Skeleton reverts to static background (no shimmer sweep)
- Modal appears/disappears instantly (opacity only, no scale)

## Shapes

### Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `sm` | 4px | Close buttons, small UI elements |
| `md` | 6px | Text inputs, select dropdowns |
| `lg` | 8px | Buttons, skeleton blocks |
| `xl` | 12px | Cards, metric tiles, panels, modals |
| `full` | 9999px | Badges, avatars, pills |

### Component Shapes

| Component | Radius | Notes |
|---|---|---|
| Sidebar nav items | `md` (6px) | Individual link backgrounds |
| Metric cards | `xl` (12px) | `rounded-xl border border-gray-200/80` |
| Data tables | Implicit | Table itself has no radius — rows are rectangular |
| Buttons | `lg` (8px) | All button variants use `rounded-lg` |
| Inputs | `md` (6px) | `rounded-md` |
| Modals | `lg` (8px) | `rounded-lg` on the panel |
| Badges | `full` (9999px) | `rounded-full` pill shape |
| Avatars | `full` (9999px) | Sidebar user avatar |
| Skeleton blocks | `sm` (4px) | Default; `rounded-full` for circle mode |
| Icon containers | `lg` (8px) | MetricCard icon accent box |

## Components

### SidebarNavigation

The sidebar is a full-height `flex` column with three zones: brand bar, navigation list, user footer.

- **Brand bar** (top): Violet icon box (`bg-violet-500 shadow-sm shadow-violet-500/30 rounded-lg`) + "SMS Portal" in white. Bottom border separates from nav.
- **Nav items**: `flex items-center gap-3` with inline SVG icons at `h-4 w-4`. Active state uses `bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20`. Inactive uses `text-gray-400`, hover to `bg-gray-800 text-gray-200`.
- **User footer** (bottom): `border-t border-gray-800`. Avatar circle with initials (`bg-violet-500/20 text-violet-300 rounded-full`). Name truncated. Role badge with role-specific muted colors.

Icons are hardcoded inline SVGs — zero icon dependencies. 11 nav icons defined as constants.

### TopHeader

A 64px `bg-white` bar with `border-b border-gray-200`. School name as `heading-card` on the left, user info + role label + logout button on the right. The logout button is secondary style: `border border-gray-300 rounded-md`.

### MetricCard

A data-presentation tile:
1. **Top row**: label (left, `label` typography) + optional icon (right, `icon-accent` box)
2. **Value area**: large bold number (`metric-value` typography). Negative numbers turn `text-red-600`.
3. **Subtitle row**: trend text (emerald for positive, rose for negative) or `&nbsp;` to preserve height
4. **Loading**: Two `Skeleton` bars sized to match content width
5. **Error**: Dashed `rose-50` container with "Failed to load" + optional "Retry" link
6. **Hover**: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`

### StatusBadge

A `rounded-full` pill with an inline SVG icon (h-3 w-3), text, and `ring-1 ring-inset`. Two variant maps:
- **Financial**: PAID, PARTIALLY_PAID, UNPAID, OVERDUE, REFUNDED, VOIDED, ACTIVE/CONFIRMED
- **Lifecycle**: ACTIVE, SUSPENDED, EXPELLED, WITHDRAWN, GRADUATED, PENDING, TRANSFERRED

Unknown statuses fall back to `bg-gray-100 text-gray-600 ring-gray-500/20` with the raw key as label.

Icons: CheckCircle, XCircle, Clock, Check, AlertTriangle, Ban, MinusCircle, ArrowUp — all `h-3 w-3 shrink-0` at `strokeWidth={2.5}`.

### DataTable

High-density table with:
- Header: `px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500`
- Body: `px-3 py-2 text-sm`
- Row hover: `hover:bg-gray-50`
- Truncation on every text cell with `max-w-[180px]` constraint
- Empty state: dashed border `rounded-lg border border-dashed border-gray-300 py-16 text-center`
- Loading: 5 skeleton rows with column-matching widths (no spinner)

### Buttons

Three tiers:
- **Primary**: `bg-violet-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold`. Hover: `bg-violet-700`. Focus: `ring-2 ring-violet-500 ring-offset-2`. Disabled: `opacity-50 cursor-not-allowed`.
- **Destructive**: `bg-red-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold`. Hover: `bg-red-700`.
- **Secondary**: `border border-gray-300 text-gray-700 bg-white rounded-lg px-4 py-2.5 text-sm font-medium`. Hover: `bg-gray-50`.

### Forms

Every form uses `react-hook-form` with `zodResolver`. Field layout:
- Wrapper: `<div>` with `space-y-1`
- Label: `block text-sm font-medium text-gray-700` + red asterisk for required
- Input: `mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm`
- Focus: `focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500`
- Error: `mt-0.5 text-xs text-red-600`
- Helper: `mt-0.5 text-xs text-gray-400`
- Action bar: `mt-6 flex items-center justify-end gap-3 border-t pt-4`

### Modal

Standard overlay structure:
1. Backdrop: `fixed inset-0 z-50 bg-black/40`
2. Panel: `rounded-lg bg-white shadow-xl` — vertically offset with `items-start pt-12`
3. Header: `flex items-center justify-between border-b px-6 py-4` with title + close button
4. Close: `rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600`
5. Footer: `flex items-center justify-end gap-3 border-t pt-4`

### Toast

Fixed position: `fixed bottom-6 right-6 z-[60]`.
- Success: `bg-green-600 text-white rounded-lg px-5 py-3 shadow-lg`
- Error: `bg-red-600 text-white rounded-lg px-5 py-3 shadow-lg`
- Animation: `translate-y-0 opacity-100` → `translate-y-4 opacity-0`
- Duration: 4000ms default

### Skeleton

Loading placeholder: `animate-pulse bg-gray-200 rounded`. Default shape is a rounded block; `circle` prop applies `rounded-full`. Sizing must match the exact dimensions of the expected content to prevent layout shift.

Spinners are **banned** on metric boards and data grids. The only allowed spinner is the full-page route transition in `dashboard/layout.tsx`.

## Do's and Don'ts

### Do

- Use `text-gray-900` for all primary headings and data values — maximum legibility
- Apply `hover:shadow-md hover:-translate-y-0.5` on all interactive cards and action tiles — the lift micro-interaction signals tappability
- Keep table cells truncated with `max-w-[180px]` — never allow text wrapping
- Use `ring-1 ring-inset` at 20% opacity for status badges — the subtle halo is the signature badge treatment
- Hardcode every icon as an inline `<svg>` — zero external dependencies
- Use `Skeleton` blocks (not spinners) for all data-fetch loading states
- Apply `text-rose-700 bg-rose-50` for both UNPAID and OVERDUE — financial distress shares one visual vocabulary
- Render `&nbsp;` as the subtitle when a MetricCard has no trend data — preserves card height and prevents layout shift

### Don't

- Never use violet as a background color on the canvas or as body copy color — it's reserved for interactive elements only
- Never wrap text in table cells — truncate and tooltip
- Never import icon libraries (lucide-react, heroicons, phosphor-icons, etc.)
- Never use spinners in data grids, metric cards, or any content area — full-page route transitions are the only exception
- Never apply `rounded-xl` to buttons — buttons are `rounded-lg`, cards are `rounded-xl`
- Never use a hamburger menu or mobile sidebar toggle — the sidebar is always visible (desktop-first)
- Never use Google Fonts or external font loads — Geist is served through next/font
- Never use `@apply` in CSS — compose with utility classes or extract components
