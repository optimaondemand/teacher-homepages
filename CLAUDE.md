# teacher-homepages

Four self-serve builders for Optima Academy Online teachers. A teacher fills in a form
and pastes the generated HTML into Canvas. **No build step, no server, no dependencies,
no CDN, no external fonts.** Open an `.html` file in a browser and it runs.

| File | Builds | Live |
|---|---|---|
| `index.html` | Course home page (`#course`) + Optima Commons homeroom (`#commons`) | https://optimaondemand.github.io/teacher-homepages/ |
| `lesson.html` | Lesson page in the house lesson format | `/lesson.html` |
| `syllabus.html` | Course syllabus, as Word `.docx` or Canvas HTML | `/syllabus.html` |
| `houses/*.png` | Four house crests, 240px, hotlinked absolutely by pasted pages | `/houses/` |
| `syllabus-courses.json`, `syllabus-shell.docx` | Ship with `syllabus.html`; must stay together | |

**`README.md` is the real documentation** — ~400 lines, one section per builder, and it
explains *why* each constraint exists. Read the section for whatever you are touching
before you touch it. This file is only the short list of things that break something.

---

## Read this before editing

### 1. Never `git add -A` in this repo

Multiple Claude sessions work here in parallel. `git add -A` has already swept another
session's in-progress files into a commit once. **Stage explicit paths.** Pull before you
push — either session may have advanced `main`.

This repo is worked on through a **shared GitHub account**, so every commit carries the
same identity and `git log` cannot attribute work to a person. That makes the two rules
above stricter, not looser: a bad commit cannot be traced, and `main` may have moved under
the same name you are pushing as. There is also no staging environment — GitHub Pages
serves `main`, so **pushing is publishing.**

### 2. No existing URL may change

Teachers have these links in circulation and Canvas keeps its own copy of every pasted
page. A *new* builder as a new file is fine. Moving, renaming, or re-pathing an existing
one is not. **`houses/` is the hardest case:** pasted pages reference crests by absolute
Pages URL, so renaming that folder breaks live course home pages with no central fix.

### 3. Canvas destroys most of what you would normally write

Everything the builders *emit* is constrained by what survives a paste into Canvas. The
builder's own chrome is a normal web page and has none of these limits — keep the two
straight.

Emitted HTML must obey all of the following:

- **Inline styles only.** Canvas strips `<style>` and `<script>`. So: no `:hover`, no
  transitions, no animation, no media queries, no classes. This is the deciding answer to
  every "can we make the pasted page fancier" request. The only workaround is hosting the
  page and embedding it in an iframe.
- **Never put a block element inside `<a>`.** Canvas's *rich-text editor* (not the server
  sanitizer) treats `<a>` as inline-only and unwraps any link containing a `<div>` — the
  link vanishes and its styling is lost. Nine links died this way on a real teacher's page
  (fixed in `2e0598e`). Every element inside a link is a `<span>` with `display: block`.
  Because it is the editor, this only fires for teachers who edit in rich text — treat
  "only one user reports it" as latent, not flaky.
- **The rich-text round trip silently drops `text-transform`, `letter-spacing`,
  `font-weight`, and `object-fit`.** Do not depend on them. Uppercase text when you *write*
  it; use a real `<strong>`. Tell-tale that the editor has touched a page: CSS shorthand
  comes back recombined (`border-width: 4px 1px 1px; border-style: ...`), which nothing
  here authors.
- **Pure ASCII output.** All non-ASCII goes out as numeric character references. Note the
  exception: entities are **not** decoded inside an HTML comment, so comment text must be
  literal ASCII (see `ascii()` in `syllabus.html`).
- **No `data:` images.** Canvas strips them. There is no server here, so every image is a
  link to a published file in Canvas Files, normalised to the `/preview` form by
  `imgSrc()` and validated by `imgWarning()`. A bad link is omitted with a warning rather
  than pasted in broken.
