# Optima Teacher Page Builders

Self-serve builders that turn a short form into a branded Canvas page for Optima Academy Online. Teachers fill in a form and paste the result into Canvas. No build step, no CDN, no external fonts, no server.

| Builder | Makes | Link |
|---|---|---|
| `index.html` | A course **home page** | https://optimaondemand.github.io/teacher-homepages/ |
| `lesson.html` | A **lesson page** in the house lesson format | https://optimaondemand.github.io/teacher-homepages/lesson.html |

They are siblings by design and share their conventions (inline styles only, pure-ASCII output, `localStorage` drafts, live preview beside the form). If they are ever merged into one multi-purpose builder, that shared spine is the seam to merge along.

---

# The lesson page builder (`lesson.html`)

Applies the `optima-lesson-format` lesson layout so a teacher's own page sits beside the built curriculum without looking different: navy header, metadata strip, lavender title strip, gold-topped cards, gold minute pills, navy footer.

## Sections

Everything except the header details is optional and drops out of the page when empty.

| Section | What a teacher fills in |
|---|---|
| Lesson details | Course, quarter, module number and title, lesson number and title, grade level |
| Today's Focus | Hook line and an opening paragraph |
| Objectives | Any number; rendered as numbered gold circles under "By the end of this lesson you will be able to…" |
| What you need | Any number of materials |
| **Lesson content** | Any number of **Parts**, each a card with an icon, heading, and minute pill |
| What students do next | Signposts to the graded Canvas items that follow |
| Wrap-up | A closing paragraph |
| Standards covered | A loaded standards list, ticked per lesson (see below) |
| Footer | An optional extra line |

## Parts are built from blocks

A Part holds any number of blocks, in any order, added from a row of buttons:

| Block | Notes |
|---|---|
| **Lesson text** | Optional subhead plus prose. Blank line = paragraph, `- ` = bullets, `1. ` = numbered, `**bold**`, `*italic*`, `[text](link)`. Teachers never write HTML. |
| **Drawn visual** | A comparison table, timeline, numbered steps, or a one-idea card, built out of divs and inline styles. No file, no hosting, no link that can rot. |
| **Image** | A link to a published file in Canvas **Files**, or any public image URL. Alt text, caption, three widths. Renders as a marked gap until the link exists. |
| **Video** | A link or a pasted embed code; YouTube and Vimeo links are converted to their embed form. Includes a "while you watch" notice prompt, because a video with no task attached gets skipped. |
| **Call-out box** | Helpful (blue), Watch out (red), or the AI-awareness variant. |
| **Reveal box** | Native `<details>`. The instruction lives in the visible summary so the student commits before the answer opens. |
| **Interactive activity** | Self-check questions, match the term, sort into categories, or a worked example. All built from `<details>` reveals. |

Drawn visuals and activities both offer a set of ready-made shapes plus an **Ask Claude** escape hatch. See below.

## Everything it emits has to survive Canvas

Canvas throws away `<script>`, `<style>`, and `data:` image sources from pasted page HTML. That single constraint decided three things:

- **There is no hosted-page output.** An earlier draft of this builder emitted a second, GitHub-hosted version carrying the skill's `.optima-widget` CSS and its delegated JS runtime. A teacher cannot deploy to GitHub Pages, so that output was a dead end dressed up as a feature. It was removed rather than shipped.
- **There is no image upload.** With no server, an uploaded image can only become a `data:` URI, which Canvas strips (confirmed 2026-07-31 with the teacher photo in the home page builder). Images are links, normalised and validated by `imgSrc()` / `imgWarning()`, exactly as `photoSrc()` / `photoWarning()` do next door.
- **Interactivity means `<details>`.** Canvas keeps and renders native disclosure boxes with no JavaScript, so click-to-open reveals are the interaction the builder can actually deliver.

Note what *is* allowed: an `<img>` pointing at any real URL survives, which this repo's own output proves — pasted pages already pull the owl from `raw.githubusercontent.com` and the crests from our Pages site. Only the `data:` form is blocked.

## Getting images onto a page

Three routes, in the order teachers should reach for them:

1. **Don't use an image.** Most lesson visuals are diagrams, timelines, labelled figures, and comparison tables, which house convention says should be inline HTML/CSS rather than pictures. The **Drawn visual** block builds those into the page. Nothing to upload, nothing to host, no link that can break.
2. **Write the lesson now, link the picture later.** An Image block with no link yet renders a visible, clearly labelled gap carrying its alt text, so the page can be drafted and previewed before the pictures exist. The teacher bulk-drags them into Canvas Files, publishes them, comes back, pastes the links, and copies the page again. This deliberately keeps teachers *out* of Canvas's rich-text view, which can scramble inline styles.
3. **Any public image URL** also works and is passed through untouched.

