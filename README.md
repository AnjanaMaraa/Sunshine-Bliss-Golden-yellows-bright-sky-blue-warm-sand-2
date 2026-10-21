# Raju & Aishu — Digital Wedding Invitation

A premium, romantic, interactive digital wedding invitation built with
**vanilla HTML5, CSS3 and JavaScript only** — no frameworks, no build step.

## Quick start

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Features

- **Cinematic entrance curtain** — silk curtain cover with bow, hanging tag
  and "Tap to Open". Click / tap / Enter / Space opens it with a ~2 s
  choreography (bow releases, tag lifts, curtains part, light flash). Page
  scrolling is locked while the cover is active.
- **Interactive scratch-to-reveal** — a gold-foil canvas card conceals the
  wedding date. Mouse, touch and pen supported (Pointer Events). The card
  auto-reveals once ~50 % is scratched (configurable), and a keyboard
  accessible **Reveal Invitation** button always works.
- **Hero** with large script typography, romantic message and replaceable image.
- **Countdown** — "Counting Down to Forever"; gracefully shows
  "Celebrating the Memories" for past dates (never negative values).
- **Program timeline** rendered from configuration, vertical on mobile and
  an elegant alternating layout on desktop.
- **Optional sections** (venue, dress code, pre-wedding events,
  transportation, accommodation) appear only when configured.
- **Gifts**, **RSVP** (validated, accessible, demo/local storage mode),
  **footer credit**, floating RSVP shortcut, back-to-top and optional music.
- Scroll-reveal animations, floating petals, subtle hero parallax — all
  respecting `prefers-reduced-motion`.

## Every editable detail lives in one file

```
js/invitation-data.js
```

| Key | Purpose |
| --- | --- |
| `couple.groom` / `couple.bride` | Names shown everywhere |
| `wedding.date` | ISO date (`2024-08-16`). Weekday is calculated, never hardcoded |
| `wedding.time` | Leave `""` to hide all time displays |
| `wedding.timezone` | Optional IANA zone, e.g. `"Asia/Kolkata"` |
| `hero.image` | Replace with the couple's photo (`assets/images/`) |
| `entrance.enabled` / `entrance.title` | Cover on/off and its label |
| `scratchReveal.threshold` | Fraction scratched before auto-reveal (0.45–0.60) |
| `events[]` | Timeline items — omit `date`/`time`/`description` to hide them |
| `venue` | `null` hides the section; set an object to show it |
| `dressCode[]`, `preWeddingEvents[]` | Rendered only when non-empty |
| `transportation`, `accommodation` | `null` hides; object shows |
| `gifts`, `rsvp`, `music` | Section toggles and message |
| `footer` | Thank-you line and developer credit |

## Replacing images

- **Hero image:** put your photo at `assets/images/hero-placeholder.jpg`
  (or point `hero.image` to any path). The current file is a free-licensed
  placeholder downloaded from Unsplash
  (<https://unsplash.com/photos/wKlC72n1f6Y> family — photo id
  `photo-1519741497674-611481863552`), replaceable with the couple's own
  photograph.
- **Scratch section florals:** `assets/images/floral-soft.jpg` (Unsplash
  `photo-1490750967868-88aa4486c946`) — optional decorative asset.
- Search this project for `REPLACE` to find every swap point (hero image,
  canonical URL, social image).

## Hindu wedding background plates

Five softly veiled (~12 % opacity, edge-faded) Hindu-wedding backdrops sit
behind section content as `.bg-plate` divs in `index.html`:

| File | Shown behind |
| --- | --- |
| `assets/images/hindu-jaimala.jpg` | Invitation introduction (jaimala / garland-exchange ritual) |
| `assets/images/hindu-diya.jpg` | Countdown (glowing diyas) |
| `assets/images/hindu-marigold.jpg` | Program timeline (marigold garlands) |
| `assets/images/hindu-rangoli.jpg` | Gifts (rangoli with diyas) |
| `assets/images/hindu-mehndi.jpg` | Footer (bridal mehndi) |

They are decorative (`aria-hidden`), never sit under text directly (cards and
heavy veiling keep contrast), and can be removed individually by deleting the
corresponding `<div class="bg-plate ...">` line — no other change needed.
Swap any of them for the couple's own photos by replacing the file in place.

### Image credits (free licenses)

Downloaded from Wikimedia Commons and used unmodified:

- *Indian Wedding Ritual — Jaimala or Varmala (01)* — © iMahesh, CC BY-SA 4.0
- *Diwali Oil Lamp Crop* — © Arne Hückelheim, CC BY-SA 3.0
- *Marigold Flowers as garland in India* — © SnapMeUp, CC BY 4.0
- *Rangoli and Divas* — © Ramesh Lalwani, CC BY-SA 4.0
- *Bridal Mehndi* — © Iramuthusamy, CC BY-SA 3.0

(CC BY / CC BY-SA allow use and modification with attribution; keep this
credit list if the images are retained.)

## RSVP — going live (important)

The RSVP form currently runs in **demo mode**: submissions are validated and
stored **locally in the guest's browser only** (localStorage). The success
message says so honestly — it never claims the couple received anything.

To deliver RSVPs for real, edit `submitRsvp()` in `js/rsvp.js` and POST the
payload to your backend / form service (an example `fetch` is included in the
comment). The UI logic does not need to change.

## Accessibility & performance

- Semantic landmarks, skip link, labelled controls, visible focus rings,
  `aria-live` status regions, keyboard-operable entrance and scratch reveal.
- `prefers-reduced-motion` disables choreography, petals and parallax.
- No-JS fallback: entrance overlay stays hidden, all content is readable.
- Deferred scripts, lazy-loaded below-the-fold images, `devicePixelRatio`-aware
  canvas, throttled progress checks, no external libraries.

## Project structure

```
/
├── index.html
├── css/
│   ├── style.css          # tokens + all component styles
│   ├── animations.css     # keyframes + scroll reveals
│   └── responsive.css     # breakpoints + print
├── js/
│   ├── invitation-data.js # ← all editable content lives here
│   ├── entrance.js        # curtain cover
│   ├── scratch.js         # scratch-to-reveal canvas
│   ├── countdown.js       # countdown / past-date fallback
│   ├── timeline.js        # program timeline renderer
│   ├── rsvp.js            # form validation + demo submission
│   └── main.js            # injection, reveals, optional sections, controls
├── assets/
│   ├── images/            # hero + decorative photos (replaceable)
│   ├── icons/             # sprig.svg ornament
│   └── audio/             # drop a file here to enable music
└── README.md
```

---

Website developed by [Digimaraa Technologies](https://digimaraa.com)
