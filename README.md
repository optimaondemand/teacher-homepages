# Optima Teacher Home Pages

A self-serve builder that turns a short form into a Canvas course home page for Optima Academy Online. Teachers fill in their course details, switch on the sections they want, and paste the result into a Canvas page.

**Builder:** https://optimaondemand.github.io/teacher-homepages/

## One page style, customized by content

Every course home page uses the standard Optima layout — navy chrome, the owl, cyan accents, gold for announcements. Teachers do not choose a visual style. They customize by choosing **which sections appear and what goes in them**:

| Section | Optional | What a teacher fills in |
|---|---|---|
| Header | always | Course name, tagline, term, section, meeting time, their name / role / email |
| Announcements | yes | Any number of dated entries, one pinnable for the gold highlight |
| Quick-access tiles | yes | Any number, each with an icon, label, description, link, new-tab toggle |
| **Meet the teacher** | yes | Photo in a choice of frame, a sentence or two, a link to their About Me page, and their house |
| Module cards | yes | Any number, auto-numbered, each linking to a module intro page |
| Closing note | yes | A line after the last module |
| Commonplace Corner | yes | Quote, attribution, and what students should do with it |
| Footer | always | An optional extra line |

An earlier version of this repo also offered animated, per-subject "personalized" pages hosted here and embedded via iframe. That was more configuration than the job needed and has been removed; it is recoverable from git history if it is ever wanted back (`git log -- home.html`).

## Files

| File | Role |
|---|---|
| `index.html` | The whole builder. Self-contained: no build step, no CDN, no external fonts. |
| `houses/*.png` | The four house crests, cropped and downscaled to 240px badges from the official artwork. **Served from GitHub Pages and linked absolutely** from every pasted page. |

## Why the crests must stay hosted here

A pasted Canvas page cannot resolve a relative path back to wherever the builder happened to be running, so the generated HTML references crests by absolute URL:

```
https://optimaondemand.github.io/teacher-homepages/houses/odysseus.png
```

**Do not rename or move `houses/`.** Every page a teacher has already pasted points at these exact URLs, and Canvas keeps its copy of that HTML — breaking these paths breaks live course home pages with no way to fix them centrally.

## The teacher photo

There is no server here, so the builder cannot host an uploaded file. Two paths, both real:

1. **Paste a link** (recommended). Teachers upload to Canvas **Files**, open the file, and copy the address. Adds nothing to the page weight. The file must be published or students will see a broken image.
2. **Choose a file from this computer.** The builder centre-crops it square, steps down through 360 → 200px and quality 0.82 → 0.5 until the result is under ~60 KB, and writes it into the page as a `data:` URI. Nothing external to break, at the cost of a larger paste.

If a Canvas release ever starts stripping `data:` URIs from page HTML, option 2 will show a broken image and option 1 will still work — that is the fallback to point teachers at.

Frames: Circle, Arch, Rounded square, Plain edge. With no photo, the frame fills with the teacher's initials. Honorific-plus-surname names ("Ms. Rivera") would otherwise yield a single letter, so those pair the honorific with the surname for a two-letter monogram ("MR").

## Houses belong to the teacher

Four houses, virtues taken from the crest ribbons: **Galahad** (Perseverance), **Cincinnatus** (Courage), **Nightingale** (Service), **Odysseus** (Self-Governance).

The crest appears **inside the Meet the Teacher card**, captioned "*[Name]* is in", so it plainly reads as the teacher's house. It is deliberately not in the page header, where it would read as though the whole course belonged to a house. House color is used only as a hairline on the crest plate, so it never becomes a competing accent.

The crest artwork carries a dark vignette, so it is set on a navy plate rather than floated on white, where it read as a dark blob.

## Conventions the output has to keep

- **Every style is inline.** Canvas strips `<style>` and `<script>` from page content, so a pasted page can have no `:hover`, no transitions, no animation, and no media queries.
- **Output is pure ASCII.** Emoji, curly quotes, and dashes are all emitted as numeric character references so Canvas's encoding handling cannot mangle them.
- **Tiles carry explicit `box-sizing: border-box`.** The original template's content-box `min-width: 200px` pushed the fourth tile onto its own row.
- Editing a page in Canvas's rich-text view can scramble the inline formatting. Teachers should come back to the builder and re-paste instead.

## Maintenance

- The Tech Help tile is pre-filled with the tech-support Teams meeting, in `TEAMS_TECH_HELP` near the top of the script block.
- Work in progress is kept in `localStorage` under `optima-teacher-homepage-builder-v2`; bump that key if the state shape changes incompatibly.
- `course-home-builder.html` in the `optima-widgets` repo is the ancestor of this builder and is now **behind** it (no Meet the Teacher section). Treat this repo as canonical and retire that copy rather than maintaining both.
