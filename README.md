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
| See all modules | yes (on by default) | Button text and a link to the course Modules page |
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

There is no server here, so the builder cannot host an uploaded file. Teachers pick a file from their computer; the builder centre-crops it square, steps down through 360 → 200px and quality 0.82 → 0.5 until the result is under ~60 KB, and writes it into the page itself as a `data:` URI. Nothing to upload, no link to keep alive.

A "paste a Canvas Files link" alternative existed briefly and was removed by request.

> **Single point of failure worth knowing.** The embedded `data:` URI is now the only way a photo reaches the page. If Canvas's HTML sanitizer strips `data:` image sources — behaviour that varies by Canvas release and account settings — the photo will look correct in the builder's preview and appear broken once pasted into Canvas, with no fallback in the tool. Test one real page in Canvas after any Canvas upgrade. Restoring the link field is a small change if it is ever needed (`git log -- index.html`).

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

## Bugs fixed after play-testing

Teachers reported "the photo option does not work." Three defects, all in how the section was gated rather than in the image handling:

1. **The section was switched off by default.** `teacher.show` started `false`, so a teacher who clicked *Start blank*, added a photo, and looked at the preview saw nothing at all — and nothing signalled that a checkbox stood between them and their photo. It now defaults on; the section still renders nothing when it has no content, so defaulting on costs nothing.
2. **Adding a photo by link did not switch the section on.** The file-picker path set `show = true`; the link path did not. The same intent worked or silently did nothing depending on which input a teacher used. Moot now the link field is gone, but auto-enable is kept for every field that implies intent.
3. **The link field filled itself with thousands of characters of base64.** That input carried `data-path="teacher.photo"`, so `renderScalars()` wrote the state straight back into it: after using the file picker the "paste a link" box filled with the encoded image, and any list edit re-filled it. Removing the field removed the binding; the photo is now written only by the picker and cleared only by *Remove photo*.

## Maintenance

- The Tech Help tile is pre-filled with the tech-support Teams meeting, in `TEAMS_TECH_HELP` near the top of the script block.
- Work in progress is kept in `localStorage` under `optima-course-home-builder-v3`. **Bump this key whenever a default changes**, not only when the shape does: the loader merges saved values over defaults, so a stale saved `false` outlives the fix that changed it. That is precisely what would have kept the photo bug alive for anyone who had already used the builder.
- `course-home-builder.html` in the `optima-widgets` repo is the ancestor of this builder and is now **behind** it (no Meet the Teacher section). Treat this repo as canonical and retire that copy rather than maintaining both.