A bad or missing link never emits a broken `<img>`; it degrades to the same marked gap, and the checklist counts how many are outstanding.

## Drawn visuals and activities

**Not every teacher has a Claude account, so nothing here may require one.** Both of these blocks lead with a set of ready-made shapes the builder renders itself, from a small form, with no AI involved at all:

| Drawn visual | Interactive activity |
|---|---|
| Comparison table | Self-check questions |
| Timeline | Match the term |
| Numbered steps | Sort into categories |
| One idea to remember | Worked example |

Each is a `PRESETS` entry pairing a field definition with a renderer that emits the same inline-styled, JavaScript-free HTML as everything else. The four activities are all `<details>` reveals underneath, differing in framing: the attempt always sits in the visible summary and the answer in the hidden half. The example lesson the builder loads on first run is built entirely from presets, so a teacher without Claude sees a complete, working page immediately.

`mode: 'ask'` is the escape hatch for anything the shapes do not cover, and it is the last option in the list rather than the first.

### The Ask Claude loop

**Nothing in this repo talks to Claude.** These are static HTML files with no server and no API key. The builder composes a *request* that the teacher pastes into whatever Claude they already use, so there is no API billing attached to the tool and no key to manage; tokens are spent on the teacher's own seat.

The **Ask Claude** tab assembles one prompt covering every outstanding drawn visual and activity, carrying the course, grade, module, lesson, objectives, ticked standards, and the teaching text immediately above each slot, plus the shared constraints (no JavaScript, no `<style>`, no classes, no form controls, no images or inline `<svg>`, inline styles only, entities for non-ASCII, no em dashes) and a section of guidance specific to each kind. The teacher pastes the HTML back into the block.

Because the conversation is the teacher's own, **revising is just carrying on talking**. The builder makes round two one click: each block keeps the original description alongside the current HTML, takes a note of what to change, and copies a revision request bundling all three. The version being replaced is retained, so a revision that comes back worse can be put back with one button.

Pasted HTML is linted by `canvasStrips()` for `<script>`, `<style>`, `on*` handlers, `class` attributes, and form controls, and the block names whichever Canvas will remove. This matters because the failure is silent otherwise: the page pastes fine and the activity is simply dead when a student opens it.

## Standards

Teachers load their department's list once, then tick per lesson. The parser (`parseStandards()`) accepts CSV, tab-separated Excel pastes, JSON (array of objects, array of strings, or a code→text map), and plain `CODE description` lines; header rows and prose lines are skipped rather than imported as junk. Standards can also be added one at a time by hand.

Where they land is a choice, defaulting to the one the curriculum uses:

- **In an HTML comment** (default). Travels with the page for whoever edits it next; a student never sees it. `--` inside a description is collapsed so it cannot close the comment early.
- **In a visible card** at the foot of the page, for departments that want families to see the alignment.

The skill deliberately keeps standard codes off student-facing pages, on the grounds that the codes mean nothing to a student and the objectives already say what the lesson is for. The builder says so at the choice, then respects the teacher's decision.

## Before you publish

A live checklist under the form flags what would otherwise be found by a student: an unapproved video domain, a visual or activity still sitting as a description, one Canvas will break, an image still showing as a gap, an unusable image link, a missing image description, Parts with no minute pill, a missing Today's Focus, and pages large enough to be worth splitting.

---

# The course home page builder (`index.html`)

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
| `index.html` | The course home page builder, whole. |
| `lesson.html` | The lesson page builder, whole. |
| `houses/*.png` | The four house crests, cropped and downscaled to 240px badges from the official artwork. **Served from GitHub Pages and linked absolutely** from every pasted page. |

## Why the crests must stay hosted here

A pasted Canvas page cannot resolve a relative path back to wherever the builder happened to be running, so the generated HTML references crests by absolute URL:

```
https://optimaondemand.github.io/teacher-homepages/houses/odysseus.png
```

**Do not rename or move `houses/`.** Every page a teacher has already pasted points at these exact URLs, and Canvas keeps its copy of that HTML — breaking these paths breaks live course home pages with no way to fix them centrally.

## The teacher photo

**Canvas strips embedded images from pasted page HTML.** This was confirmed in practice on 2026-07-31: a photo the builder embedded as a `data:` URI vanished on paste. Embedding is therefore not viable, and the upload button that produced it has been removed rather than left in place to catch people out. A photo must be a **link**.

Teachers upload the photo to Canvas **Files**, publish it, open it, and paste the address. There is no server here to host anything, so this is the only mechanism available — and it is the one that survives.

### The address bar does not give you an image URL

Opening a file in Canvas puts you on its *preview page*:

```
https://host/courses/123/files/45678?module_item_id=99
```

