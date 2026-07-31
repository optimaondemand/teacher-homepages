# Optima Teacher Home Pages

A self-serve builder that turns a short form into a Canvas course home page for Optima Academy Online. Teachers open one page, answer questions about their course, and leave with something to paste into Canvas.

**Builder:** https://optimaondemand.github.io/teacher-homepages/

## Two kinds of page

| | Standard page | Make it mine |
|---|---|---|
| What teachers paste | ~15 KB of inline-styled HTML | one `<iframe>` line |
| Where it lives | inside the Canvas page | `home.html` on GitHub Pages |
| Animation, hover, dark mode | no | yes |
| Personalized to subject / style / house | no | yes |
| Breaks if this repo goes away | no | yes |

The split exists because **Canvas strips `<style>` and `<script>` blocks from page content.** A pasted page can therefore have no `:hover`, no transitions, no animation, and no media queries — only inline `style` attributes. Everything interactive (the per-style hero background, count-up stats, scroll reveals, the clickable module trail, hover lifts, the light/dark toggle) requires either JS or a stylesheet, so it can only exist on a hosted page shown through an iframe.

## Files

| File | Role |
|---|---|
| `index.html` | The builder. Both modes, live preview, copy buttons. |
| `home.html` | The hosted personalized page. Reads its entire configuration from the URL fragment. |
| `theme.js` | Shared theme vocabulary — subjects, styles, accents, houses, config encoding. Loaded by both of the above so they cannot drift. |
| `houses/*.png` | The four house crests, cropped and downscaled to 240px badges from the official artwork. |

## How a personalized page works with no per-teacher file

The builder encodes the whole configuration as base64url and hangs it off the URL after `#`:

```
home.html#eyJjb3Vyc2UiOnsidGl0bGUiOiJBbGdlYnJhIDEi...
```

A URL fragment is never sent to the server, so one static file renders unlimited distinct teacher pages. There is no database, no per-teacher commit, and no write access from the browser. It also means **nothing is stored** — the link *is* the page. If a teacher loses the link, they rebuild it in the builder.

Practical limits: a full page config runs 3–5 KB of URL. The builder warns past 8 KB and suggests trimming announcements.

## The governing rule: subject outranks style

Three layers, in priority order:

1. **Brand** — navy chrome, the owl, Wix Madefor, and the seven-color accent set. Not negotiable by anyone.
2. **Subject matter** — decides what one module is called (`Book`, `Liber`, `Investigation`, `Studio`, `Movement`…), what the module sequence is titled (`The Reading Path`, `The Cursus`, `The Field Log`…), the motif vocabulary, and the default accent.
3. **Teacher style** — changes *voice and ornament only*: microcopy, corner radius, ornament density. It cannot rename a unit or swap the motifs.

So a Latin page and a PE page never converge, however the two teachers answer the personality questions. The builder shows teachers exactly what their subject locked in, so the hierarchy is visible rather than mysterious.

Styles available: Practical, Scholarly, Philosophical, Whimsical, Fantastical, Techy, Homey, Natural. Deliberately no childish register — the warmest options are "Homey" and "Natural", which are warm rather than cute.

### Hero backgrounds

Each style carries its own quiet background in the hero, tinted by the teacher's accent. All are pure CSS with no animation and no canvas, so they cost nothing at runtime and survive `prefers-reduced-motion` untouched.

| Style | Background |
|---|---|
| Practical | near-invisible horizontal rules |
| Scholarly | a ruled page, like a kept ledger |
| Philosophical | concentric ripples widening from a corner |
| Whimsical | scattered points of light, irregularly placed |
| Fantastical | a heraldic lattice off a crest field |
| Techy | blueprint grid, minor lines with a heavier major |
| Homey | soft overlapping washes, no hard edges |
| Natural | botanical tile — leaf sprigs and drifting stems |

`Natural` is an inline SVG data URI applied through `mask-image`, so the foliage takes `--accent` rather than being a fixed-color image. Every pattern sits under `.glow`, whose downward darkening keeps it clear of the headline; if you add a pattern, check it at the top of the hero where it is strongest.

## Accent colors and contrast

Accents come from the Optima 2025 Brand Guide only. Each carries two pre-computed variants because the base hex is often unusable as text:

| Accent | Base | On navy (`--accent-ink`) | On white (`--accent-dark`) |
|---|---|---|---|
| Bitstream Blue | `#55C8E8` | `#55C8E8` (8.6:1) | `#33788B` (5.0:1) |
| Gateway Gold | `#C7922C` | `#C7922C` (6.0:1) | `#8B661E` (5.2:1) |
| Portal Purple | `#67308F` | `#9C78B6` (4.6:1) | `#67308F` (8.8:1) |
| Pixel Pink | `#A53E97` | `#BB6EB1` (4.7:1) | `#A53E97` (5.6:1) |
| Gamer Green | `#76C043` | `#76C043` (7.4:1) | `#4C7C2B` (5.0:1) |
| Odyssey Orange | `#F78F1E` | `#F78F1E` (7.1:1) | `#A05C13` (5.2:1) |
| Deep Bitstream | `#0E5568` | `#62909C` (4.7:1) | `#0E5568` (8.3:1) |

Portal Purple on navy is **1.9:1** at its base value — never use `--accent` for text on the navy chrome. Use `--accent-ink` on dark surfaces, `--accent-dark` on light ones, `--accent` only for fills, borders, and gradients, and `--on-accent` for text sitting on an accent-filled shape (it flips to white for dark accents automatically).

Gold is reserved for announcements and the primary button. When a teacher picks gold as their accent, the announcement rail steps aside to cyan so only two accents are ever on screen at once.

## Houses

Four houses, virtues taken from the crest ribbons: **Galahad** (Perseverance), **Cincinnatus** (Courage), **Nightingale** (Service), **Odysseus** (Self-Governance). Selecting one adds a crest badge to the hero. House color is used only inside that badge, so it never becomes a third accent.

## Maintenance

- The Tech Help tile is pre-filled with the tech-support Teams meeting. It lives in `TEAMS_TECH_HELP` near the top of the script block in `index.html`.
- Don't rename `home.html` — its filename is baked into every iframe a teacher has already pasted.
- Editing `theme.js` changes pages that are **already live**, since the config in a teacher's URL is only data. Adding a subject or style is safe; renaming a key is not, because existing links reference it.
- The standard-page generator is a straight port of `course-home-builder.html` in the `optima-widgets` repo; its output is byte-identical. If you fix a bug in one, fix it in both.
- No build step, no frameworks. `home.html` loads Wix Madefor from Google Fonts; everything else is local.
