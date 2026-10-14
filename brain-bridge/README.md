# Brain Bridge

A fun, adaptive 11+ trainer for the **Bristol Grammar School (BGS)** and **Queen Elizabeth's
Hospital (QEH)** entrance exams and interviews. Built for one 40-minute session a week, with a
games token (worth 40 minutes of video games) earned for every full session.

It is a plain static site: open `index.html` or serve the folder. Progress lives in the browser's
localStorage, with export/import from the Parent corner.

## What it does

- **Weekly 40-minute sessions** that alternate between the two schools' styles. QEH weeks are
  timed multiple-choice blocks (English, comprehension, maths, non-verbal reasoning, verbal
  reasoning, problem solving) like the Atom Learning online test. BGS weeks use typed answers,
  problem solving and a creative-writing sprint like the written papers. Every session ends with
  an interview question.
- **Teaches first, tests later.** Each session starts in a learn phase: an unfamiliar topic
  opens with a short, friendly mini-lesson (steps, a worked example and a golden rule) before
  the first question. After about 22 minutes the session shifts into a challenge phase that
  tests and reinforces skills already practised. Every question has a hint and a "Learn it"
  button; hints are always allowed, but finishing with hints on under a third of questions
  adds 5 bonus minutes to the session's token (worth 45 minutes instead of 40).
- **Adapts to the student.** Every one of 55 skills has a mastery score (0-100). Questions are
  pitched at level 1, 2 or 3 from that score; three right in a row can trigger a stretch question
  and two misses bring a confidence-builder. Each session gives extra minutes to the weakest
  subject, and the skill picker favours weak and untried topics.
- **Tokens, XP, streaks and badges.** One token per completed 40-minute session (one per week by
  default; extra sessions earn bonus stars). Praise for right answers, a clear explanation and a
  tip for wrong ones.
- **Question formats** drawn from both exams: multiple choice, typed numbers and words, short
  written comprehension answers marked against keywords with a model answer, long writing with
  automatic feedback against the BGS criteria, and interview answers typed or spoken aloud.
- **Content**: 8 reading passages (fiction, non-fiction, a poem, a letter, a leaflet) with 69
  questions, 50 spelling/punctuation/grammar items, 120 graded vocabulary words, 34 hidden-word
  sentences, 42 odd-one-out sets, 38 analogies, 36 compound words, 60 missing-word items, 50
  hand-written puzzles, 20 writing prompts, 45 interview questions across six categories with
  four answer frameworks, and procedural generators for 37 skills (maths, verbal and non-verbal
  reasoning with SVG figures, timetables and charts), so the practice never runs out. Every
  one of the 45 quiz skills has its own mini-lesson in `js/lessons.js`.
- **Forgiving answer checking.** Typed answers accept natural variations: 26p, 26 pence or
  £0.26 for a 26p answer; 350p for £3.50; 45° or "45 degrees"; 28cm2 for 28 cm²; 16.30 or
  1630 for 16:30; "minus 28"; number words; and a number wrapped in words ("day 8").
- **Studios**: free practice by topic/level/format, a writing studio with timer, planning and
  history, and an interview studio with frameworks, a "say it out loud" mode with optional
  recording, rapid fire, and a "Why this school" answer builder.
- **Exam guide** for both schools: dates, paper-by-paper format, interview details, facts for the
  interview, and links to the official pages and the Atom familiarisation test.
- **Parent corner** (optional PIN): redeem tokens, mark writing with a rubric and a comment,
  change the schedule and token limit, export/import/reset progress.

## Run it

```bash
cd brain-bridge
npm start            # http://localhost:8081
```

Any static web server works (GitHub Pages, Netlify, `npx serve`), or just open `index.html`.

## Tests

```bash
npm test
```

The suites check the content banks for consistency (every passage question works in both exam
styles, hidden words really span two words, missing letters rebuild the full word...), generate
thousands of questions from every generator at every level in both formats, grade each one
against its own answer, and exercise the engine: mastery updates, session composition, grading,
writing and interview feedback, tokens, badges and storage.

## Project layout

```
index.html        page shell
css/styles.css    styling
js/data.js        schools, passages, banks, prompts, interview questions, badges
js/lessons.js     one mini-lesson per quiz skill (also the fallback hints)
js/generators.js  seeded procedural question generators + SVG figures
js/engine.js      mastery model, session composer, grading, feedback, tokens, badges
js/store.js       localStorage persistence, export/import
js/app.js         views: home, session player, practice, writing, interview, progress, guide, parent
assets/           logo, favicon, social image
tests/            node:test suites
server.js         zero-dependency static server
```

## Adding content

- **Passage**: add to `PASSAGES` in `js/data.js`. Each question needs four `options` with the
  right index in `answer`, plus a `typed` block with either `accept` (exact short answers) or
  `keywords` (groups of acceptable words; `need` is how many groups must match) and a `model`.
- **Puzzle / SPaG item / interview question / writing prompt**: append to the matching bank. The
  tests will flag anything missing.
- **New generator**: add a function in `js/generators.js`, register it in `GENERATORS`, and add a
  skill in `SKILLS` pointing at it. `npm test` generates 120 questions from it at each level.

## Sources for the exam details

Formats and dates are taken from the schools' admissions pages and the main 11+ guides as of
October 2026 (QEH: online adaptive multiple-choice test by Atom Learning, 9 and 16 January 2027,
interview with the Head and Head of Year; BGS: the school's own written papers in January, with
a creative-writing paper, comprehension, maths and problem solving, and an interview with a
member of staff). Schools change their arrangements, so confirm everything with them directly.
