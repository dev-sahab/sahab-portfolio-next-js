# Design System

> The current visual language, as tokens and rules — not aspirational, this is what's actually implemented in `app/globals.css` / `styles/_variables.scss`. For the original hand-built reference (pixel-exact markup/animation when a page needs to match it exactly), see `sahab-site/`. For how these tokens map to conventions/patterns, see [RULES.md](./RULES.md).

## 1. Color tokens

Defined once in `app/globals.css` `:root`, redefined under `[data-theme="light"]`. **Never hardcode a hex value for anything that should react to the theme toggle — always `var(--x)`.**

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#0a0a0a` | `#f8f8f5` |
| `--surface` | `#111111` | `#eeeeed` |
| `--surface2` | `#181818` | `#e4e4e0` |
| `--border` | `#1f1f1f` | `#d0cfcc` |
| `--border2` | `#2a2a2a` | `#c2c1bd` |
| `--text` | `#f0ede6` | `#0f0f0f` |
| `--text2` | `#9a9a9a` | `#4a4a48` |
| `--muted` | `#555555` | `#8a8a88` |
| `--accent` | `#b8ff4f` (lime) | `#5c9f00` (darker, for contrast on light bg) |

Theme is toggled by setting `data-theme="dark"|"light"` on `<html>`, persisted in `localStorage` (`sahab-theme` key, see `components/site/ThemeToggle.tsx`) — an inline script in `app/layout.tsx` applies it before paint to avoid a flash of the wrong theme.

## 2. Typography

| Token | Value | Use |
|---|---|---|
| `--f-d` | `"Syne", sans-serif` | Display — headings (`h-xl`, `h-lg`), numbers |
| `--f-b` | `"Outfit", sans-serif` | Body text (implicit default, not always set explicitly per-element) |
| `--f-m` | `"JetBrains Mono", monospace` | Labels, meta text, buttons, tags — always uppercase + letter-spaced |

Loaded via `next/font/google` in `app/layout.tsx` (Syne 400/600/700/800, Outfit 300/400/500/600, JetBrains Mono 300/400) — **self-hosted at build time**, not a runtime call to `fonts.googleapis.com`.

| Class | Font size | Weight | Use |
|---|---|---|---|
| `.h-xl` | `clamp(38px, 5.5vw, 82px)` | 700 | Page-level heading (hero, section titles) |
| `.h-lg` | `clamp(26px, 3.6vw, 50px)` | 700 | Sub-section heading |
| `.s-label` | 10-11px mono, uppercase, `0.14-0.16em` tracking | — | Eyebrow/kicker label above a heading (e.g. "What I Do") |
| `.accent-word` | inherits size | — | `color: var(--accent)` — the one highlighted word per heading |

## 3. Spacing, radius, easing, breakpoints

Compile-time constants (`styles/_variables.scss`) — media queries can't read CSS custom properties, so these stay SCSS `$vars`, not `var(--x)`:

```scss
$bp-xl: 1280px;  $bp-lg: 1024px;  $bp-md: 960px;
$bp-sm: 768px;   $bp-xs: 640px;   $bp-2xs: 480px;

$spacers: (0: 0, 1: 4px, 2: 8px, 3: 12px, 4: 16px, 5: 24px, 6: 32px, 7: 48px, 8: 64px);
```

Generated into utility classes by `styles/_utilities.scss` — `.gap-0`.`.gap-8`, `.mt-*`/`.mb-*`/`.p-*` etc. Use these instead of inventing a one-off spacing value.

Runtime tokens (`app/globals.css`): `--max: 1360px` (container max-width), `--px: 40px` (container horizontal padding, shrinks at breakpoints — 28px @1024, 20px @768, 16px @480), `--r: 6px` (border-radius), `--ease: cubic-bezier(0.16, 1, 0.3, 1)` (the one easing curve used everywhere — GSAP tweens and CSS transitions alike).

