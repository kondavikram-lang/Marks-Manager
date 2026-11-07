---
name: Academic Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  tabular-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes an authoritative, efficient, and mentally calming workspace for educators, department heads, and academic administrators. Built upon the principles of Modern Corporate utility and structured informational architecture, the visual tone eliminates cognitive friction during high-volume grading and record auditing.

The aesthetic blends structural discipline with soft tactical refinement:
- **Atmosphere:** High-clarity, objective, uncluttered, and trustworthy.
- **Visual Stance:** Crisp border structures balanced by subtle, cool-toned elevation layers that keep dense data readable under continuous daily usage.
- **Functional Objective:** Optimize grade entry workflows, student progress diagnostics, and institutional performance monitoring with zero visual ambiguity.

## Colors

The palette leverages calibrated shades of indigo and royal blue to ground core navigation and primary actions, paired with functional state accents optimized for immediate visual parsing.

### Core Swatches
- **Primary Indigo (`#4f46e5`):** Reserved for primary interactive controls, active sidebar items, focus outlines, and key metric emphases.
- **Secondary Royal Blue (`#2563eb`):** Used for bulk actions, interactive secondary links, export triggers, and batch operations.
- **Slate Neutral (`#0f172a`):** Anchors high-contrast typography, high-priority table labels, and dark-fill badge borders.
- **Surface Neutrals:** Background foundation defaults to Slate 50 (`#f8fafc`) with canvas cards and workspace panels in pure white (`#ffffff`) and Slate 100 (`#f1f5f9`) for table headers, borders, and input strokes.

### Semantic Performance Indicators
- **High Performance / Pass (`#10b981` Emerald-500):** Visual status for top grades (A/B), target grade attainment, and compliant submissions.
- **Attention / Borderline (`#f59e0b` Amber-500):** Alerts for grade dips, missing assessment components, or attendance risk factors.
- **Critical / Fail (`#f43f5e` Rose-500):** Uncompromising clarity for failing marks, overdue grading deadlines, and academic alerts.

## Typography

Typography prioritizes rapid legibility, dense table scanning, and visual order across data-intensive interfaces.

- **Plus Jakarta Sans (Headings):** Selected for its crisp geometric authority without looking overly decorative. Gives top-level dashboards, course rosters, and class analytics an executive yet accessible presence.
- **Inter (Body & Controls):** Selected for its neutral tone, tall x-height, and superior numeric legibility. 
- **Tabular Figures:** All numeric displays (grades, student IDs, percentages, GPA metrics) must use monospace figure alignments (`font-feature-settings: "tnum" 1`) to guarantee perfect vertical alignment down score columns.
- **Labeling:** Micro-labels and table header tags utilize `label-sm` with slight tracking for fast horizontal recognition across multi-column grade sheets.

## Layout & Spacing

The layout is built for high-resolution desktop workflows with an asymmetrical fixed-sidebar structure and fluid-responsive analytical canvas.

### Layout Hierarchy
- **Sidebar Canvas:** A fixed 260px left navigation rail housing semester selectors, course catalogs, gradebooks, and analytics dashboards.
- **Top Utility Bar:** 64px height sticky sub-header containing class section toggles, live status sync indicators, search, and user profile utilities.
- **Main Viewport Canvas:** Fluid grid using a 12-column system, 24px (`1.5rem`) gutters, and 32px (`2rem`) outer view margins.

### Vertical Density & Rhythm
- High-frequency data grids utilize tight 40px row heights with `space-sm` padding for maximal content per scroll view.
- Overview widgets, metric cards, and chart wrappers use `space-lg` inner padding to maintain breathing room between high-density zones.

## Elevation & Depth

Visual hierarchy uses a refined hybrid of crisp borders and cold ambient shadows to differentiate interactive planes from foundational canvas surfaces.

### Elevation Hierarchy
- **Level 0 (Flat / Canvas):** Applied to the main page background (`#f8fafc`). Borderless, resting flush with the screen plane.
- **Level 1 (Subtle Cards & Panels):** Applied to dashboard summary cards, grading panels, and table shells.
  - Border: `1px solid #e2e8f0`
  - Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`
- **Level 2 (Hover States & Context Popovers):** Applied to active row selections, floating bulk-action bars, dropdown menus, and date pickers.
  - Border: `1px solid #cbd5e1`
  - Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)`
- **Level 3 (Modal Dialogs & Student Grade Inspectors):** Applied to full detail overlays, grade curve modals, and report card previewers.
  - Border: `1px solid #cbd5e1`
  - Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`

## Shapes

The design uses balanced, modern radii (`roundedness: 2` / base 8px) that avoid both harsh brutalist edges and overly bubbly interfaces.

- **Primary Cards and Panels:** `8px` (`rounded-md` / base). Provides clean division between dense data blocks without wasting corner canvas space.
- **Interactive Inputs and Buttons:** `6px` to `8px`. Gives tactile definition to click and tab targets across grading forms.
- **Status & Grade Badges:** Fully circular pill radius (`9999px`) to immediately distinguish quantitative status markers from editable inputs and buttons.
- **Modal Drawers & Overlays:** `12px` to `16px` (`rounded-lg` / `rounded-xl`) to soften large foreground surfaces.

## Components

### Buttons
- **Primary:** Solid indigo (`#4f46e5`) background, white text, subtle hover lift to `#4338ca`. Focused with a 2px offset ring (`#818cf8`).
- **Secondary:** White background with a 1px border (`#cbd5e1`), slate text (`#334155`), hover fill in `#f8fafc`.
- **Destructive:** Subtle rose tint fill (`#fff1f2`) with `#e11d48` text and border for non-disruptive placement, switching to solid `#e11d48` for explicit confirmation dialogs.

### Grade & Performance Chips (Pills)
- Compact, fully rounded (`rounded-full`) indicators displaying status, grade bands (A, B, C, F), or assignment states (Submitted, Late, Missing).
- **Pass / High (90–100%):** Background `#ecfdf5`, text `#047857`, border `#a7f3d0`.
- **Warning / Average (70–89%):** Background `#fffbeb`, text `#b45309`, border `#fde68a`.
- **Alert / Fail (<70%):** Background `#fff1f2`, text `#be123c`, border `#fecdd3`.

### Data Tables (The Academic Gradebook)
- Sticky headers on `#f8fafc` with uppercase `label-sm` text tracking.
- Row heights set to a consistent 44px with a bottom border in `#f1f5f9`.
- Dynamic hover highlighting on `#f8fafc` for whole-row scanning across wide score arrays.
- Numeric grade cells support inline quick-edit modes with seamless zero-border input state switching.

### Form Inputs & Grade Cells
- **Default State:** Background `#ffffff`, border `1px solid #cbd5e1`, text `Inter 14px #0f172a`.
- **Focus State:** Border shifted to `#4f46e5` with a 3px outer glow ring of `rgba(79, 70, 229, 0.15)`.
- **Error State:** Border shifted to `#f43f5e` with an inline micro-caption explaining score validation limits (e.g., "Score cannot exceed max points (50)").

### Summary & Distribution Cards
- Containers using pure white surfaces (`#ffffff`) framed with `1px solid #e2e8f0`.
- Header section features an icon badge, title in `headline-sm`, and quick-filter subtext.
- Integrates sparkline distributions, cohort median stats, and standard deviation readouts with high-contrast numerical highlights.