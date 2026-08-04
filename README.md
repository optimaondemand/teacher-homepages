# Optima Teacher Page Builders

Self-serve builders that turn a short form into a branded Canvas page for Optima Academy Online. Teachers fill in a form and paste the result into Canvas. No build step, no CDN, no external fonts, no server.

| Builder | Makes | Link |
|---|---|---|
| `index.html` | A course **home page** | https://optimaondemand.github.io/teacher-homepages/#course |
| `index.html` | An **Optima Commons** homeroom page | https://optimaondemand.github.io/teacher-homepages/#commons |
| `lesson.html` | A **lesson page** in the house lesson format | https://optimaondemand.github.io/teacher-homepages/lesson.html |

They are siblings by design and share their conventions (inline styles only, pure-ASCII output, `localStorage` drafts, live preview beside the form).

**Three builders, two files, no new addresses.** Course home and Commons are two *modes* of `index.html`, switched by a tab strip in the header and remembered in `localStorage`. That was the requirement: teachers already had the two existing links in circulation, so a third builder could not arrive as a third URL. A `#course` / `#commons` fragment lets the lesson page link into a specific mode, and `applyMode()` keeps the address bar matching the visible tab via `history.replaceState` — same page, bookmarkable, no extra history entries.

Adding a fourth builder means another entry in the `MODES` map, another `#mode-<name>` wrapper in the form column, and a `build<Name>()` emitter. Nothing else changes: storage, preview, copy/download and the mode plumbing are already generic.

## Every built page can be reopened in the builder

Added 2026-08-04. A teacher who wants to change one announcement had to fill the whole form in again, because the builder could produce a page but not read one. Now every page carries its own settings, so pasting it back restores the form exactly.

**The state travels in the page.** The last line inside the instruction comment at the top of every output is `OAO-BUILDER:<version>:<mode>:<base64 JSON of state>`. `payloadLines()` writes it, `readPayload()` reads it, and the *Already built this page? Reopen it here* panel above the form takes either a pasted page or a downloaded `.html` file.

Why the state and not the markup: a rendered page does not say which emoji was picked from a list, whether a section was switched off or merely left empty, which preset drew a table, or which standards were ticked to produce that card. Reading it back out would be guesswork with silent gaps. Round-tripping the state is exact — verified byte-for-byte, output-in equals output-out.

Four details that are load-bearing:

- **base64 has no hyphen in its alphabet**, so the payload can never close the HTML comment it lives in, whatever a teacher typed upstream of it.
- **It is the last line before `-->`**, and the parser reads to the comment's end. That is what lets it survive an editor that re-wraps a 4 KB line. Anything appended after it inside the comment (a rule of `=` characters, say) would be swallowed into the base64 and break decoding — so keep it last.
- **A pasted page names its own builder.** A Commons page dropped on the course tab switches tabs; a lesson page pasted into `index.html` sends the teacher to `lesson.html`, and the reverse.
- **Imported state goes through `hydrate()`**, the same defaults merge `load()` uses, so a page built by an older version of the builder still opens complete.

Reopening replaces the whole form, so it is behind a `confirm()`, and the draft it displaces is saved first. Three things are refused with an explanation rather than a silent no-op: a page with no payload (built before this shipped, or its comment deleted), a payload that will not decode, and an empty box.

**What it cannot recover:** edits made directly in Canvas's rich-text editor. The payload reflects the last build, not the page as it now stands. Teachers should make changes here and re-paste, which is what the builders have always asked for.

**One open question:** whether the comment survives a Canvas save-and-copy-back. The downloaded `.html` file is never touched by Canvas, so that route works regardless, and the standards-in-a-comment feature already assumes comments survive — but that has not been confirmed on a real page. Worth testing before telling teachers to copy out of Canvas rather than keep the file.

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

Drawn visuals and activities are both chosen from a set of ready-made shapes. See below.

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

**No teacher tool here may require a Claude account**, since many teachers do not have one. Both of these blocks are chosen from a set of ready-made shapes that the builder renders itself, from a small form, with no AI involved anywhere:

| Drawn visual | Interactive activity |
|---|---|
| Comparison table | Self-check questions |
| Timeline | Match the term |
| Numbered steps | Sort into categories |
| One idea to remember | Worked example |

Each is a `PRESETS` entry pairing a field definition with a renderer that emits the same inline-styled, JavaScript-free HTML as everything else. The four activities are all `<details>` reveals underneath, differing only in framing: the attempt sits in the visible summary and the answer in the hidden half. **Adding a shape to `PRESETS` is how this grows.** No path asks a teacher to supply HTML from anywhere.

An earlier version offered a `mode: 'ask'` escape hatch that wrote a prompt for the teacher to paste into Claude, took the HTML back, and linted it. It was **removed on 2026-08-03** at the user's request. Two reasons it was the right call: it was the only feature that split teachers into those who could use the tool fully and those who could not, and it was the only way arbitrary third-party HTML could reach a student-facing page. Recoverable from history if it is ever wanted (`git log -S "canvasStrips"`).

