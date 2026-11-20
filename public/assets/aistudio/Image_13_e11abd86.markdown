---
name: EduTrack AI
colors:
  surface: '#fbf8ff'
  surface-dim: '#d4d8fe'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#ececff'
  surface-container-high: '#e5e6ff'
  surface-container-highest: '#dee0ff'
  on-surface: '#141936'
  on-surface-variant: '#454654'
  inverse-surface: '#292e4c'
  inverse-on-surface: '#f0efff'
  outline: '#767685'
  outline-variant: '#c6c5d6'
  surface-tint: '#434fd0'
  primary: '#414cce'
  on-primary: '#ffffff'
  primary-container: '#5b67e8'
  on-primary-container: '#fffcff'
  inverse-primary: '#bec2ff'
  secondary: '#5c4bc3'
  on-secondary: '#ffffff'
  secondary-container: '#9485ff'
  on-secondary-container: '#2a0992'
  tertiary: '#575d66'
  on-tertiary: '#ffffff'
  tertiary-container: '#70757f'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bec2ff'
  on-primary-fixed: '#000569'
  on-primary-fixed-variant: '#2833b7'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c7bfff'
  on-secondary-fixed: '#180065'
  on-secondary-fixed-variant: '#4330aa'
  tertiary-fixed: '#dde3ee'
  tertiary-fixed-dim: '#c1c7d2'
  on-tertiary-fixed: '#161c24'
  on-tertiary-fixed-variant: '#414750'
  background: '#fbf8ff'
  on-background: '#141936'
  surface-variant: '#dee0ff'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
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

This design system is tailored for an intelligent, premium EdTech SaaS platform serving educators, institutional leaders, and students. The brand identity fuses cognitive clarity with academic warmth, creating an atmosphere that feels authoritative yet distinctly approachable and encouraging. 

### Visual Archetype & Aesthetics
The visual direction blends **Modern SaaS Precision** with **Soft Layered Warmth**. Rather than leaning into cold, sterile administrative tables or toy-like gamified interfaces, the system balances data-dense productivity with breezy, spacious canvases. Visual touchstones include:
- Deep indigo primary anchors that impart confidence, paired with luminous lavender transitions for insight, predictive AI recommendations, and non-disruptive analytical highlights.
- Airy, multi-tiered white and soft cool-slate surfaces (`#F7F8FC`) that prevent cognitive fatigue during extended grading, tracking, and lesson planning sessions.
- Generous, organic corner radiuses paired with precise micro-borders to maintain structure without rigid visual friction.

## Colors

The palette establishes an intelligent chromatic hierarchy where high-energy indigo and lavender are reserved for interactive, focal, and AI-driven elements, surrounded by serene neutral surfaces.

### Semantic Tones & Usage
- **Primary Indigo (`#5B67E8`):** The primary action driver. Used for primary CTAs, active navigation states, primary focus rings, and high-priority metrics.
- **Secondary Lavender (`#8B7CF6`):** The predictive layer. Applied to AI-assisted features, progress curves, recommendations, and supportive badges.
- **Tonal Tints (`#EEF3FF` & `#F2EEFF`):** Used as subtle container fills for selected rows, pill backgrounds, tooltips, and informational highlights to eliminate harsh contrast.
- **Neutral Core (`#1E2340`):** Replaces pure black with a high-contrast deep navy for headlines and data values, reducing eye strain while preserving crisp legibility.
- **Neutral Muted (`#81879C`):** Designated for metadata, secondary captions, inactive tab labels, and auxiliary iconography.
- **Surfaces (`#FFFFFF` on `#F7F8FC`):** Pure white container cards elevated cleanly over a chilled off-white canvas.
- **Feedback Accents:**
  - **Success (`#28A879`):** Mastery scores, submitted assignments, positive attendance.
  - **Warning (`#F3B64A`):** Deadlines within 24 hours, incomplete profiles, intervention alerts.
  - **Danger (`#E96C78`):** At-risk performance flags, missed assignments, critical system errors.

## Typography

Typography relies uniformly on **Plus Jakarta Sans**, chosen for its geometric precision, open counters, and humanistic warmth. It bridges mathematical order with conversational learning software.

### Hierarchy Guidelines
- **Display & Headlines:** Used for dashboard welcome headers, metric total tallies, and modal titles. Employs tighter negative letter-spacing (`-0.01em` to `-0.02em`) to ground headers firmly.
- **Body:** Set at 400 weight for fluent scanning across student rosters, performance summaries, and assignment briefs. Never render body text lighter than 14px on primary desktop tables.
- **Labels & Microcopy:** Used for badges, pill chips, table headers, and form labels. Formatted with higher font weight (600 or 700) and slight positive letter-spacing (`0.01em` to `0.04em`) to maintain sharp character distinction at miniature scales.

## Layout & Spacing

The system implements a fluid, structured layout framework centered on an 8pt baseline rhythm.

### Grid & Structure
- **Desktop (1200px+):** Fixed 260px left-hand collapsible navigation sidebar paired with a 12-column responsive fluid grid. Outer margins are `2rem` (`space-xl`), and column gutters are `1.5rem` (`gutter`).
- **Tablet (768px - 1199px):** Sidebar collapses to an icon-only 72px rail. Grid transitions to an 8-column layout with `1.5rem` margins and `1rem` gutters.
- **Mobile (<768px):** Navigation moves to a sticky bottom tab bar or overlay slide drawer. Grid condenses to a single- or 2-column stacked flow with `1rem` outer margins.