That is HTML, not an image; dropped into an `img` tag it renders nothing. Canvas's own editor uses the `/preview` form, so `photoSrc()` normalises whatever a teacher pastes:

| Pasted | Emitted |
|---|---|
| `.../files/45678` | `.../files/45678/preview` |
| `.../files/45678?module_item_id=99` | `.../files/45678/preview` |
| `.../files/45678/preview` | unchanged |
| `.../files/45678/download?wrap=1` | `.../files/45678/download` |
| `https://optimaed.com/staff/x.jpg` | unchanged |

This matters: without it, a teacher doing exactly what they were told still gets no photo.

### Wrong-shaped links are named, not silently broken

`photoWarning()` catches the four realistic mistakes — an embedded `data:` URI, something that is not a URL, a Files *folder*, and a Canvas *page* address — and says which one it is. A warned link is **not written into the page at all**; the initials monogram is used instead, because a broken image in a live course home page is worse than no photo.

The builder also loads the link in its preview and reports whether it actually resolved, which is the only place an unpublished file gets caught before students meet it.

Any saved `data:` photo left over from the embedding build is discarded on load, so nobody keeps pasting a photo that cannot render.

Frames: Circle, Arch, Rounded square, Plain edge. With no photo, the frame fills with the teacher's initials. Honorific-plus-surname names ("Ms. Rivera") would otherwise yield a single letter, so those pair the honorific with the surname for a two-letter monogram ("MR").

## Houses belong to the teacher

Four houses, virtues taken from the crest ribbons: **Galahad** (Perseverance), **Cincinnatus** (Courage), **Nightingale** (Service), **Odysseus** (Self-Governance).

The crest appears **inside the Meet the Teacher card**, captioned "*[Name]* is in", so it plainly reads as the teacher's house. It is deliberately not in the page header, where it would read as though the whole course belonged to a house. House color is used only as a hairline on the crest plate, so it never becomes a competing accent.

The crest artwork carries a dark vignette, so it is set on a navy plate rather than floated on white, where it read as a dark blob.

## Conventions the output has to keep

- **Every style is inline.** Canvas strips `<style>` and `<script>` from page content, so a pasted page can have no `:hover`, no transitions, no animation, and no media queries.
- **No embedded images.** Canvas strips `data:` image sources from pasted page HTML (confirmed 2026-07-31). Every image in the output must be an absolute URL to something hosted elsewhere — Canvas Files for photos, this repo's Pages for crests.
- **Output is pure ASCII.** Emoji, curly quotes, and dashes are all emitted as numeric character references so Canvas's encoding handling cannot mangle them.
- **Tiles carry explicit `box-sizing: border-box`.** The original template's content-box `min-width: 200px` pushed the fourth tile onto its own row.
- Editing a page in Canvas's rich-text view can scramble the inline formatting. Teachers should come back to the builder and re-paste instead.

## Bugs fixed after play-testing

Teachers reported "the photo option does not work." Four defects. Three were in how the section was gated; the fourth was Canvas refusing the delivery mechanism outright.

0. **Canvas stripped embedded photos.** The first fix shipped an upload button that embedded the image in the page. Canvas removed it on paste. Embedding is not viable in Canvas page HTML; the upload path is gone and linking to a published file in Canvas Files is the only supported route.
1. **The section was switched off by default.** `teacher.show` started `false`, so a teacher who clicked *Start blank*, added a photo, and looked at the preview saw nothing at all — and nothing signalled that a checkbox stood between them and their photo. It now defaults on; the section still renders nothing when it has no content, so defaulting on costs nothing.
2. **Adding a photo by link did not switch the section on.** The file-picker path set `show = true`; the link path did not, so the same intent worked or silently did nothing depending on which input a teacher used. Entering a link now switches the section on.
3. **The link field filled itself with thousands of characters of base64.** While both inputs existed, the field carried `data-path="teacher.photo"` and `renderScalars()` wrote the state straight back into it — so after using the picker, the "paste a link" box filled with the encoded image, and any list edit re-filled it. With embedding gone, the field only ever holds a URL, which is what it should show.

## Maintenance

- The Tech Help tile is pre-filled with the tech-support Teams meeting, in `TEAMS_TECH_HELP` near the top of the script block.
- Work in progress is kept in `localStorage`, under `optima-course-home-builder-v3` for the home page builder and `optima-lesson-page-builder-v1` for the lesson builder. **Bump the key whenever a default changes**, not only when the shape does: the loader merges saved values over defaults, so a stale saved `false` outlives the fix that changed it. That is precisely what would have kept the photo bug alive for anyone who had already used the builder.
- `course-home-builder.html` in the `optima-widgets` repo is the ancestor of this builder and is now **behind** it (no Meet the Teacher section). Treat this repo as canonical and retire that copy rather than maintaining both.
