# Study Quest

Eli's MYP2 home-learning app. **Complete a learning session → earn a token → trade it for
40 minutes of video gaming.** Every session is recorded with the evidence a parent needs:
active time, first-try score, hints used and how often focus wandered.

It is a plain static site: open `index.html`, serve the folder, or publish it as a claude.ai
artifact. When it runs as an artifact with the shared database, progress and tokens sync
across devices; otherwise everything is stored in the browser's localStorage.

## The token economy

- **Earn**: finish every question in a session, score at least the pass mark (default **70%**)
  on first tries, and clock at least the minimum active minutes (default **8**). The active-time
  clock pauses when the tab is hidden or the mouse/keyboard go quiet, so leaving it open
  earns nothing.
- **Spend**: one token starts a **40-minute** gaming countdown with a big ring timer and an
  alarm. The timer survives page reloads (and, in cloud mode, follows the family between
  devices). Every spend is logged.
- **Parent corner** (optional PIN): change the pass mark, minimum minutes, daily token cap and
  minutes-per-token; adjust tokens with a logged reason; end a gaming timer early (with or
  without refund); export CSVs. The PIN is a deterrent, not security — the Records page, which
  logs everything, is the real referee.

## How sessions teach

Each topic is one 15–20 minute session that **teaches first and tests as it goes**: short,
friendly learn cards interleaved with quick-check questions, a quiz to finish, immediate
feedback with an explanation for every answer, free hints (logged), and a "power-up round"
that re-asks anything missed. Scores count first tries only, so guessing twice doesn't pay.

## Curriculum coverage (MYP2 / KS3 Year 8, 2026–27)

| Subject | Topics (29 total, ~290 questions) |
| --- | --- |
| Mathematics | Number, fractions & percentages, algebra, graphs, geometry, statistics & probability |
| Science | Ecology & evolution, waves & sound, human health, the periodic table, space, electricity |
| English | Historical fiction & *The Ruby in the Smoke*, Shakespeare, persuasive writing (incl. Greta Thunberg), dystopia (*The Hunger Games*, *1984*), creative writing & poetry, SPaG |
| Spanish | Personal info & family, school, food, health & body, holidays & travel |
| Individuals & Societies | Rivers & flooding, exploration & the slave trade, environments & sustainability |
| Computing | Online safety & privacy, digital wellbeing & evaluating information, website design |

Every topic links out to reputable, pedagogically sound sources for going deeper: BBC Bitesize
KS3, Oak National Academy, Khan Academy, Corbettmaths, NRICH, NASA, the Royal Society of
Chemistry, the RSC Shakespeare Learning Zone, the Folger Shakespeare Library, the Poetry
Foundation, SpanishDict, Languages Online, Internet Geography, the International Slavery
Museum, The National Archives, Childnet and Google Interland.

## Records & verification

The Records page keeps the full audit trail: per-session date/time, subject and topic, active
vs total minutes, questions, first-try correct, accuracy, hints used, focus-outs, token
earned (with reasons when not), abandoned sessions, every token spent and every parent
adjustment — plus charts of learning minutes (last 14 days) and accuracy by subject, and CSV
export of the lot.

## Run it

```bash
cd study-quest
npm start            # http://localhost:8082
```

Any static web server works, or just open `index.html`.

## Tests

```bash
npm test             # node --test
```

Covers the whole question bank (ids, answers, options, hints, explanations, source links,
curriculum coverage) and the engine (forgiving answer checking, token rules, wallet, streaks,
charts data, CSV export).