`respond($bp)` mixin (`styles/_mixins.scss`) wraps `@media (max-width: $bp)` — use it instead of writing raw media queries.

## 4. Core UI primitives

| Class | Look |
|---|---|
| `.container` | `max-width: var(--max)`, centered, `padding: 0 var(--px)` |
| `.section-pad` | `padding: 110px 0` — standard vertical section rhythm |
| `.btn` / `.btn-accent` / `.btn-outline` | Mono, uppercase, `11px`, `14px 28px` padding. `.btn-accent` = solid lime fill → outline on hover; `.btn-outline` = bordered → accent border/text on hover. Both lift `translateY(-2px)` on hover. |
| `.tag` / `.tag.green` | Pill-shaped mono label, `10px` uppercase. `.green` variant = accent-tinted border/bg (used for skill chips vs plain `.tag` used for taxonomy tags on cards). |

## 5. Grid & gap conventions — read before adding a new card grid

Two genuinely different gap conventions coexist by design — **don't default to one without checking which kind of grid you're building**:

1. **Seam grids** (`.services-grid`, `.work-grid`, `.blog-grid`): `gap: 2px`. The thin gap *is* the border between tiles — cards sit on `var(--surface)` against the page's `var(--bg)`, and the 2px gap is what reads as a hairline seam. This is copied exactly from `sahab-site/`'s original CSS; **do not "fix" it to a spacing-scale value** (a past regression widened these to `12px` from the spacing scale, which visibly narrowed every tile and broke the seam look — see `MEMORY.md` 2026-08-23).
2. **Layout grids** (`.about-split-grid`, `.home-about-split`, `.about-skills-grid`, etc.): real spacing-scale gaps (`60px`-`90px`) between genuinely separate content blocks, not tiles of the same repeating card type.

When building a new repeating-card grid (another portfolio/blog/service-style listing), match convention 1. When building a two-column content layout, match convention 2.

## 6. Animation system

- **`AnimatedSection`** (`components/site/AnimatedSection.tsx`) — the default scroll-reveal wrapper. `from="bottom"` (default, `y: 34`), `"left"` (`x: -42`), or `"fade"` (opacity only). Built on GSAP + ScrollTrigger, `start: "top 91%"`, `toggleActions: "play none none none"` (plays once, never reverses). Use this for any "fades/slides in as you scroll" section — don't hand-roll a new IntersectionObserver for that case.
- **Skill bars** (`components/site/SkillBar.tsx`) — a different mechanism: `.skill-fill` starts at `width: 0` and only animates to its target `--w` custom-property width when a `.go` class is added. `SkillBar` adds `.go` via a plain `IntersectionObserver` (not GSAP — no scroll-linked easing needed, just a one-shot trigger). If you add another CSS-custom-property-driven bar/meter animation, follow this same "class-added-on-intersect" pattern rather than animating inline styles from JS on every scroll tick.
- **Hover micro-interactions on cards**: title color → `var(--accent)`, cover image `transform: scale(1.04-1.05)`, arrow button fills accent — all on the *card's* `:hover`, targeting descendant classes. Card thumbs need `overflow: hidden` for the image scale to clip correctly, and the image itself needs its own `transition: transform` — both are easy to forget when renaming classes (see `MEMORY.md` 2026-08-23 for the regression this caused once).
- **Counters** (stat numbers ticking up from 0): not currently implemented in the Next app (the original `sahab-site/js/main.js` did this via `data-target`/`data-suffix` + a GSAP tween on `ScrollTrigger` `onEnter`; the ported homepage/about pages render static stat values instead). If this gets added back, follow the same "GSAP tween on ScrollTrigger onEnter" shape as the skill-fill/AnimatedSection patterns above, not a `setInterval`.

## 7. Source of truth

When in doubt about intended visual/animation behavior for a page that has a `sahab-site/` counterpart, **read the original HTML/CSS/JS first** — it's the design spec, not just legacy code. Its `scss/` folder is also the origin of most class names now used in `app/globals.css` and component-level `.scss` files.
