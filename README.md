# HB Creative – In-Housing landing page (HubSpot)

Static HTML/CSS/JS landing page, written in SASS + jQuery, built for import into HubSpot.

## Setup

```bash
npm install
npm run dev     # compiles SASS + copies JS/images, watches, serves at http://localhost:3000 with live reload
npm run build   # compressed CSS + assets/dist/hubspot.html
```

## Structure

```
index.html                  page markup (classes prefixed hb- to avoid HubSpot clashes)
assets/
  src/                      ← edit these
    scss/
      main.scss             entry point – imports everything below
      abstracts/            _variables.scss (colours, type, spacing, breakpoints), _mixins.scss (mq())
      base/                 reset + typography, scoped to .hb-lp
      layout/               container
      components/           buttons, HubSpot form styling
      sections/             one partial per page section
    js/main.js              jQuery – smooth scroll, sticky header, HubSpot form loader
    images/                 exported images/icons
  dist/                     ← generated, don't edit
    css/main.css
    js/main.js
    images/
    hubspot.html            single-file version with CSS + JS inlined
scripts/build.js            copies JS/images to dist and builds hubspot.html
```

To add a section: create `assets/src/scss/sections/_name.scss`, add `@use 'sections/name';` to `main.scss`, and add the markup to `index.html`.

## HubSpot form

Set the IDs on the form slot in `index.html` (HubSpot → Marketing → Forms → your form → Share → Embed code):

```html
<div class="hb-hsform" data-region="eu1" data-portal-id="1234567" data-form-id="xxxxxxxx-xxxx-...">
```

The form renders with HubSpot's default CSS turned off, so `components/_form.scss` controls all the styling.

## Getting it into HubSpot

After `npm run build`:

- **`assets/dist/hubspot.html`**: a single file with the CSS and JS inlined. In Design Manager, create an HTML template and paste it in. Keep HubSpot's required tags (`{{ standard_header_includes }}` in `<head>`, `{{ standard_footer_includes }}` before `</body>`).
- **Or link the files**: upload `assets/dist/css/main.css` and `assets/dist/js/main.js` to File Manager and point the `<link>`/`<script>` tags at those URLs.

Images: upload `assets/dist/images/` to HubSpot File Manager and swap the `assets/dist/images/...` paths for the File Manager URLs.
