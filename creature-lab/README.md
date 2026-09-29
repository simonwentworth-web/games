# Creature Lab

Splice two animals. Discover a new species.

Pick any two of 62 animals (mammals, birds, reptiles and amphibians, ocean life and bugs), or
leave either on **Random**, or hit **Surprise me**. The lab splices them together, and the results
page shows:

- **An AI-generated portrait.** One animal gives the head, the other gives the body, and both
  animals' signature features always show (an eagle's wings, an elephant's trunk, a narwhal's
  tusk…). The prompt spells all of this out so the picture really looks like a mix of the two.
- **A species name.** Real hybrids keep their real names (Liger, Zorse, Mule, Wholphin, Geep…).
  Some pairs unlock **legendary creatures** drawn to match their myths: Lion + Eagle = Griffin,
  Horse + Narwhal = Unicorn, Lion + Scorpion = Manticore, Chicken + Python = Cockatrice, and more.
  Everything else gets a blended name (Elehark, Giratopus, Hedgetopus…).
- **Field notes**: size, speed and ferocity meters, habitat, diet, favourite snack, the noise it
  makes ("Roar-screech!") and two superpowers inherited from its parents (fun animal facts).
- **Three name ideas**, each with a short reason, based on its parents, habitat, size or
  personality. You can also type your own name.
- **Sharing** of the creature with the chosen name: the device's share sheet (with the picture
  where supported), WhatsApp, Facebook, X, Reddit, Pinterest, Telegram, text message on phones,
  email, copy link, and a downloadable 1080×1350 specimen card.

Each result lives in the URL (`?a=lion&b=eagle&seed=123&name=Talon`), so a shared link opens the
same creature, name ideas and portrait.

## Run it

It is a static site with no build step and no dependencies.

```bash
cd creature-lab
npm start            # http://localhost:8080
```

Any static web server works too (GitHub Pages, Netlify, `npx serve`…). Opening `index.html`
directly also works, but sharing needs a real web address.

## AI portraits

By default the browser requests images from [Pollinations](https://pollinations.ai), a free
image-generation service that needs no API key. A portrait usually takes 10–30 seconds.

For higher-fidelity portraits, run the included server with an OpenAI key:

```bash
OPENAI_API_KEY=sk-... npm start
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | none | Turns on server-side image generation |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1` | Any Images API model (`dall-e-3` also works) |
| `OPENAI_IMAGE_QUALITY` | `medium` | `low`, `medium` or `high` (gpt-image models) |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Point at any OpenAI-compatible images endpoint |
| `PORT` | `8080` | Port to listen on |

The server builds every prompt itself from the animal list (visitors can't send arbitrary
prompts), caches finished portraits in memory so shared links reuse them, and limits each
visitor to 10 new portraits a minute.

## Project layout

```
index.html          page markup (lab bench + results views)
css/styles.css      branding and layout
js/data.js          animals, habitats, temperaments, name pools, real & legendary hybrids
js/generator.js     splicing logic: names, anatomy, traits, pet names, image prompt
js/app.js           UI, URL routing, image loading, sharing, specimen card
server.js           optional zero-dependency server with OpenAI image support
assets/             logo, favicon, touch icon, social preview image
tests/              node:test suites for the generator and server
```

## Tests

```bash
npm test
```

The tests check the animal data, and splice every possible pair (with several seeds) to make sure
each one gets a tidy name, a complete description and prompt, and three unique pet names. They
also check that legendary creatures match their myths, and cover the server with a mock image API.

## Adding an animal

Add an entry to `ANIMALS` in `js/data.js`. The comment at the top of the file explains each field
(remember the first entry in `extras` is its signature feature), and `npm test` will flag anything
missing. New real or legendary pairings go in `KNOWN_HYBRIDS`.

## Deploying

When you host it, change the `og:image` tag in `index.html` to an absolute URL so link previews
on social networks show the branded card.
