---
name: Marks Manager
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#5c2f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d4200'
  on-tertiary-container: '#ffb477'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
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
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  tabular-stat:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 0.75rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1rem
  margin-tablet: 1.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is tailored for an academic management platform built for educators, evaluators, and academic administrators. The ethos marries the clarity of modern data-dense productivity tools with the calm, dependable authority required in grading and institutional record-keeping.

### Personality & Tone
- **Authoritative yet Approachable:** Projecting academic integrity without bureaucratic friction.
- **Precision-Driven:** Engineered for rapid mark entry, audit-safe grading, and zero cognitive load during high-volume workflows.
- **Calm & Supportive:** Utilizing high-contrast neutral backgrounds with purposeful status signaling to minimize fatigue during long grading sessions.

### Aesthetic Movement
The design adheres to **Modern Corporate SaaS with Subtle Neo-Tactility**: crisp surfaces, low-contrast hairline borders, soft layered shadows, and high-legibility typographic hierarchies. Whitespace is controlled and structured rather than purely decorative, maintaining information density without visual chaos.

## Colors

The palette establishes an immediate sense of reliability and academic rigor. The primary deep indigo anchors brand actions and navigation, while semantic secondary and tertiary hues handle pass rates, grade thresholds, and warning flags.

### Palette Architecture
- **Primary (`#4338CA` - Deep Indigo):** Used for key primary actions, selected navigation items, interactive focus indicators, and brand anchors.
- **Secondary / Positive (`#0D9488` - Deep Teal / Emerald):** Applied to passing grades, completed score submissions, verified audits, and positive performance metrics.
- **Tertiary / Warning (`#D97706` - Amber Bronze):** Applied to remediation triggers, late submissions, incomplete grading rubrics, and grade review states.
- **Error / Critical (`#DC2626` - Crimson):** Reserved strictly for failing thresholds, dropped enrollments, validation errors, and destructive operations.
- **Neutral Canvas (`#F8FAFC` to `#0F172A`):** Cool slate scales. The primary canvas rests on `#F8FAFC`, layered containers sit on `#FFFFFF`, and structural dividers use `#E2E8F0`. High-legibility body copy utilizes `#1E293B`, softening pure black to prevent eye strain.

## Typography

The typographic hierarchy pairs **Plus Jakarta Sans** for structural headers and section identity with **Inter** for dense interface data, body text, form elements, and tabular calculations.

### Tabular Number Formatting
All numeric metrics, percentages, grade distributions, and mark sheet columns must activate OpenType tabular numbers via `font-feature-settings: "tnum" 1, "cv05" 1`. This aligns decimals consistently across rows, allowing rapid vertical scanning by instructors.

### Responsive Scaling
- On mobile devices, `display-lg` reflows to `headline-md` (24px/32px) to preserve viewport integrity.
- Page titles step down one level across tablet and handheld viewports (`headline-lg` reduces to `headline-md`).
- Table data maintains strict body-md (14px) and label-md (12px) scales with minimum 36px touch/click target containers.

## Layout & Spacing

The application operates on an 8pt base grid with a 4pt micro-increment for tight data alignment within sheets, tables, and metric badges.

### Layout Architecture
- **Desktop (1200px+):** Fixed 260px left-hand navigation sidebar; dynamic fluid canvas using a 12-column layout with 24px (`1.5rem`) gutters and 32px (`2rem`) content padding.
- **Tablet (768px - 1199px):** Collapsible sidebar rail (72px icons only); 8-column layout with 16px (`1rem`) gutters and 24px (`1.5rem`) margins.
- **Mobile (< 768px):** Off-canvas navigation drawer; single-column fluid layout with 16px (`1rem`) margins. Mark spreadsheets switch to horizontal sticky-first-column layouts.

### Structural Padding Rules
- Standard metric card padding is strictly `space-lg` (24px).
- Compact data table cell horizontal padding is `space-md` (16px); vertical padding is `space-sm` (8px) for maximum information density without row crowding.

## Elevation & Depth

