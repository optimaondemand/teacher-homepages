# Handoff: Teacher Page Builders — UX ownership

You are taking over the four teacher-facing page builders in this repo to improve the
user experience. Everything below is what is *not* already in `README.md` or `CLAUDE.md`.

## What this is, in one paragraph

Optima teachers need branded Canvas pages (course home, homeroom Commons, lesson,
syllabus) but cannot be asked to hand-edit inline-styled HTML. Each builder is a single
self-contained HTML file: a teacher fills in a form, watches a live preview, and copies
the generated HTML into a Canvas page. There is no server, no account, no install. That
constraint is the product, not a limitation to engineer around.

## Getting set up

1. **Clone.** `git clone https://github.com/optimaondemand/teacher-homepages.git`
   You already have access — this is a **shared GitHub account**, not your own seat. See
   the warning below.
2. **Run it.** Open `index.html` in a browser. That is the whole dev loop. No `npm`, no
   local server. Live at https://optimaondemand.github.io/teacher-homepages/
3. **Deploy.** GitHub Pages serves `main` directly. A commit on `main` is live in ~60s.
   There is no staging environment and no review gate — **pushing is publishing.** Push
   via GitHub Desktop if the CLI auth balks.
4. **Point your Claude at the repo root.** `CLAUDE.md` there loads automatically and
   carries the eight rules that will otherwise bite you. Read `README.md` in full once —
   it is long but it is the only place the *reasoning* is written down.

### The shared-account warning

GitHub and Canvas here are **shared accounts**, so:

- **Every commit is attributed to the same identity.** `git log` cannot tell your work
  from anyone else's. Say who you are in the commit message when it is not obvious, and
  never `git add -A` — with a shared identity there is no way to untangle a commit that
  swept up someone else's in-progress files.
- **`git pull` before you start and before you push.** Someone else may have advanced
  `main` under the same name.
- **Canvas test pages land in the same courses everyone else sees.** Make your own test
  course or use a clearly-named scratch page; do not paste experiments into a page a
  teacher or student might open.

## Read first, in this order

| Read | Why |
|---|---|
| `CLAUDE.md` | The 8 things that break live teacher pages. 10 minutes. |
| `README.md` §"Every built page can be reopened in the builder" | The payload contract; constrains any change to state shape. |
| `README.md` §"The rich-text editor unwraps links that contain block elements" | The most expensive bug found so far, and how it was found. |
| `README.md` §"Bugs fixed after play-testing" | What real teachers actually got stuck on. |
| `git log --oneline` | Short, and the messages say why. `14fa21b` and `a10615d` are both deliberate *removals* — do not rebuild those. |

## The one thing to internalise

**There are two surfaces with opposite rules.** The builder UI is an ordinary modern web
page: use hover, transitions, flexbox, media queries, ARIA, whatever you like. The HTML
it *emits* gets pasted into Canvas, which strips `<style>` and `<script>` and runs it
through a rich-text editor that mangles more. Almost every constraint in `CLAUDE.md`
applies only to the emitted output. **UX work lives almost entirely on the unconstrained
side** — which is why this is a good handoff.

## Candidate UX work — verify before committing to any of it

These are observations from the code and the documented play-test history, not a
prioritised backlog. Confirm each against real teacher use before building.

- **`lesson.html` has a live pre-publish checklist; `index.html` and `syllabus.html` have
  none.** The pattern is proven and the asymmetry is unintentional. Probably the highest
  value-per-hour item here.
- **Form length with no navigation.** `index.html` is ~2,300 lines and its form column is
  one long scroll of ~96 labelled fields. There is no section jump, progress indicator, or
  sense of how much is left. The sticky preview column helps; the form column does not.
- **Mobile and narrow screens.** One breakpoint at 1100px, which stacks the columns. Below
  that the preview sits under a very long form, so a teacher on a laptop at 1280px is fine
  and a teacher on a tablet is probably not. Worth measuring what teachers actually use.
- **Accessibility is thin.** 18 `aria-*` attributes across 2,287 lines in `index.html`,
  fewer in the others. Keyboard reorder for list items, focus management after add/remove,
  and labelled landmarks are all unverified.
- **Error and warning tone.** Bad image links, unusable poll HTML, and wrong-shaped links
  are *named rather than silently dropped* — a deliberate and good decision. Whether the
  wording lands with a teacher who does not know what an `<a>` tag is has not been tested.
- **Known cosmetic defect, documented and accepted:** in Commons card rows, buttons do not
  bottom-align across a row when descriptions differ in length. The fix is a nested
  full-height table per cell. Low stakes, but it is real and visible.
- **Onboarding.** Each builder has a "load the example" button, which is the current
  answer to "what am I looking at." There is no first-run guidance beyond that.

## Do not do these without asking Jessica

- **Rename or move `houses/`, `index.html`, `lesson.html`, or `syllabus.html`.** Live
  pages and circulated bookmarks point at them. New files are fine; moves are not.
- **Bump a `localStorage` key.** It silently throws away drafts teachers are mid-way
  through.
- **Rebuild the per-subject/per-style personalization system** (11 subjects x 8 styles x 7
  accents, animated iframe-hosted pages). Built 2026-07-30, removed 2026-07-31 as more
  configuration than the job needed. Her call, explicitly. Recoverable via
  `git log -- home.html` if it is ever wanted back.
- **Re-add an ask-Claude step to `lesson.html`** (removed in `a10615d`), or make any
  teacher-facing feature depend on having a Claude account.
- **Add a build step, a dependency, or a server.** The zero-install property is load-bearing.

## Open questions inherited with the repo

- **Does the `OAO-BUILDER` comment survive a Canvas save-and-copy-back?** Unconfirmed. The
  downloaded `.html` file route works regardless. Matters before telling teachers they can
  copy a page *out of* Canvas to re-edit it.
- **Does the generated `.docx` open clean in real Microsoft Word?** Everything short of
  Word says the zip is valid (`python-docx` reads 39 paragraphs / 21 tables, placeholders
  highlighted). A sample is on Jessica's Desktop as
  `SAMPLE - Syllabus Builder output.docx`. Never verified in Word itself.
- **Two syllabus catalogue codes pass through unvalidated on purpose,** for a human to
  judge: `0708000A` (M/J Spanish Beginning) and `30260108` (HOPE Grade 8, not a
  Florida-shaped code).

## Who to ask about what

- **Anything about intent, scope, or "should we"** — Jessica.
- **Whether a change survives Canvas** — do not ask, test it: paste into a real Canvas
  page, save, switch to the rich-text editor, save again. That second save is what breaks
  pages, and it is how the block-element-in-link bug was found.
