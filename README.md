# HB – Your team. Our agency. (HubSpot landing page)

Static HTML/CSS/JS build of the Figma "Your Team. Our Agency." page, written in SASS + jQuery on top of the uk-hb.com theme, for import into HubSpot.

## Setup

```bash
npm install
npm run dev     # SASS + JS/images watch, served at http://localhost:3000 with live reload
npm run build   # compressed CSS + assets/dist/hubspot.html
```

## Structure

```
index.html                    the page
assets/
  src/                        ← edit these
    scss/
      main.scss               entry point
      _page.scss              shared imports + page helpers (use in partials: @use '../page' as *;)
      _fonts.scss             GT America / PP Pangaia @font-face
      theme/                  straight copy of the theme's utility/base/layout SCSS – don't edit, re-copy from the theme
      components/             type, pill buttons/chips, HubSpot form styling
      sections/               one partial per page section
    js/main.js                page behaviour (theme ScrollMagic scenes, accordions, jump menu, HubSpot loader…)
    js/vendor/                ScrollMagic + TweenMax (same files as the theme)
    img/  fonts/  media/
  dist/                       ← generated
    css/main.css  js/  img/  fonts/  media/
    hubspot.html              single file: CSS + page JS inlined
scripts/build.js
```

## What's reused from uk-hb.com

- Tokens, type mixins, breakpoints, `.btn`, `.section_header`, `.testimonial`, inline video, footer, fade-ins (copied into `scss/theme/`).
- The whole-page background switch: `.bgToggle` inside each `.lp-zone` toggles `body.jsBgToggle` while it passes the middle of the screen, exactly as on the site (black for The HB difference → Our work, and for Contact).
- Hero word animation (In-housing template), parallax images (Home template), sticky header and footer colour change.

## HubSpot form

The form slot in `index.html` is set to the live form (portal 149501769, EU region):

```html
<div class="hb-hsform" data-region="eu1" data-portal-id="149501769" data-form-id="784e67d8-c8c2-4173-8675-140c66cbf894">
```

`main.js` creates the form into that slot with HubSpot's CSS off; `components/_hubspot-form.scss` styles it. If the HubSpot script can't load, the static preview inside the slot stays visible.

## Getting it into HubSpot

1. `npm run build`.
2. Upload `assets/dist/img`, `fonts`, `media` and `js/vendor` to one File Manager folder.
3. Rebuild with that folder's URL so every asset path points there:
   `HUBSPOT_ASSET_BASE="https://…hubspotusercontent…/hubfs/…/hb-inhousing/" npm run build`
4. Paste `assets/dist/hubspot.html` into a Design Manager HTML template, adding `{{ standard_header_includes }}` in `<head>` and `{{ standard_footer_includes }}` before `</body>`.

## To do before launch

- Images are 1× captures from Figma: swap in the original exports (same filenames in `assets/src/img/`).
- Client logos: AlixPartners and HCA weren't exportable from Figma (they sit outside the frame) – add them to `img/logos/` and the list.
- Client logos for Microsoft Advertising, National Trust and Knight Frank (named in the content mockup) aren't in the Figma logo set yet.
- Check the GT America / PP Pangaia web licence covers the HubSpot domain.
- The HB difference images are TBC: replace `assets/src/img/difference-1.jpg` (tall, 428 × 590) and `difference-2.jpg` (square, 276 × 276) – placeholders for now.