### Component Spacing Rhythm
- **Internal Card Padding:** Standard cards employ `space-lg` (24px) for desktop and `space-md` (16px) for mobile.
- **Data Densities:** Compact lists and datagrid rows use `space-sm` (8px) vertical padding; standard lists use `space-md` (16px).

## Elevation & Depth

Visual hierarchy is communicated through an understated, ethereal layering strategy rather than deep drops. The interface feels weightless, clean, and tactile.

### Layering Philosophy
- **Base Canvas:** The foundational background is `#F7F8FC`.
- **Level 1 (Card & Module Resting):** Pure `#FFFFFF` surfaces bounded by an ultra-thin border (`1px solid rgba(226, 232, 240, 0.7)`) and an ambient, low-density drop shadow: `0 1px 3px 0 rgba(30, 35, 64, 0.04), 0 1px 2px -1px rgba(30, 35, 64, 0.02)`.
- **Level 2 (Interactive Hover & Flyouts):** Active cards, hover states, and dropdown menus elevate slightly with an expanded soft blur: `0 10px 25px -5px rgba(91, 103, 232, 0.08), 0 8px 10px -6px rgba(30, 35, 64, 0.04)`.
- **Level 3 (Modals & Overlays):** Dialogue overlays, student detail sheets, and high-level notifications: `0 20px 35px -10px rgba(30, 35, 64, 0.12)`. Supported by a soft backdrop blur filter (`backdrop-blur-sm` with `rgba(30, 35, 64, 0.3)`).
- **AI Highlight Surfaces:** Panels providing smart automated assistance use an ambient inner glow paired with an ultra-faint gradient border transition from `#EEF3FF` to `#F2EEFF`.

## Shapes

The design system embraces a friendly, hyper-modern rounded profile to foster warmth and engagement in academic settings.

### Geometry Hierarchy
- **Cards & Primary Modules:** Employ `rounded-2xl` (16px / `1rem`) corner radiuses, giving expansive data blocks friendly, approachable contours.
- **Inputs, Buttons, Dropdowns:** Employ `rounded-xl` (12px / `0.75rem`) to maintain consistent hand-feel and finger-tap precision.
- **Pills, Badges, & Avatars:** Fully rounded with `rounded-full` (9999px) for clean status labeling and student identity markers.

## Components

### Buttons
- **Primary:** Background `#5B67E8`, text white, `rounded-xl`, padding `10px 20px`, typography `label-lg`. Hover: `#4A55D4` with shadow `0 4px 12px rgba(91, 103, 232, 0.25)`.
- **Secondary:** Background `#EEF3FF`, text `#5B67E8`, border `1px solid rgba(91, 103, 232, 0.15)`. Hover: `#E4ECFF`.
- **Ghost / Neutral:** Background transparent, text `#81879C`. Hover: Background `#F7F8FC`, text `#1E2340`.
- **AI Assist Action:** Background linear gradient from `#5B67E8` to `#8B7CF6`, text white with subtle sparkle icon.

### Form Inputs & Select Fields
- Height: 44px. Background: `#FFFFFF`. Border: `1px solid #E2E8F0`. Radius: `rounded-xl`. Text: `#1E2340`, typography `body-md`.
- Placeholder: `#81879C`.
- Focus State: Border color `#5B67E8`, box-shadow `0 0 0 3px rgba(91, 103, 232, 0.15)`, outline none.

### Status Chips & Badges
- Shape: `rounded-full`, height 24px, padding `2px 10px`, typography `label-sm`.
- **Active / Success:** Background `#ECFDF5`, text `#28A879`, optional 6px inner dot indicator.
- **Pending / Warning:** Background `#FEF8EC`, text `#D9941E`.
- **Critical / At-Risk:** Background `#FDF2F3`, text `#E96C78`.
- **Informational / AI:** Background `#F2EEFF`, text `#8B7CF6`.

### Cards & Data Containers
- Structure: Background `#FFFFFF`, border `1px solid rgba(226, 232, 240, 0.7)`, radius `rounded-2xl`, elevation Level 1.
- Padding: `24px` standard, split into distinct header, body, and action zones using subtle dividers (`border-slate-100`).

### Checkboxes & Selection Controls
- Checkbox: 18x18px, radius `6px`. Unchecked: Border `1.5px solid #CBD5E1`, background white. Checked: Background `#5B67E8`, border `#5B67E8`, white checkmark icon.
- Radio: Circular 18px with centered 8px solid dot when active.

### Navigation & Tabs
- **Sidebar Elements:** Height 44px, `rounded-xl`, padding `0 16px`. Active item utilizes background `#EEF3FF`, font weight 600, icon and label color `#5B67E8`. Inactive item utilizes text `#81879C`, hovering to text `#1E2340` on `#F7F8FC`.
- **Segmented Controls & Tabs:** Pill enclosure with `#F7F8FC` container background, active tab elevated with `#FFFFFF` card-style shadow and text `#1E2340`.
- **Mobile Bottom Navigation:** Height 64px, surface white with top border `1px solid rgba(226, 232, 240, 0.8)`, icon-over-label alignment with active indicator dot in `#5B67E8`.