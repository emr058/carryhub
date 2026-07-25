---
name: taste-skill-frontend
description: Anti-slop frontend — layout, typography, color, motion rules for premium UI. Use when building or redesigning landing pages, signup flows, portals.
---

# Taste-Skill: Anti-Slop Frontend Guidelines

## Design Read
Before coding: read the brief → infer page kind (landing/portal/portfolio/redesign) + audience + vibe → pick aesthetic. State one-line Design Read before generating.

## Three Dials
Set per project: `DESIGN_VARIANCE` (1-10), `MOTION_INTENSITY` (1-10), `VISUAL_DENSITY` (1-10).

- **VARIANCE** — 1=perfect symmetry, 10=artsy chaos
- **MOTION** — 1=static, 10=cinematic
- **DENSITY** — 1=airy gallery, 10=dashboard cockpit

Default baseline: `8 / 6 / 4`. Override per design read.

## Typography
- Headlines: `tracking-tighter leading-none`
- Body: `leading-relaxed max-w-[65ch]`
- Font stack (prefer over Inter): Geist, Satoshi, Cabinet Grotesk, Outfit
- Serif is **very discouraged as default**. Only when brief explicitly names a serif.
- BANNED defaults: Fraunces, Instrument_Serif, Inter (when better alternatives exist)
- Em-dashes only — en-dashes and hyphens for ranges. Hard rule.
- **Descender clearance**: italic display descenders (y, g, j, p, q) need `leading-[1.1]` + `pb-1`

## Color
- Max 1 accent color. Saturation < 80%.
- **No AI-purple gradients** as default. Use neutral bases (Zinc/Slate/Stone) + high-contrast singular accent.
- **Lock color per page** — one palette, everywhere. No fluctuation.
- **Premium-consumer ban**: default beige/cream/brass palettes are banned. Rotate through cold-luxury, forest, cobalt+cream, terracotta+slate, monochrome+pops.
- Form inputs, buttons, placeholders must pass WCAG AA (4.5:1 contrast).

## Layout
- **Anti-center bias** for VARIANCE > 4. Prefer split-screen, asymmetric, left-aligned.
- **No zigzag repetition** — max 2 consecutive image+text splits.
- **Hero MUST fit viewport**: headline ≤2 lines, subtext ≤20 words/4 lines, CTA visible.
- **Hero top padding**: max `pt-24`. If cramped, increase font scale, not padding.
- **Hero stack**: max 4 elements (eyebrow, headline, subtext, CTAs). No trust strips, feature lists, or avatar rows in hero.
- **Eyebrow restraint**: max 1 eyebrow per 3 sections.
- **Section-Layout-Repetition Ban**: same layout family can appear at most ONCE per page.
- **Navigation**: single line at desktop, height 64-72px max.
- **Use `min-h-[100dvh]`** never `h-screen` (mobile Safari fix).
- **Grid over flex-math**: use CSS Grid, not `calc()` percentages.

## Interactive States
- Implement all states: loading (skeletal), empty (beautifully composed), error (inline), success.
- Tactile feedback on `:active`: `translate-y-[-1px]` or `scale-[0.98]`.
- **CTA wraps are banned** at desktop. Fit label to one line.
- **No duplicate CTA intent**: one label per intent across the whole page.
- **Form labels** above input, never placeholder-as-label.

## Images & Assets
- Generate real images per section (hero, product shots). Text-only is slop.
- **No div-based fake screenshots**. Use real URLs, generate images, or leave `TODO` placeholders.
- Logo walls: real SVG logos (Simple Icons or generated monograms). No plain text wordmarks.
- **Logo-only rule**: logos only, no industry labels underneath.

## Dependencies
- Motion (framer-motion successor) → `import { motion } from "motion/react"`
- Icons priority: `@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`. **Discourage** lucide-react as default.
- One icon family per project. Never hand-roll SVG icons.
- Always check `package.json` before importing — never assume a library exists.

## Pre-Flight Check (before shipping)
1. Hero fits viewport with CTA visible
2. Buttons fit one line at desktop
3. No duplicate CTA intent
4. Eyebrow count ≤ ceiling(sectionCount/3)
5. No serif unless explicitly justified
6. All interactive states implemented (loading, empty, error)
7. Color palette is locked — one accent across entire page
8. Navigation is single-line at desktop
9. No default AI-purple gradients
10. Images exist — no text-only sections
