# Indian Commoner redesign — build guide

Static HTML prototype for the redesign of https://indiancommoner.org/, in the
sage-green / gold "FES / Understanding Commons" design language.

## Files

- `assets/css/style.css` — the full shared stylesheet (forked verbatim from the
  reference file's `<style>` block, plus an "INDIAN COMMONER ADD" section at
  the end with new components: nav dropdown, `.topicrow`, `.postcard`,
  `.resrow`, `.peoplecard`/`.membercard`, `.statepill`). **Never duplicate
  CSS into a page — every page links this one file.**
- `assets/js/site.js` — mobile nav toggle, language dropdown, search toggle,
  `lucide.createIcons()`. Every page includes this at the end of `<body>`.
- `assets/img/` — photography reused from the FES reference kit (hero shots,
  the five "type" photos forest/pasture/water/coastal/cultural, chapter
  photos `ch-1..8.jpg`, card photos). Use these for atmosphere/hero/section
  backdrops. For content-specific images (real topic thumbnails, video
  posters, team photos) hotlink the actual `https://indiancommoner.org/...`
  URLs captured in `content-inventory.md` rather than inventing new ones.
- `content-inventory.md` — real content pulled from the live site (topics,
  resources, team, states, etc.). Use this as the literal copy source.

## Page head boilerplate (every page)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{Page title}} — Indian Commoner</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,300;1,400;1,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script src="https://unpkg.com/lucide@0.474.0/dist/umd/lucide.min.js"></script>
</head>
<body>
```

## Header (copy verbatim from `index.html`, set the right `active` link)

Copy the `<nav class="top">…</nav>` block from `index.html` exactly. The only
change per page: add `class="navlink active"` to the ONE link that matches
the current section (Forum / Resources / Activities / People), and remove
`active` from Forum. Every page lives at the site root, so all hrefs are
bare filenames like `forum.html` — no leading `/` or `../`.

## Footer (copy verbatim from `index.html`)

Copy the `<footer class="site light">…</footer>` block unchanged on every page
(it now includes the real CenSE + FES partner logos, hotlinked, and the
site's real social URLs — see `content-inventory.md` Section 15). Login page
is the one exception — no footer, full-height split layout, as in `login.html`.

## Content source of truth

`content-inventory.md` (project root) has the full real-content crawl of the
live site: exact topic titles/authors, all 8 forum theme names + descriptions
+ real photo URLs, 50+ real law titles, all 16 IC Team bios + photo URLs,
real video/podcast/literature lists with theme hashtags, workshop event
copy, and the real footer/nav structure. **Always pull from there — never
invent names, bios, stats, or titles.** Section numbers below match that
file.

Known content-quality issues to filter, per the inventory's own notes:
- Several "recent"/"member" names are spam/junk registrations — Section 12
  lists which handles are demonstrably real (anjali, Anil, Sujata, Indu,
  Ramesh Babu, Malavika, Lakshmi, Aditya, Charan.A, Ayush, Vishno, Yazhini).
  Prefer those for any member-list/avatar content.
- Some forum replies are spam (lottery bait, "custom patches in Yemen" ad).
  Section 3b names which reply is genuine (Wijay's) — use that one as the
  model for reply content, skip the rest.
- Newsfeed is a genuine empty state on the live site — design an empty
  state for `resources-newsfeed.html`, don't invent news items.

## Page structure pattern

Non-home pages use a `.pagehead` banner instead of the full-bleed `.ehero`:

```html
<main>
<div class="pagehead"><div class="in">
  <div>
    <span class="kicker">Resources</span>
    <h1>Videos</h1>
    <p>Short films on commoning practices from across the country.</p>
  </div>
</div></div>

<div class="crumbbar"><div class="mx"><div class="crumb">
  <a href="index.html"><i data-lucide="house"></i>Home</a><span class="sep">/</span>
  <span class="here">Videos</span>
</div></div></div>

<section class="section"><div class="mx">
  ... page content ...
</div></section>
</main>
```

## Component → content mapping

| Content type | Component classes | Notes |
|---|---|---|
| Forum topic listing (a theme, or "all topics") | `.topiclist > a.topicrow` (avatar `.pw-av`, `h3`, `.tr-meta`) | Reuse from `index.html` Recent Topics block. |
| Forum theme cards (grid) | `.typegrid > .tcard` (`.tc-photo`, `.tc-body`) | Set `--tc:` to a theme color; reuse `assets/img/type-*.jpg` for photos if no real theme image exists. |
| Single forum thread | `.postcard` (`.post-head`, `.post-body`, `.post-foot`), then `.reply-count` + `.cm-list > .cm-item` for replies | `.cm-item` already exists in the base stylesheet (comment thread pattern). |
| Video / podcast grid | `.grid.g3 > .card.vcard` (`.v-frame`, `.v-body`, `.v-meta`) | Base stylesheet component, used as-is. Podcasts: swap the play icon for `mic`. |
| Literature / Newsfeed / Laws listing | `.reslist > a.resrow` (`.ic-tile`, `.rr-tx`, `.rr-meta`) | New component. |
| IC Team / Forum Members grid | `.peoplegrid > .peoplecard` for team (bigger, named roles); `.membergrid > .membercard` for the member directory (denser) | New components. |
| Member / person profile | `.idcard` (base stylesheet — avatar, name, role, meta row) | |
| States list | `.stategrid > .statepill`, or the `.feature.dark` + `.namelist` tile (see index.html) | |
| Login | `.loginwrap > .lg-form / .lg-panel` (base stylesheet, full component set: `.lg-input`, `.lg-btn`, `.lg-chip`, `.lg-card`) | Use as-is, just restyle copy for Indian Commoner. |
| Workshops (events) | `.grid.g3 > .card` with a date `.tag`, or `.flow`/`.tl-row` timeline for a schedule | |
| Generic CTA banner | `.gateway` | |
| Icon buttons/badges | `.btn.btn-primary/.btn-outline/.btn-green`, `.tag`, `.badge` | |

## Rules for every page

1. Link only `assets/css/style.css` — do not inline `<style>` blocks except a
   trivial one-off tweak.
2. Use real content from `content-inventory.md` wherever it exists (topic
   titles, author names, team names/roles, state names, resource titles).
   Never invent people, quotes, or statistics that weren't in the inventory.
3. Use `data-lucide="…"` icon names + the shared `assets/js/site.js` script
   (which calls `lucide.createIcons()`), matching the reference file's icon
   approach.
4. Every internal link must point to an actual file in this project (see the
   file list in the top nav of `index.html`). If a target page doesn't exist
   yet, still write the correct filename per the sitemap below so links
   resolve once all pages land.
5. Test by opening `http://localhost:8743/<page>.html` (a static server is
   already running from the project root).

## Sitemap (filenames)

`index.html`, `forum.html`, `forum-theme.html` (example theme detail),
`topic.html` (example thread), `resources-videos.html`,
`resources-podcasts.html`, `resources-literature.html`,
`resources-newsfeed.html`, `resources-laws.html`,
`activities-videos-podcasts.html`, `activities-workshops.html`, `team.html`,
`members.html`, `member-profile.html` (example), `login.html`, `state.html`
(example state).