Visual hierarchy relies on structural layered planes and subtle border contrast rather than dark drop shadows. Surfaces must remain crisp and academic.

### Depth Layers
- **Base Canvas (Level 0):** `#F8FAFC` flat surface.
- **Resting Surface (Level 1):** `#FFFFFF` cards, table containers, and sidebar. Bordered with a 1px solid hairline divider of `#E2E8F0` and accompanied by a diffused ambient drop: `0px 1px 3px 0px rgba(15, 23, 42, 0.04), 0px 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Raised Interactive (Level 2):** Hovered cards, quick-entry popovers, and sticky sheet headers: `0px 4px 6px -1px rgba(15, 23, 42, 0.06), 0px 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Floating Overlays (Level 3):** Modal grade-entry dialogues, batch action bars, and floating score recalculators: `0px 10px 15px -3px rgba(15, 23, 42, 0.08), 0px 4px 6px -4px rgba(15, 23, 42, 0.04)` wrapped in a 1px border of `#CBD5E1`.

## Shapes

The interface balances sharp productivity tool aesthetics with ergonomic softness using Level 2 (Rounded) curvature tokens:

- **Base Components (Inputs, Buttons, Badges):** `8px` (`0.5rem`) radius ensures clear interactive affordance without appearing child-oriented.
- **Containers & Statistic Cards:** `12px` to `16px` (`rounded-lg` / `rounded-xl`) outer radius gives clear containment to distinct modules.
- **Pills / Status Chips:** Full pill radius (`9999px`) is applied strictly to status indicators (Pass, Remedial, Absent) to visually segregate qualitative evaluation tags from rectangular data entry cells.

## Components

### Buttons
- **Primary:** Solid `#4338CA` background, `#FFFFFF` text, subtle shadow, 8px border radius. Hover transitions to `#3730A3`. Active scales down to `0.98` scale.
- **Secondary:** Surface `#FFFFFF`, 1px solid border `#CBD5E1`, text `#334155`. Hover brings a `#F8FAFC` background.
- **Ghost/Tertiary:** No border, transparent background, text `#475569`. Hover triggers `#F1F5F9`.

### Statistic Cards
- White background (`#FFFFFF`), 1px border (`#E2E8F0`), 16px corner radius, 24px inner padding.
- Displays an uppercase tracking label (`label-sm`), large tabular statistic (`tabular-stat`), and an inline delta pill showing distribution movement or standard deviation shifts.

### Mark Entry & Data Tables
- **Header:** Sticky `#F8FAFC` background, border-bottom 2px solid `#CBD5E1`, uppercase 11px font weight 600 text.
- **Cells:** Tabular numerical alignment (right-aligned for numbers, left-aligned for student names, centered for letter grades).
- **Inline Mark Input:** Stripped-down table cell input with zero default border; on focus, reveals a 2px high-contrast `#4338CA` focus ring with `#EEF2FF` fill.

### Status Badges & Chips
- Fully rounded pill shape with a 1px tinted outline.
- **Passed / Good Standing:** Emerald tint (`#ECFDF5`), border (`#A7F3D0`), text (`#065F46`).
- **Review / Incomplete:** Amber tint (`#FFFBEB`), border (`#FDE68A`), text (`#92400E`).
- **Fail / Critical:** Rose tint (`#FEF2F2`), border (`#FECACA`), text (`#991B1B`).

### Form Inputs
- 1px border `#CBD5E1` with `#FFFFFF` fill and 8px border radius. Height standardized to 40px for default inputs and 32px for compact table filters.
- Focus state: Border color transitions to `#4338CA` with an external `0 0 0 3px rgba(67, 56, 202, 0.15)` glow.

### Sidebar Navigation
- Deep slate background (`#0F172A`) or ultra-clean cool white (`#FFFFFF`) with right-side hairline border (`#E2E8F0`).
- Navigation items include 20px icons paired with 14px Medium typography. Active state highlights with `#EEF2FF` surface and `#4338CA` text/icon paired with a 3px vertical accent bar on the left edge.