- **Card rows in Commons are `<table role="presentation">`, not flexbox** — a `<td>`
  equalises card heights structurally, which is the only way to do it without stylesheets.

### 4. These are forms, not pipelines

Every field stays editable and every stock section arrives prefilled but switchable-off,
so a teacher can build for a course nobody here has heard of. Catalogue data
(`syllabus-courses.json`) is *input*, never a spec — nothing is looked up and locked.
Do not add validation that refuses off-catalogue values.

### 5. No teacher tool may require a Claude account

Many teachers do not have one. Every interactive or visual option leads with presets the
builder renders itself. Nothing in this repo calls an API — no key, no billing here. The
ask-Claude escape hatch generates a *prompt* the teacher pastes into their own Claude
(and was removed from `lesson.html` in `a10615d`).

### 6. Built pages round-trip through a payload

The last line of the leading HTML comment is
`OAO-BUILDER:<version>:<mode>:<base64 JSON of state>`, written by `payloadLines()` and
read by `readPayload()`, so a teacher can paste a built page back in and recover the form
exactly. **Keep it the last line before `-->`** — the parser reads to the comment's end,
and anything appended after it gets swallowed into the base64. base64 has no hyphen, so
the payload can never close its own comment. If you change a state shape, make sure
`hydrate()` still fills the new fields with defaults, or you break every teacher's saved
draft and every page already in Canvas.

### 7. `localStorage` keys are teachers' saved drafts — do not bump them

`optima-course-home-builder-v3`, `optima-commons-builder-v1`, `optima-page-builder-mode`,
`optima-lesson-page-builder-v1`, `optima-syllabus-builder-v1`. The `-v3` key was
deliberately *not* bumped when Commons landed so existing drafts kept opening. Bumping a
key silently discards work teachers have in progress.

### 8. `canvasStrips()` is duplicated on purpose

`index.html` and `lesson.html` each carry their own copy, so a change in one file cannot
break the other. Do not consolidate it into a shared file — there is no shared file, and
that is the point.

---

## Architecture, briefly

Each builder is a single self-contained file: `<style>` chrome, a two-column layout
(`.col-form` / sticky `.col-out` preview, stacking under 1100px), then one IIFE holding
state, render, and emit.

In `index.html`, course home and Commons are two **modes** of one file. Adding a mode is
three things: an entry in the `MODES` map (`blank` / `example` / `key` / emitter), a
`#mode-<name>` wrapper in the form column, and a `build<Name>()` emitter. Storage,
preview, copy/download, list add/remove/reorder, and `renderScalars()` are already
generic. `renderScalars()` is scoped to `#mode-<active>` — that scoping is what lets two
different state shapes coexist in one file.

`syllabus.html` writes a real `.docx` in the browser with **no library and no compression
API**: it copies every entry of `syllabus-shell.docx` verbatim (same CRC, sizes, method)
and adds the new `word/document.xml` **stored** (method 0). A zip mixing stored and
deflated entries is valid and Word opens it. The shell's own `document.xml` must stay
stored so its prefix and `<w:sectPr>` can be read as text with no inflate — `loadShell()`
throws if that is ever violated. Do not recompress the shell.

## Verifying a change

There is no test suite. What has been used here:

- Open the file directly in a browser; the preview column renders at Canvas width.
- Load the built-in example (`loadExample`) — it exercises every section.
- Round-trip: build, paste the output back into the reopen panel, confirm the form matches.
- For pasted-page questions, the real check is pasting into a Canvas page, saving, then
  **switching to rich text and saving again** — that second save is what breaks things.
- Probe files (`_probe*.html`) are gitignored; use them freely.

Two environment gotchas: **PowerShell truncates URLs at `#`** when passing them to a
native exe, so use a Bash shell for headless-Chrome calls with fragments; and
**PowerShell 5.1 mangles multi-line `git commit -m` here-strings containing angle
brackets** — write the message to a file and `git commit -F`.
