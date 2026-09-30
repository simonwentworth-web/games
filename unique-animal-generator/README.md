# Unique Animal Generator

Mix two breeds and meet a one-of-a-kind friend.

Pick **Cat** or **Dog**, choose two parent breeds (or leave either on **Random**) and hit
**Generate**. The results page shows:

- **An AI-generated portrait** of the cross-breed, built from a detailed prompt that describes
  both parents' real features (ears, muzzle, build, coat, colours) so the picture looks like a
  plausible mix rather than a generic pet.
- **A breed name.** Real designer crosses keep their real names (Labradoodle, Pomsky, Himalayan…),
  and everything else gets a blended name (Beagolden, Shibapoo, Bendoll…).
- **An "About this breed" card** with size, energy, floof, coat and origins.
- **Three pet-name ideas** that fit the animal, based on its roots, coat colour, size,
  personality or looks, each with a short reason. You can also type your own name.
- **Sharing** of the new breed with the chosen name: the device's share sheet (including the
  picture, where supported), WhatsApp, Facebook, X, Reddit, Pinterest, Telegram, text message on
  phones, email, copy link, and a downloadable 1080×1350 share card.

Each result lives entirely in the URL (`?s=dog&a=labrador-retriever&b=poodle&seed=123&name=Biscuit`),
so a shared link opens the same breed, name ideas and portrait for whoever clicks it.

50 dog breeds and 30 cat breeds are included.

## Run it

It is a static site with no build step and no dependencies.

```bash
cd unique-animal-generator
npm start            # http://localhost:8080
```

Any static web server works as well (`npx serve`, `python3 -m http.server`, GitHub Pages,
Netlify…). You can even open `index.html` directly, but sharing needs a real web address.

## AI portraits

By default the browser requests images from [Pollinations](https://pollinations.ai), a free
image-generation service that needs no API key. A portrait usually takes 10–30 seconds, and
the same seed returns the same picture, which keeps shared links consistent.

For higher-fidelity portraits you can have the included server generate them with the OpenAI
Images API instead:

```bash
OPENAI_API_KEY=sk-... npm start
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | none | Turns on server-side image generation |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1` | Any Images API model (`dall-e-3` also works) |
| `OPENAI_IMAGE_QUALITY` | `medium` | `low`, `medium` or `high` (gpt-image models) |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Point at any OpenAI-compatible images endpoint |
| `VISITOR_FILE` | `data/visitors.json` | Where the server keeps the visitor count |
| `PORT` | `8080` | Port to listen on |

The page detects the server automatically through `/api/config`. The server builds every prompt
itself from the breed list (visitors can't send arbitrary prompts), caches finished portraits in
memory so shared links reuse them, and limits each visitor to 10 new portraits a minute.

## Visitor counter

The footer has an old-fashioned hit counter showing how many **unique visitors** the page has
had. Each browser is counted once: the first visit shows "You are visitor #1,234!", and later
visits say "Welcome back". The browser remembers its visitor number in localStorage. Crawlers and
link-preview bots aren't counted, and neither are local previews (`localhost` or opening the file
directly), so testing never skews the numbers.

- **On static hosting such as GitHub Pages**, counts are kept by
  [Abacus](https://abacus.jasoncameron.dev), a free counting service that needs no account. The
  counter is named after the site's address, so each deployment has its own count.
- **When served by `npm start`**, the server keeps the count itself in `data/visitors.json`
  (it stores only a scrambled hash of each browser's random ID; set `VISITOR_FILE` to move it).

A "unique visitor" is really a unique browser: someone who clears their browsing data or switches
devices is counted again, just like the classic counters it imitates.

## Project layout

```
index.html          page markup (builder + results views)
css/styles.css      branding and layout
js/data.js          breeds, colours, temperaments and name pools
js/generator.js     cross-breed logic: names, trait blending, pet names, image prompt
js/app.js           UI, URL routing, image loading, sharing, share card
js/visitor-counter.js  the footer's unique-visitor counter
server.js           optional zero-dependency server with OpenAI image support
visitors.js         unique-visitor store used by the server
assets/             logo, favicon, touch icon, social preview image
tests/              node:test suites for the generator and server
```

## Tests

```bash
npm test
```

The tests check the breed data, and run every possible pair of breeds (with several seeds) to
make sure each one gets a tidy name, three unique pet names and a complete prompt. They also
cover the server: static files, path traversal, caching, validation and rate limiting, using a
mock image API.

## Adding a breed

Add an entry to `DOGS` or `CATS` in `js/data.js`. The comment at the top of the file explains
each field, and `npm test` will flag anything missing. If the new cross has a real-world name,
add it to `KNOWN_CROSSES`.

## Deploying

When you host it, change the `og:image` tag in `index.html` to an absolute URL
(for example `https://you.github.io/games/unique-animal-generator/assets/og-image.png`) so link
previews on social networks show the branded card.