Drafts saved while that mode existed are migrated on load rather than discarded: a block whose `mode` is no longer a known preset is moved onto a real shape and given empty rows, and the checklist then reports it as an empty shape. Everything else the teacher typed survives.

## Standards

Teachers load their department's list once, then tick per lesson. The parser (`parseStandards()`) accepts CSV, tab-separated Excel pastes, JSON (array of objects, array of strings, or a code→text map), and plain `CODE description` lines; header rows and prose lines are skipped rather than imported as junk. Standards can also be added one at a time by hand.

Where they land is a choice, defaulting to the one the curriculum uses:

- **In an HTML comment** (default). Travels with the page for whoever edits it next; a student never sees it. `--` inside a description is collapsed so it cannot close the comment early.
- **In a visible card** at the foot of the page, for departments that want families to see the alignment.

The skill deliberately keeps standard codes off student-facing pages, on the grounds that the codes mean nothing to a student and the objectives already say what the lesson is for. The builder says so at the choice, then respects the teacher's decision.

## Before you publish

A live checklist under the form flags what would otherwise be found by a student: an unapproved video domain, a visual or activity left empty, an image still showing as a gap, an unusable image link, a missing image description, Parts with no minute pill, a missing Today's Focus, and pages large enough to be worth splitting.

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
- **Never put a block element inside `<a>`.** Everything inside a link is a `<span>`, given `display: block` where it needs to lay out like one. See below — this is the one convention that has actually cost a teacher a broken page.
- **Do not rely on `text-transform`, `letter-spacing`, `font-weight`, or `object-fit` surviving.** Canvas's rich-text editor drops all four on a round trip. Where the result matters, bake it into the content: chip labels are uppercased when written rather than by CSS.
- **Tiles carry explicit `box-sizing: border-box`.** The original template's content-box `min-width: 200px` pushed the fourth tile onto its own row.
- Editing a page in Canvas's rich-text view can scramble the inline formatting. Teachers should come back to the builder and re-paste instead.

## The rich-text editor unwraps links that contain block elements

**2026-08-03.** One tester of several reported that the tile and module-card formatting vanished after pasting. His saved page told the whole story:

| `<a>` element | Contains | Result |
|---|---|---|
| Teacher chip, "Email me", "See all modules" | text only | survived |
| 4 quick-access tiles, 5 module cards | `<div>` children | **unwrapped — link gone, children promoted to the flex row** |

Nine links vanished; every one wrapped block elements. Three survived; every one wrapped only text. The card styling lived on the `<a>`, so losing the link lost the card — leaving twelve loose divs in a flex container, which reads as scattered text.

**His HTML had been round-tripped through the rich-text editor**, and the fingerprints are unambiguous. Nothing here writes CSS this way:

```
ours:  border: 1px solid #D0D9E8; border-top: 4px solid #E0A82E
his:   border-width: 4px 1px 1px; border-style: solid; border-color: #e0a82e #d0d9e8 #d0d9e8
```

That is an editor parsing our styles into a model and re-serializing them. Its schema treats `<a>` as inline-only, so it closed each link before the `<div>` inside it. The same round trip silently dropped `text-transform`, `letter-spacing`, `font-weight`, and `object-fit`.

**Not the server-side sanitizer.** Parsing `<a href="#"><div>x</div></a>` with libxml2 — the parser behind Canvas's server-side sanitizing — keeps the div inside the link. Verified. So the damage happens client-side, in the editor, before the body is ever submitted. Which means it is triggered by *how a teacher edits*, not by the account they are on: the other testers pasted into the HTML view and saved without returning to rich text. **They were one accidental rich-text save away from the same page.**

The fix removes the construct rather than trying to survive it. Every element inside a link is now a `<span>` carrying `display: block` (or `display: flex` for the module number). Spans are valid inside a link under every content model, so there is nothing left to unwrap, and the whole card stays clickable — which styling a wrapper `<div>` and shrinking the link to its text would have given up.

## Bugs fixed after play-testing

Teachers reported "the photo option does not work." Four defects. Three were in how the section was gated; the fourth was Canvas refusing the delivery mechanism outright.

0. **Canvas stripped embedded photos.** The first fix shipped an upload button that embedded the image in the page. Canvas removed it on paste. Embedding is not viable in Canvas page HTML; the upload path is gone and linking to a published file in Canvas Files is the only supported route.
1. **The section was switched off by default.** `teacher.show` started `false`, so a teacher who clicked *Start blank*, added a photo, and looked at the preview saw nothing at all — and nothing signalled that a checkbox stood between them and their photo. It now defaults on; the section still renders nothing when it has no content, so defaulting on costs nothing.
2. **Adding a photo by link did not switch the section on.** The file-picker path set `show = true`; the link path did not, so the same intent worked or silently did nothing depending on which input a teacher used. Entering a link now switches the section on.
3. **The link field filled itself with thousands of characters of base64.** While both inputs existed, the field carried `data-path="teacher.photo"` and `renderScalars()` wrote the state straight back into it — so after using the picker, the "paste a link" box filled with the encoded image, and any list edit re-filled it. With embedding gone, the field only ever holds a URL, which is what it should show.

---

# The Optima Commons builder (`index.html`, Commons tab)

A homeroom page, built by the homeroom teacher. The Commons is framed as a gathering place where students connect with each other and with the OAO virtual campus community, tagline *Transforming Wonder into Purpose*.

Its layout, section set and language come from a proof-of-concept page written by a teacher; its look comes from the two builders beside it. The POC's own palette — seven button colours — was dropped for Optima navy/cyan/gold, and the POC's `INSERT_..._LINK` placeholders became form fields.

## Sections

Hero (heading, subtitle, tagline pill, homeroom, term, grade band) → **card sections** → flash poll → what to do this week → **Meet your principal** → footer line. The homeroom teacher's own introduction sits near the top; the principal sits at the very bottom.

**Card sections are one repeatable shape**, not three hard-coded ones. Start Here, House Community and Help & Support in the POC are all *heading + intro + a row of cards*, so the builder ships one section type and loads those three as the example. A teacher renames, reorders, deletes or adds sections without a code change. Cards run 3 or 4 across, optionally on a tinted panel.

## Card rows are tables, not flexbox

A `<td>` stretches to the tallest cell in its row on its own. Flexbox would need `align-items` to equalise card heights, and Canvas keeps the markup but not the stylesheet — so whatever equalises those heights has to be **structural**. This is the one place the Commons output deliberately diverges from the course home page, which uses flex for its tiles.

Known cosmetic consequence: buttons within a row do not bottom-align when descriptions differ in length. The POC behaves the same way. Fixing it means a nested full-height table inside each cell.

## The banner accent

The banner stays navy so the page always reads as Optima. The teacher picks the accent that colours the rule under the banner, the tagline pill, every card's top edge and the section underlines: Optima cyan, Optima gold, or one of the four house colours.

House colours are offered **here but not on a course home page**. A teacher's house travels with the teacher, and their Commons is their own room, so flying it says something true; on a course home page the same crest in the header would read as the *course's* house, which is why it lives in the Meet the Teacher card there instead.

Gold stays gold regardless of the accent in the "what to do this week" panel — it is this page's "read this one" colour, the same role a pinned announcement plays on a course home page. So there are never more than two accents in play.

## Meet your principal, and the Connect link

The circular portrait in the POC was the principal's, not the teacher's. Principals go with a grade band, so students see the same face across every homeroom in the band.

It sits last on the page, after the week's work, as the invitation to reach past the homeroom. One **Connect** button takes whatever channel that principal actually keeps — a Calendly booking page, a Teams meeting, a Canvas page, or an email address. A bare email is turned into a `mailto:` link by `linkOut()`, so a principal who just gives an address still gets a working button.

## The flash poll, and what Canvas allows

A teacher builds the poll elsewhere and brings it in three ways:

| Mode | What actually happens |
|---|---|
| Link button | Always works. The default. |
| Iframe embed | Kept by Canvas, but Canvas only loads embeds from sites it trusts. The builder checks there is an `<iframe>` at all and says to test the page as a student. |
| Pasted HTML | Linted by `canvasStrips()`. A poll that needs JavaScript to count votes **cannot** work once pasted; what survives is the look of a poll. The teacher is told exactly what will be removed, before it reaches a student. |

`canvasStrips()` here is an independent copy, deliberately not shared with the lesson builder, so neither file's changes can break the other.

---

## Maintenance

- The Tech Help tile is pre-filled with the tech-support Teams meeting, in `TEAMS_TECH_HELP` near the top of the script block.
- Work in progress is kept in `localStorage`, under `optima-course-home-builder-v3` for the home page builder, `optima-commons-builder-v1` for the Commons builder, `optima-page-builder-mode` for the tab you were last on, and `optima-lesson-page-builder-v1` for the lesson builder. The course key was deliberately **not** bumped when the Commons tab landed, so every draft already in a teacher's browser still opens. **Bump the key whenever a default changes**, not only when the shape does: the loader merges saved values over defaults, so a stale saved `false` outlives the fix that changed it. That is precisely what would have kept the photo bug alive for anyone who had already used the builder.
- `course-home-builder.html` in the `optima-widgets` repo is the ancestor of this builder and is now **behind** it (no Meet the Teacher section). Treat this repo as canonical and retire that copy rather than maintaining both.
