# Indian Commoner (indiancommoner.org) — Content Inventory

Compiled by visiting the live WordPress/BuddyBoss/bbPress site at **https://indiancommoner.org/** for the sage-green/gold redesign. This is a read-only inventory: real headings, list items, names, dates, and body copy are captured verbatim wherever available, plus the literal `src` URLs of real content images so they can be hotlinked directly in the prototype rather than replaced with placeholders. No forms were submitted, nothing was logged into, and no content was changed on the live site.

---

## Site personality / current design system (baseline, pre-redesign)

- **Platform**: WordPress + Elementor page builder for marketing pages, **BuddyPress/BuddyBoss** for member profiles/directory, **bbPress** for the forum (topics/replies), all under one theme.
- **Colors** (computed from live CSS):
  - Primary teal: `rgb(1, 121, 111)` = `#01796F` — used for the sticky page-title bands ("FORUM THEMES", "VIDEOS", "LAWS & REGULATIONS", etc.), buttons ("GO TO FORUM", "VIEW MORE", "JOIN US", "SIGN IN"), forum table headers, footer background, podcast/literature/law cards.
  - Accent pink/magenta: `rgb(204, 51, 102)` = `#CC3366` — used for links, the active "English" language-switcher link, and highlighted keywords inside headings (e.g. the word "Downloads" in "Resources and **Downloads**", "all over the Country" in green-teal actually, "**Kerala**"-style emphasis words are teal not pink — see below).
  - White (`#FFFFFF`) background, near-black (`#000000`) body text, light-gray (`#F9F9F9` / `#F5F6F7`) alternating section backgrounds.
- **Fonts** (computed): body text = **Inter**; headings = **Outfit**.
- **Content patterns observed**:
  - Forum topic/reply listings always show a **circular avatar** (almost always the BuddyPress default gray "mystery-man" silhouette — very few members have uploaded real photos), a display name, and a relative date ("2 Months Ago", "3 Years, 6 Months Ago").
  - Topics carry a **category/sub-theme tag** (e.g. "Sacred Sites And Cultural Landscapes", "Valuation Of Commons") shown under the title, plus **state tags** (e.g. "ODISHA", "ANDHRA PRADESH") shown at the bottom of the topic page.
  - Tables (forum listings) use columns **Topic / Voices / Posts / Last Posted By** with a pinned-topic pushpin icon.
  - Resource cards (Videos/Podcasts/Literature/Laws) are consistently tagged with 1–3 `#Theme Name` hashtags linking back to the 8 forum themes — this cross-linking is a strong structural pattern worth preserving.
  - **Content-quality caveat for the redesign**: several forum threads contain visible **comment spam** unrelated to the topic (e.g. lottery-result bait, a "custom patches in Yemen" ad, generic "high quality of undergraduate and graduate" filler) mixed in with genuine posts. When pulling "real" thread content for the redesign, curate rather than pull every reply verbatim.
  - On several bbPress topic pages the **original post body did not render at all** — only reply posts appear in the "Posts" list (see Section 3). Pages with 0 replies show literally nothing but the title and a tag. This looks like a theme quirk on the live site, not deliberate empty content.
  - Difficulty-level filter tabs ("Beginner / Intermediate / Advanced") appear identically on Videos, Podcasts, and Literature listing pages.

---

## 1. Homepage — https://indiancommoner.org/

**Nav bar** (see Section 15 for full structure) sits above a language switcher (English / Hindi / Kannada / Telugu, English active in pink).

### Hero — "The Promise of the Commons"
Black full-width band with centered white heading **"The Promise of the Commons"**, followed by a 3-row × 6-column grid of grayscale portrait photos of historical/thought-leader figures associated with "the commons." Each image is a CSS background-image (not an `<img>`), with alt text drawn from the widget caption. Full literal list (name, dates, description) as shown:

1. Anil Kumar Agarwal, 1947-2002, Environmentalist
2. Anupam Mishra, 1948-2016, Gandhian, Author, Journalist, Environmentalist, and Water Conservationist
3. Wangari Mathai, 1940-2011, Social, Environmental and Political Activist and the first African woman to win the Nobel Peace Prize
4. Chinua Achebe, 1930-2013, Novelist, Poet, and Critic
5. E.F.Schumacher, 1911-1977, Statistician and Economist
6. Elinor Ostrom, 1933-2012, Political Economist and Nobel Prize winner.
7. Garrett James Hardin, 1915-2003, Ecologist coined the phrase Tragedy of Commons.
8. Guru das Agrawal, 1932-2018, Environmentalist, Engineer, Religious leader, Monk, Environmental Activist and Professor
9. J.C. Kumarappa, 1892-1960, Indian Economist and a close associate of Mahatma Gandhi
10. Madeleine Slade or Mirabehn, 1892-1982, Supporter of the Indian Independence Movement (site text has a typo: "Bupporter")
11. Mahasweta Devi, 1926-2016, Writer and Activist
12. Mohandas Karamchand Gandhi, 1869-1948, Indian Lawyer, Anti-colonial Nationalist and Political Ethicist
13. Munshi Premchand, 1880-1936, Indian Writer famous for his modern Hindustani literature
14. NS Jodha, 1937-2020, Agricultural Economist influential writer on Commons
15. Pytor Kropotikin (sic — "Peter Kropotkin" in the filename), 1842-1921, Russian Anarchist, Socialist, Revolutionary, Economist, Sociologist, Historian, Zoologist, Political Scientist, Human Geographer and Philosopher
16. Rachel Carson, 1907-1964, Marine Biologist, Author, and Conservationist
17. Sundar lal Bahuguna, 1927-2021, Indian Environmentalist and Chipko movement leader
18. Vinoba Bhave, 1895-1982, advocate of non-violence and human rights

**Images** (portrait grid, CSS background-image, in DOM order):
- `https://indiancommoner.org/wp-content/uploads/2022/12/Anil-Kumar-Agarwal-1.jpg` — Anil Kumar Agarwal
- `https://indiancommoner.org/wp-content/uploads/2022/12/Anupam-Mishra.jpg` — Anupam Mishra
- `https://indiancommoner.org/wp-content/uploads/2022/12/Wangari-maathai.jpg` — Wangari Maathai
- `https://indiancommoner.org/wp-content/uploads/2022/12/Chinua-Achebe.jpg` — Chinua Achebe
- `https://indiancommoner.org/wp-content/uploads/2022/12/E.F.Schumacher.jpg` — E.F. Schumacher
- `https://indiancommoner.org/wp-content/uploads/2022/12/Elinor-Ostrom.jpg` — Elinor Ostrom
- `https://indiancommoner.org/wp-content/uploads/2022/12/Garett-Hardin1.jpg` — Garrett Hardin
- `https://indiancommoner.org/wp-content/uploads/2022/12/gurudas-agarwal.jpg` — Guru das Agrawal
- `https://indiancommoner.org/wp-content/uploads/2022/12/J.C-Kumarappa.jpg` — J.C. Kumarappa
- `https://indiancommoner.org/wp-content/uploads/2022/12/Madeliene-slade.jpg` — Madeleine Slade
- `https://indiancommoner.org/wp-content/uploads/2022/12/Mahasweta-devi.jpg` — Mahasweta Devi
- `https://indiancommoner.org/wp-content/uploads/2022/12/Mohandas-Karamchand-gandhi.jpg` — M.K. Gandhi
- `https://indiancommoner.org/wp-content/uploads/2022/12/munshi-premchand.jpg` — Munshi Premchand
- `https://indiancommoner.org/wp-content/uploads/2022/12/NS-Jodha.jpg` — N.S. Jodha
- `https://indiancommoner.org/wp-content/uploads/2022/12/Peter-Kropotkin.jpg` — Peter Kropotkin
- `https://indiancommoner.org/wp-content/uploads/2022/12/Rachel-Carson.jpg` — Rachel Carson
- `https://indiancommoner.org/wp-content/uploads/2022/12/Sundar-lal-Bahuguna.jpg` — Sundar Lal Bahuguna
- `https://indiancommoner.org/wp-content/uploads/2022/12/Vinoba-Bhave.jpg` — Vinoba Bhave
- `https://indiancommoner.org/wp-content/uploads/2022/12/img2-3.jpg`, `.../img4-3.jpg`, `.../img3-1.jpg` — three additional generic/scenic background images used elsewhere in the same hero widget group.

Site logo (used on every page, top-left): `https://indiancommoner.org/wp-content/uploads/2022/12/Artboard-1@2x-1.png`

### "Security, Sustainability, Sovereignty" strip + image carousel
An auto-rotating image carousel (5 slides) sits just under the hero, followed by a heading **"Security, Sustainability, Sovereignty"** and an intro paragraph beginning "Indian Commoner is a forum to which individuals and organisations interested in the current state of…" (truncated on the page as displayed; not fully readable without further scroll/expansion).

**Carousel images**:
- `https://indiancommoner.org/wp-content/uploads/2022/12/01-2.jpg`
- `https://indiancommoner.org/wp-content/uploads/2022/12/02-2.jpg`
- `https://indiancommoner.org/wp-content/uploads/2022/12/03-1.jpg`
- `https://indiancommoner.org/wp-content/uploads/2022/12/04-2.jpg`
- `https://indiancommoner.org/wp-content/uploads/2022/12/05-1.jpg`

### "Recent Topics"
Teal-headed two-column table, header row **"Topics" / "Posted By"**. Real rows (title — author, each author name links to `/members/<slug>/`):

| Topic | Posted By |
|---|---|
| Cultural traditions linked with Sustainable harvesting principles among Santhals | anjali (`/members/anjali1989/`) |
| Customary Tenure and land management of the Khasi people in Meghalaya | anjali (`/members/anjali1989/`) |
| Low-cost Revegetation | Anil (`/members/anilsarsavan/`) |
| Boost Your Immunity: Fruits for Breakfast to Eat and Avoid on an Empty Stomach | HiiMS Hospital (`/members/hiimshospitalindia/`) |
| The Golden Horizon of Bahardanri | Sujata (`/members/sujata18/`) |

Each row shows a small gray default avatar next to the author name. Button below: **"GO TO FORUM"** → `https://indiancommoner.org/topics/`.

Note: two of the five "recent" topics (HiiMS Hospital's health post, and possibly others) look like off-topic/spam registrations — another sign that "recent activity" content needs curation for the redesign, not verbatim reuse.

### "WHAT ARE COMMONS" / "WHO IS A COMMONER" / "PURPOSE OF THE 'INDIAN COMMONER'"
Three-column section, each with a full-bleed photo background, heading, one paragraph, and a "Read More" link:
- **WHAT ARE COMMONS** — "We live in a world today where it has become intuitive to think of property as something owned and controlled by individuals, corporate bodies and governments." → Read More → `https://indiancommoner.org/what-are-commons/`
- **WHO IS A COMMONER** — "While the significance and impact of common property institutions is most prominent amongst communities living in rural areas" → Read More → `https://indiancommoner.org/who-is-common/`
- **PURPOSE OF THE 'INDIAN COMMONER'** — "This forum on the commons seeks to encourage conversations around the way human societies and communities can control" → Read More → `https://indiancommoner.org/purpose-of-the-indian-commoner/`

### "Resources and Downloads"
Heading **"Resources and **Downloads**"** (second word in teal/emphasis), subtext "To know more about Commons, do visit the curated resource section.", button **"VIEW MORE"** → `https://indiancommoner.org/videopost/`. Three video cards shown (YouTube-embed style cards — title, source/channel name, theme hashtag links):

1. **Safeguarding the Global Commons** — channel: Global Environment Facility — tags: `#Conversion of Commons` (`/conversions-of-commons/`), `#Commons as Microhabitats` (`/commons-as-micro-habitats/`)
2. **Reclaiming the Credit Commons** — channel: Thomas H Greco Jr — subtitle on thumbnail: "The Key to Sustainability, Relocalization, and a Dignified Life for All" — tag: `#Livelihoods, Subsistence and Valuation of Commons` (`/livelihood-security/`)
3. **Knowledge Forum with Prof Elinor Ostrom** — channel: ICIMOD — caption on thumbnail: "Elinor Ostrom: 2009 Nobel Laureate in Economic Sciences" — tag: `#Governing the Commons` (`/governing-the-commons/`)

### "Meet Commoners all over the Country"
Heading **"Meet Commoners **all over the Country**"**, subtext "Click on your state to see the discussions and participate in the conversations on commons in India!", button **"JOIN US"** → `https://indiancommoner.org/register/`.

Below it is **not a geographic map** — it is a **WordPress tag-cloud widget**: state names rendered as plain text links, font-size scaled by number of tagged forum topics (bigger text = more topics). Each state links to a bbPress topic-tag archive. Full literal list with item counts and URLs:

| State | Item count | URL |
|---|---|---|
| Andhra Pradesh | 22 items | `https://indiancommoner.org/forums/topic-tag/andhra-pradesh/` |
| Arunachal Pradesh | 1 item | `https://indiancommoner.org/forums/topic-tag/arunachal-pradesh/` |
| Assam | 1 item | `https://indiancommoner.org/forums/topic-tag/assam/` |
| Chhattisgarh | 1 item | `https://indiancommoner.org/forums/topic-tag/chhattisgarh/` |
| Gujarat | 2 items | `https://indiancommoner.org/forums/topic-tag/gujarat/` |
| Jharkhand | 11 items | `https://indiancommoner.org/forums/topic-tag/jharkhand/` |
| Karnataka | 11 items | `https://indiancommoner.org/forums/topic-tag/karnataka/` |
| Kerala | 2 items | `https://indiancommoner.org/forums/topic-tag/kerala/` |
| Madhya Pradesh | 3 items | `https://indiancommoner.org/forums/topic-tag/madhya-pradesh/` |
| Maharashtra | 4 items | `https://indiancommoner.org/forums/topic-tag/maharashtra/` |
| Meghalaya | 1 item | `https://indiancommoner.org/forums/topic-tag/meghalaya/` |
| Nagaland | 1 item | `https://indiancommoner.org/forums/topic-tag/nagaland/` |
| Odisha | 2 items | `https://indiancommoner.org/forums/topic-tag/odisha/` |
| Punjab | 2 items | `https://indiancommoner.org/forums/topic-tag/punjab/` |
| Rajasthan | 7 items | `https://indiancommoner.org/forums/topic-tag/rajasthan/` |
| Uttarakhand | 1 item | `https://indiancommoner.org/forums/topic-tag/uttarakhand/` |
| Uttar Pradesh | 1 item | `https://indiancommoner.org/forums/topic-tag/uttar-pradesh/` |

(This directly answers Section 14 — see below.)

---

## 2. Forum Themes — https://indiancommoner.org/forum-themes/

Teal page-title band: **"FORUM THEMES"**. Below it, a 2-column × 4-row grid of full-bleed photo cards, dark gradient overlay at the bottom, uppercase white title over the photo, one intro sentence under each (visible on page as truncated one-liners), and a "Read More" link. Full literal list:

1. **CONVERSION OF COMMONS** — "Conversion of commons involves two distinct kinds of processes- One is a conversion in the status of the resource from being held in." → `https://indiancommoner.org/conversions-of-commons/`
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/Conversion-of-Commons-card-picture-1.jpg`
2. **COMMONS AS CULTURE** — "Cultural artefacts, craft traditions and aesthetic practices are properties that have historically been held in common across" → `https://indiancommoner.org/commons-as-culture/`
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/Commons-as-culture-card-picture.jpg`
3. **COMMONS AS MICRO HABITATS** — "Commons frequently constitute specific small-scale refugia and support survival of certain biota. Common pool resources contribute." → `https://indiancommoner.org/commons-as-micro-habitats/`
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/Micro-habitat-flipcard.jpg`
4. **GOVERNING THE COMMONS** — "Governing the commons necessitate pluralistic approaches, not restricted to legal conventions.Customs are interfaces between law and practice." → `https://indiancommoner.org/governing-the-commons/`
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/Governing-the-commons-flipcard.jpg`
5. **LIVELIHOODS, SUBSISTENCE AND VALUATION OF COMMONS** — "One of the major hurdles in understanding commons has been translating the usefulness of commons into economic value." → `https://indiancommoner.org/livelihood-security/`
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/Livelihoods_flipcard.jpg`
6. **GENDER AND COMMONS** — "One of the important aspects of commons is the different ways in which groups of people interact with resources and with each other." → `https://indiancommoner.org/gender-and-commons/`
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/Gender-and-commons-flipcard.jpg`
7. **POWER AND COMMONS** — "The collective and communal nature of common pool resources mark them out as distinct from resources that may be owned privately." → `https://indiancommoner.org/power-and-commons/`
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/Power-and-commons-flipcard.jpg`
8. **OTHERS** — "Discussions and ideas that don't fit into any of the sub-thematic areas in the forum, could be added here." → `https://indiancommoner.org/forums/forum/others/` (this one links straight into a bbPress forum listing, not another Elementor detail page)
   - Image: `https://indiancommoner.org/wp-content/uploads/2023/03/Others-scaled.jpg`

### Theme detail page example — "Conversion of Commons" (https://indiancommoner.org/conversions-of-commons/)
Teal title band "CONVERSION OF COMMONS", full paragraph body copy:

> "Conversion of commons involves two distinct kinds of processes- One is a conversion in the status of the resource from being held in common to being transformed into privately held or state-controlled resources. Second is the change in the nature of the utilization or use for which the resource is employed. These processes of change, invariably have consequences for resource users in terms of access as well as the institutional context in which they function. These processes can have a critical impact on livelihoods and well-being of the primary users. Evidences also suggest that in cases where state-held or privately held resources have been successfully converted to common tenures with adequate institutional safeguards, these have favorably impacted community livelihoods and resource status."

Then a light-gray **"Sub Thematic Areas"** band with photo tiles:
- Infrastructural Projects — `https://indiancommoner.org/wp-content/uploads/2022/12/Infrastructural-Projects.jpg`
- Mining — `https://indiancommoner.org/wp-content/uploads/2022/12/Mining.jpg`
- Industrial and Domestic Waste — `https://indiancommoner.org/wp-content/uploads/2022/12/Industrial-and-Domestic-Waste.jpg`
- Encroachment and Land Redistribution — `https://indiancommoner.org/wp-content/uploads/2022/12/Land-encroachment.jpg`
- Water Resources — `https://indiancommoner.org/wp-content/uploads/2022/12/water-resources.jpg`
- Conservation Projects — `https://indiancommoner.org/wp-content/uploads/2022/12/conservation-projects.jpg`

Then cross-linked resource rails, each item tagged with theme hashtags:
- **Videos**: "Safeguarding the Global Commons" (`#Conversion of Commons` `#Commons as Microhabitats`); "LSE Events | Plunder of the Commons: a manifesto for sharing public wealth" (`#Power and Commons` `#Conversion of Commons` `#Commons as Culture`); "Andrew Wardell – Who owns the rights to the World's Common Resources?" (`#Governing the Commons` `#Conversion of Commons`) — "VIEW ALL" button
- **Podcasts**: "David Bollier: Week 6: Land as a Commons/Water as a Commons"; "David Bollier: Week 5: The Dynamics of Modern Enclosure/Governing the Commons"; "David Bollier: Week 4: The History of Commons and Enclosure" — "VIEW ALL" button
- **Literatures**: "The Commons and Development: Unanswered Sociological Questions"; "Land Use, Environmental Change, and Sustainable Development: The Role of Institutional Diagnostics"; "Livestock and Commons" — "VIEW ALL" button

### Theme → forum-listing page example — "Others" (https://indiancommoner.org/forums/forum/others/)
This is a genuine bbPress forum topic listing, structurally different from the Elementor "theme detail" page above — proves that "Others" (and presumably each theme, one level deeper) ultimately resolves to a real bbPress sub-forum. Content:

- Left accent bar heading **"Others"**, sub-label "0 Topics" (site-wide topic counter widget, not accurate to what's shown below it)
- Teal table header: **Topic | Voices | Posts | Last Posted By**
- One real topic row (pinned, pushpin icon): **"Andhra Pradesh-Culture And Commons: Great Backyard Bird Count (GBBC)"**, author **Indu**, category tag **"Sacred Sites And Cultural Landscapes"**, Voices: 5, Posts: 5, Last Posted By: **Noah**, "2 Months Ago" (default gray avatar)
- Footer notice: "You must be logged in to create new topics."

---

## 3. Individual forum topic/thread pages

### 3a. https://indiancommoner.org/forums/topic/cultural-traditions-linked-with-sustainable-harvesting-principles-among-santhals/
(This is the topic assigned by the brief.) Left teal accent bar, heading **"Cultural traditions linked with Sustainable harvesting principles among Santhals"**. Meta line: "This Topic Contains 1 Voice And Has 0 Replies." with icon counts "1 Voice" / "0 Replies". A **"Topic tags"** row with one pill: **ODISHA**. Footer notice: "You must be logged in to reply to this topic." No author byline, no date, and **no post body text renders at all** on this stub thread — this is a real structural limitation of the live theme for zero-reply topics, not a scraping gap (confirmed via screenshot: page goes straight from title/meta to the footer). No images on this page. This is a genuine, but very sparse, content example.

### 3b. Richer example with replies — https://indiancommoner.org/forums/topic/andhra-pradesh-culture-and-commons-great-backyard-bird-count-gbbc/
Included as a supplementary example because the assigned topic (3a) has no visible body/reply content. This thread ("Andhra Pradesh-Culture and Commons: Great Backyard Bird Count (GBBC)", originally started by **Indu**, tag **Sacred Sites And Cultural Landscapes**) shows how a populated thread renders:

- Heading, meta line "Last Updated By Noah 2 Months Ago", "5 Voices", "4 Replies"
- Table header **Author | Posts**
- Reply 1 — **Kimaya**, March 18, 2024 at 7:06 am: "Interested post. Just wanted to ask if you've had a chance to check out today's updated Dhankesari results? It's always exciting to see if luck is on our side! 😊" "Today Result" *(off-topic spam)*
- Reply 2 — **Rahul Gandhi**, November 5, 2024 at 10:07 am: "High quality of undergraduate and graduate" *(spam/garbage)*
- Reply 3 — **Wijay**, December 25, 2024 at 1:32 am: "The author shares their experience participating in the Great Backyard Bird Count (GBBC) through an internship at the Foundation of Ecological Security (FES), highlighting the connection between birds and the health of commons. They reflect on how rural Andhra Pradesh's cultural landscape helps preserve bird species, emphasizing the need to protect both birds and the ecosystems they inhabit." *(genuine, on-topic — the best real "post body" example found on the whole site)*
- Reply 4 — **Noah**, July 15, 2026 at 1:04 pm: "Greetings from Gulf Patches Company, your one-stop shop for custom made patches in Yemen in any shape, color, or design. We specialize in creating custom woven, PVC, embroidered, and chenille patches. Ideal for your business, events, or brand. Make a purchase right now." with a "THIS REPLY WAS MODIFIED 2 MONTHS AGO BY NOAH." note *(spam)*
- Topic tags: **ANDHRA PRADESH**
- Footer: "You must be logged in to reply to this topic."

**Recommendation for the redesign**: use the Wijay reply above (Reply 3) as the realistic model for a forum post body's length/tone; do not reuse the spam replies verbatim as UI filler.

---

## 4. Resources > Videos — https://indiancommoner.org/videopost/

Teal band **"VIDEOS"**. Three filter buttons (teal pills): **Beginner / Intermediate / Advanced** → `/videopost/beginner/`, `/videopost/intermediate/`, `/videopost/advanced/`. Below, a 2-column grid of video cards: each is a YouTube embed with a title bar (channel logo, video title, channel name) overlaid on the thumbnail, a red play button, and 1–3 `#ThemeName` hashtag links under the card. Pagination: **Page 1 2 3 4** (36 videos total across the whole listing).

Page-1 videos, with title, tags, and the real YouTube thumbnail (`https://img.youtube.com/vi/<id>/hqdefault.jpg`, constructed from the embedded YouTube ID — the page itself lazy-loads embeds rather than serving a local thumbnail file):

1. **Safeguarding the Global Commons** — channel: Global Environment Facility — tags: `#Conversion of Commons`, `#Commons as Microhabitats` — YouTube ID `XDSs1PeAaRc` → thumbnail `https://img.youtube.com/vi/XDSs1PeAaRc/hqdefault.jpg`
2. **Reclaiming the Credit Commons** — channel: Thomas H Greco Jr — tag: `#Livelihoods, Subsistence and Valuation of Commons` — YouTube ID `k8EyOxAw75I` → `https://img.youtube.com/vi/k8EyOxAw75I/hqdefault.jpg`
3. **Knowledge Forum with Prof Elinor Ostrom** — channel: ICIMOD — tag: `#Governing the Commons` — YouTube ID `KQxA16vwi48` → `https://img.youtube.com/vi/KQxA16vwi48/hqdefault.jpg`
4. **Community Management of Common Property Resources** — tags: `#Governing the Commons`, `#Livelihoods, Subsistence and Valuation of Commons`, `#Commons as Culture` — YouTube ID `lh6LSiGK9Wc` → `https://img.youtube.com/vi/lh6LSiGK9Wc/hqdefault.jpg`
5. **LSE Events | Plunder of the Commons: a manifesto for sharing public wealth** — tags: `#Power and Commons`, `#Conversion of Commons`, `#Commons as Culture` — YouTube ID `JQztIHee_tQ` → `https://img.youtube.com/vi/JQztIHee_tQ/hqdefault.jpg`
6. **Andreas Weber: "Life, Meaning and Spirituality in the Commons: Towards a Cultural Paradigm Shift"** — tags: `#Commons as Microhabitats`, `#Commons as Culture` — YouTube ID `fqI0qKFWugo` → `https://img.youtube.com/vi/fqI0qKFWugo/hqdefault.jpg`
7. **Andrew Wardell – Who owns the rights to the World's Common Resources?** — tags: `#Governing the Commons`, `#Conversion of Commons` — YouTube ID `A-Xh0Hy7dTY` → `https://img.youtube.com/vi/A-Xh0Hy7dTY/hqdefault.jpg`
8. **Module 28 – Governing Forests as Common Property – Part C** — tags: `#Governing the Commons`, `#Livelihoods, Subsistence and Valuation of Commons` — YouTube ID `X_VxX4Nsf8U` → `https://img.youtube.com/vi/X_VxX4Nsf8U/hqdefault.jpg`
9. **Module 28 – Governing Forests as Common Property – Part B** — tag: `#Governing the Commons` — YouTube ID `upBCmMyaq64` → `https://img.youtube.com/vi/upBCmMyaq64/hqdefault.jpg`

(Pages 2–4 not individually crawled; same card pattern repeats.)

---

## 5. Resources > Podcasts — https://indiancommoner.org/podcast/

Teal band **"PODCASTS"**, same Beginner/Intermediate/Advanced filter pills. Cards here are **solid teal blocks with no thumbnail image** (podcasts link straight out to external platforms — confirmed one card links to `https://www.incommonpodcast.org/podcast/commoning-6-the-urban-commons/`). Layout: 2-column grid, title + hashtag tags in white text on teal. Full list on page 1:

1. **Commoning #6: The Urban Commons** — tags: `#Commons as microhabitats`, `#Power and commons`, `#Livelihoods, Subsistence, and valuation of commons` — links to `incommonpodcast.org`
2. **Commoning #8: Water Commons with Ruth Meinzen Dick, Tomás Olivier, and Edella Schlager** — tag: `#Governing the commons`
3. **The Commons: Reclaiming Our Humanity – with David Bollier** — tags: `#Governing the commons`, `#Livelihoods, Subsistence, and valuation of commons`
4. **Common Tragedy** — tags: `#Governing the commons`, `#Commons as culture`
5. **Episode 113: Interview with Jagdeesh Rao, Curator – Promise of Commons initiative, and former CEO FES** — tag: `#Livelihoods, Subsistence, and valuation of commons` *(directly ties back to the IC Team / FES people — see Section 11)*
6. **David Bollier: Week 6: Land as a Commons/Water as a Commons** — tags: `#Governning the commons` (site typo), `#Conversion of commons`, `#Livelihoods, Subsistence, and valuation of commons`, `#Power and commons`
7. **David Bollier: Week 5: The Dynamics of Modern Enclosure/Governing the Commons** — tags: `#Governning the commons`, `#Conversion of commons`, `#Livelihoods, Subsistence, and valuation of commons`
8. **David Bollier: Week 4: The History of Commons and Enclosure** — tags: `#Conversion of commons`, `#Gender and commons`, `#Commons as a culture`
9. **David Bollier: Week 3: Property & Commons, and The Gift Economy** — tag: `#Livelihoods, Subsistence, and valuation of commons`

No pagination indicator seen on the visible viewport (list may continue below fold).

---

## 6. Resources > Literature — https://indiancommoner.org/literatures/

Teal band **"LITERATURE"**, same filter pills. Same solid-teal card style as Podcasts (no thumbnails; cards link to external journals, e.g. `https://www.thecommonsjournal.org/articles/10.18352/ijc.248/`). Pagination: **Page 1 2 3 4 5 6 7** (large collection). Page-1 items:

1. **The Commons and Development: Unanswered Sociological Questions** — tags: `#Governing the Commons`, `#Conversion of Commons`
2. **States, Social Capital and Cooperation: Looking Back on 'Governing the Commons'** — tags: `#Power and Commons`, `#Governing the Commons`
3. **Design Principles For Global Commons: Natural Resources and Emerging Technologies** — tag: `#Governing the Commons`
4. **Information, Networks, and The Complexity of Trust in Commons Governance** — tag: `#Governing the Commons`
5. **Diversity of Resource Use and Property Rights in Tam Giang Lagoon, Vietnam** — tags: `#Livelihoods, Subsistence and Valuation of Commons`, `#Governing the Commons`
6. **Land Use, Environmental Change, and Sustainable Development: The Role of Institutional Diagnostics** — tags: `#Governing the Commons`, `#Conversion of Commons`
7. **Curse or Blessing? Local Elites in Joint Forest Management in India's Shiwaliks** — tags: `#Governing the Commons`, `#Power and Commons`
8. **Change in Forest Governance in Developing Countries – in Search of Sustainable Governance Arrangements** — tag: `#Governing the Commons`
9. **"Hybrid Institutions": Applications of Common Property Theory Beyond Discrete Tenure Regimes** — tag: `#Governing the Commons`

---

## 7. Resources > Newsfeed — https://indiancommoner.org/newsfeed/

Teal band **"NEWSFEED"**. **This page has no listed items at all** — it is effectively an empty state with only an intro paragraph:

> "This is a collated list of news reports and articles on commons from different sources like local and regional newspapers, magazines, news websites. Forum members are invited to send links which are relevant and can be uploaded here."

No cards, no images, nothing else on the page (confirmed via screenshot — the page is blank white below the intro line down to the footer). For the redesign this is a genuine **empty-state pattern** to design for, not a content gap in this inventory.

---

## 8. Resources > Laws and Regulations — https://indiancommoner.org/laws

Teal band **"LAWS & REGULATIONS"**. Left sidebar with three collapsible filter accordions: **Region**, **Subject**, **Type** (all closed by default, chevron toggles). Right side: 3-column grid of solid-teal cards, one law/policy title per card, no images, no tags visible on these particular cards. This is by far the largest literal content list captured — over 50 real Indian law/policy/rule titles were visible without pagination controls appearing in view (likely virtual-scrolled or a single long list). Full literal list as captured:

- Tamil Nadu State Water Policy, 1994
- Tamil Nadu State Forest Policy, 2018
- Karnataka Land Revenue Act, 1964
- General Rules to Regulate the Grazing of Cattle in Government Forest in Times of Drought
- Tamil Nadu Timber Transit Rules, 1968
- Tamil Nadu Farmers Management of Irrigation Systems Act, 2000
- West Bengal Trees (Protection and Conservation in Non Forest Areas) Act, 2006
- Disposal of Government land parcels which are not required for any public purpose and cannot be kept idle for encroachments located in various prime areas scattered throughout the state by open public auction
- Telangana Land Encroachment Act, 1905
- Tamil Nadu Protection of Tanks and Eviction of Encroachment Act, 2007
- Tripura Panchayats Act, 1993
- Tripura Tribal Areas Autonomous District (Establishment of Village Committee) Act, 1994
- Uttarakhand Plantation Policy, 2005
- Uttarakhand Transit of Timber and Other Forest Produce Rules, 2012
- Tamil Nadu Hill Areas (Preservation of Trees) Act, 1955
- Uttarakhand Fisheries Act, 2003
- Uttarakhand Flood Plain Zoning Act, 2012
- Tamil Nadu Preservation of Private Forests Act, 1949
- Tamil Nadu Forest Act, 1882
- Tamil Nadu Panchayats Act, 1994
- Indian Forest (Uttaranchal Amendment) Act, 2002
- Tamil Nadu Land Encroachment Act, 1905
- Land Bank Scheme
- Tree Protection Act, 1976
- UP Panchayati Forest Rules, 1972
- UP Protected Forest Rules, 1960
- Sikkim Fisheries Act, 1980
- Uttar Pradesh Village Joint Management Rules, 1997
- Uttar Pradesh Revenue Code Rules, 2016
- Sikkim Panchayat Act, 1993
- Sikkim Regulation of Transfer of Land Act, 2005
- Sikkim Land Act, 2014
- Rajasthan Water Policy, 2010
- Rajasthan State Forest Policy, 2010
- Gazette Notification regarding Tendu Patta (22.11.2012)
- Rajasthan Panchayati Raj Rules, 1996
- Rajasthan Water (Prevention and Control of Pollution) (Amendment) Rules, 2010
- Rajasthan Water (Prevention and Control of Pollution) Rules, 1975
- Rajasthan Fisheries Rules, 1958
- Rajasthan Protected Forest (Exercise of Concessions) Rules, 1960
- Rajasthan Protected Forest (Exercise of Rights) Rules, 1960
- Rajasthan Protected Forest Rules, 1957
- Rajasthan Forest Settlement Rules, 1958
- Rajasthan Tenancy (Government) Rules, 1955
- Rajasthan Land Revenue (Allotment of Unculturable Waste Land for Development of Private Forests) Rules, 1986
- Rajasthan Land Revenue (Allotment of Tank Bed Lands for Cultivation) Rules, 1961
- Rajasthan Land Revenue (Allotment of Tube Well Land) Rules, 1968
- Rajasthan Land Revenue (Allotment of Land for Digging of Wells and Installation of Pumping Sets for Irrigation Purposes) Rules, 1979
- Rajasthan Land Revenue (Eviction of Trespasser) Rules, 1975
- Rajasthan Panchayati Raj Act, 1994

This list alone (spanning Tamil Nadu, Karnataka, West Bengal, Telangana, Tripura, Uttarakhand, Uttar Pradesh, Sikkim, and a long Rajasthan block) is excellent real filler for a "Laws & Regulations" listing page in the redesign — no need to invent placeholder law names.

---

## 9. Activities > Videos and Podcasts — https://indiancommoner.org/video-and-podcast/

Teal band **"VIDEOS & PODCASTS"**. **This is a contribution/submission-call page, not a listing of activities content** — it differs from Resources > Videos (#4) / Podcasts (#5) in purpose: those are curated external resource libraries; this Activities page is IC's own call for member-submitted video/podcast recordings of its own events. Intro copy:

> "We invite the forum members to send us videos and podcasts on commons. Videos of up to a maximum of 30 minutes and podcasts of not more than 15 minutes duration may be submitted. Please email the video to us at **admin@indiancommoner.org**"

Below the intro, three embedded pieces of actual IC-produced content (not curated third-party resources):

1. **SoundCloud playlist** "Paripreksh - Stories and voices from ru[ral India]" (title truncated on card), channel "Indian Commoner", card includes a "Share" button and the SoundCloud logo — iframe: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1362486757…`
2. **"A Conversation with Sanchit Sant | Shepherds of the Deccan"** — channel "Indian Commoner" — decorative green/yellow diamond card background with portrait photo of Sanchit Sant, subtitle "Filmmaker of *The Shepherds of the Deccan*", "Watch on YouTube" badge — YouTube ID `sZC0yeA_kzg` → thumbnail `https://img.youtube.com/vi/sZC0yeA_kzg/hqdefault.jpg`
3. **"Commons, the Panchayati Raj, and the Civil Society"** — channel "Indian Commoner" — dark webinar-poster-style card, label "WEBINAR", event metadata icons: 📅 24 April 2023, 📍 (location/link icon), 🕐 5 PM – 6.30 PM; four circular panelist photos with names/roles:
   - **Mamta Warkade** — Sarpanch, Manikpur Gram Panchayat, Madhya Pradesh
   - **Aman Singh** — Founder, Krishi Avam Paristhitiki Vikas Sansthan, Rajasthan
   - **Mohan Hirabai Hiralal** — Veteran Gandhian/social worker
   - **Manjeet Bal** (Moderator) — Senior Program Manager, FES
   - Caption: "On the National Panchayati Raj Day, join us live as we discuss the role of Panchayati Raj Institutions in promoting community-led governance of natural resources." — YouTube ID `4MTHIHpHT_M` → thumbnail `https://img.youtube.com/vi/4MTHIHpHT_M/hqdefault.jpg`
4. A second webinar card, **Hindi-language**, headline "सामुदायिक संसाधन, पंचायती राज और सामाजिक संस्थाएं" ("Community Resources, Panchayati Raj and Social Institutions"), label "वेबिनार" (Webinar), same 24 April 2023 event (Hindi version of the same poster/session as item 3), same four panelists with Hindi name/role captions (ममता वारकड़े, अमन सिंह, मोहन हीराबाई हीरालाल, मनजीत बल), event link shown as `https://bit.ly/43EYKr4`.
   - Image: `https://indiancommoner.org/wp-content/uploads/2023/05/Panchayati-raj-poster_Hindi-300x300.png`

---

## 10. Activities > Workshops — https://indiancommoner.org/workshop/

Teal band **"WORKSHOPS"**. Intro paragraph:

> "The forum encourages the forming of small discussion groups on topics of relevance. Registered members may initiate this on their own. The forum will help facilitate the process by providing a platform and where possible, an anchor. This apart, from time to time, the forum will propose and organize more formal workshops by inviting papers and arranging for online presentations and discussions. These papers may subsequently be developed and published in the working paper series."

Below, real event posters (2-column grid):

1. **"Navigating the Coast"** — subtitle "Exploring Ownership, Threats and Pathways for Coastal Commons", event time "5 PM IST 7.7.2023" — three speaker photos/names: **Naveen Namboodiri**, **Dr. Sreeja KG**, **Amalendu Jyotishi** — teal/wave-illustration poster background, "IC" (Indian Commoner) badge logo top-left.
   - Image: `https://indiancommoner.org/wp-content/uploads/2023/07/Coastal-Commons-Webinar-poster-1-240x300.png`
2. **"सामुदायिक संसाधन, पंचायती राज और सामाजिक संस्थाएं"** (Hindi Panchayati Raj webinar poster) — same event as Section 9, item 4, re-used here.
   - Image: `https://indiancommoner.org/wp-content/uploads/2023/05/Panchayati-raj-poster_Hindi-300x300.png`
3. **"Commoning the Commons: Celebrating Community Stewardship"** — labelled "Virtual Conference", **"8-10 December 2022"**, full descriptive paragraph (real, substantial copy — good redesign filler):

   > "Commons, or shared resources such as groundwater, forests, pastures, other natural resources and cultural knowledge systems associated with them, sustain the lives and livelihoods of millions of people worldwide. Rural communities have been at the centre of protecting, conserving, and managing these resources in innovative ways which have stood the test of time. Diversity of approaches and indigenous knowledge provide a roadmap for building symbiotic relationships with nature, effectively addressing the challenges that we are encountering in the ongoing climate crisis across the globe. The distinct voices of indigenous communities, forest dwellers, farmers and pastoralists resonate the knowledge, expertise and understanding of Commons evolved over several generations. As they need to be heard and discussed widely, favourable platforms need to be evolved to advance and propel these voices further.
   >
   > As a part of the Promise of Commons initiative, a virtual conference on Celebrating Community Stewardship seeks to provide a platform for community members to share their experiences in natural resource governance and management. It is a platform for community-to-community interaction that can aid in cross-learning and enhanced knowledge and capacities. The conference also seeks to bring together practitioners, academicians and policymakers, along with members of civil society, who can benefit from the rich and diverse experiences shared. This conference is being organized as a part of World Commons Week (December 4-10) which celebrates and promotes sharing of knowledge and experiences around Commons."

   Background photo: rural community gathering under a tree.
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/1-220x300.jpg`
4. A fourth poster image also present on the page (a WhatsApp-sourced photo, likely a workshop/field-session snapshot):
   - Image: `https://indiancommoner.org/wp-content/uploads/2022/12/WhatsApp-Image-2020-12-08-at-1.26.37-PM-750x1024-1-220x300.jpeg`

---

## 11. People > IC Team — https://indiancommoner.org/team-members/

Teal band **"TEAM MEMBERS"**. Vertical timeline layout (teal dot + connecting line down the left edge), grouped under three sub-headings, each member as a large black-and-white circular/rounded portrait photo followed by name and one-paragraph bio. Full literal roster:

### Core/Operations Team
- **Himani Sharma** — "Himani holds master's degree in Forestry from Forest Research Institute, Dehradun."
- **Khanjan Ravani** — "Khanjan holds a bachelor's degree in journalism and M.A in Development from Azim Premji University."
- **Naveen Isarapu** — "Naveen holds a Masters' degree in Public Policy & Governance from Tata Institute of Social Sciences."
- **Nayantara Lakshman** — "Nayantara holds a M.A in Development from Azim Premji University."
- **Pooja Chandran** — "Pooja holds an LLM degree in environment & natural resources laws from TERI School of Advanced Studies."
- **Purnendu Kavoori** — "Purnendu Kavoori has worked extensively in the field of pastoralism and common-pool resources. He holds a Ph.D. in Development Studies from ISS Netherlands. He is presently Director of Center for Social Ecology, Jaipur, and is the coordinator of the Indian Commoner Forum."
- **Saurabh** — "Saurabh is a Bangalore-based designer and researcher whose work touches on the commons, environmental data, and sound. After graduating from Srishti School of Art, Design & Technology in 2012, he worked with various organizations to develop open-source tools for water and soil testing, and was one of the founders of Foundation for Environmental Monitoring"

### Development Team
- **Hemalatha Reddy** — "Hemalatha Reddy holds MBA, Sri Venkateswara University, Tirupathi and M.A in English, Periyar University, Salem."
- **Pratiti Priyadarshini** — "Pratiti Priyadarshini focuses on action research initiatives at Foundation for Ecological Security (FES)."
- **Raksha Balakrishna** — "Raksha has a Masters in Development from Azim Premji University. She has worked with the studies and policy advocacy team at the Foundation for Ecological Security (FES), on natural resource management."
- **Saneesh C S.** — "Saneesh has a Masters in Geography from Madras University. He has worked with the studies and policy advocacy team at the Foundation for Ecological Security (FES), on natural resource management. He is currently pursuing a PhD in Spatial Interaction Ecology from German Centre for Integrative Biodiversity Research (iDiv) and Helmholtz Centre for Environmental Research – UFZ."
- **Sanoop V.** — "Sanoop holds a M.A in Social Work from Tata Institute of Social Sciences."

### Advisory Board
- **Jagdeesh Rao** — "Jagdeesh was part of the founding team of Foundation for Ecological Security from 2001 till 2020. His focus is on the conservation of natural resources, the interrelated issues of poverty and environmental degradation." *(also the subject of Podcast Episode 113, Section 5)*
- **Ashok Sircar** — "Ashok Sircar is a Professor from Azim Premji University (APU). He teaches on Political Economy of Land and Development in India, and Local Democracy and Development in India."
- **Neema Pathak** — "Neema Pathak coordinates the Conservation and Livelihoods programme at Kalpavriksh. Her main interest area is conservation governance, with special focus on ICCAs (Indigenous Peoples and Local Communities Conserved Territories and Areas)."
- **Ruth Mienzen-Dick** — "Ruth Mienzen-Dick is a transdisciplinary researcher with over 25 years of experience. She focuses on water resource management, land, forests, property rights, collective action, and the impact of agricultural research on poverty."

**Team photos** (real, hotlinkable, captured in DOM order — the first is confirmed to be Himani Sharma via screenshot; remaining order should closely follow the bio order above but was not individually re-verified name-by-name):
- `https://indiancommoner.org/wp-content/uploads/2023/01/WhatsApp-Image-2022-02-01-at-4.11.02-PM-1.jpeg` (Himani Sharma, confirmed)
- `https://indiancommoner.org/wp-content/uploads/2023/01/WhatsApp-Image-2022-02-01-at-3.46.13-PM.jpeg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/WhatsApp-Image-2022-02-01-at-3.46.13-PM-2.jpeg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/nnn.jpg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/WhatsApp-Image-2022-02-01-at-4.11.03-PM.jpeg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/Purnendu-Kavoori.png`
- `https://indiancommoner.org/wp-content/uploads/2023/01/img1-3.jpg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/WhatsApp-Image-2022-02-01-at-4.11.02-PM.jpeg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/Pratiti-Priyadarshini1.png`
- `https://indiancommoner.org/wp-content/uploads/2023/01/02.jpg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/WhatsApp-Image-2022-02-01-at-4.11.03-PM-1.jpeg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/WhatsApp-Image-2022-02-01-at-4.11.04-PM.jpeg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/img2-2.jpg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/img4-1.jpg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/img3-2.jpg`
- `https://indiancommoner.org/wp-content/uploads/2023/01/img5-1.jpg`

All portraits are styled in **black-and-white**, distinct from the color photography used elsewhere on the site (workshop posters, homepage carousel).

---

## 12. People > Forum Members — https://indiancommoner.org/members/

Teal band **"MEMBERS DIRECTORY"**. Below it: a rounded search input "Search Members…", then a light-gray **"Filter"** card (funnel icon + "Filter" label, presumably expands sort/filter options). Then a grid of member cards, each: light triangle-pattern gray background, centered circular gray default avatar (BuddyPress "mystery-man"), bold display name, `@username` in gray underneath. Pagination footer: **"Viewing 1 - 18 of 179 active members"**, page links **1 2 … 10 →**.

Page-1 usernames (verbatim, name + handle) — note most of these look like auto-registered/spam accounts rather than genuine community members (single common English surnames, generic word-pair handles):

- Admin — `@admin`
- Bowling — `@poppybrand10`
- Hinson — `@bulbbrand93`
- Honeycutt — `@goatchime4`
- Woodward — `@congocomma8`
- Jigir — `@jigirshah`
- Krinal — `@krinal`
- Ankush — `@ankush123`
- Coates — `@yellownest8`
- Stougaard — `@animenest6`
- Neal — `@nealkena`
- Lane — `@steelneon6`
- Noah — `@noahadam2104` *(same "Noah" seen posting spam replies in Section 3b)*
- Ezra — `@jackezra5`
- Newman — `@furshade42`
- Aagesen — `@bordersarah04`
- Maxwell — `@buglepuppy34`
- Collier — `@kittenspace9`

**Redesign note**: for a realistic-looking member directory, prefer the handful of names that are demonstrably real, active contributors seen elsewhere in this inventory — **anjali** (`anjali1989`), **Anil** (`anilsarsavan`), **Sujata** (`sujata18`), **Indu**, **Ramesh Babu**, **Malavika**, **Lakshmi**, **Aditya**, **Charan.A**, **Ayush**, **Vishno**, **Yazhini** (all seen posting genuine topics in Section 14) — rather than the generic/spam-looking names above.

### Sample member profile — https://indiancommoner.org/members/anjali1989/
BuddyBoss-style profile page: full-width gray/triangle-pattern **cover photo band** (default, no custom cover uploaded) with a large circular default avatar centered on it, display name **"Anjali"** with an **"OFFLINE"** status pill beside it. Below the cover: a collapsible hamburger-style tab menu (shown collapsed at all viewport widths tested) exposing sub-tabs: **Base**, **Media** (with children **Photos / Videos / Audios / Files**), and presumably Activity/Forums/Groups tabs not expanded during this crawl.
- **Base** tab content: only one field populated — "First Name: anjali" (rest of the extended profile form is empty).
- A blue-to-teal gradient banner reading **"SIGN IN TO YOUR ACCOUNT"** with a door/arrow icon, linking to `/login/` — shown to logged-out visitors viewing any profile.
- **Media / Photos / Videos / Audios / Files**: each returns "Sorry, no items found." — members have not uploaded any media.

This confirms member profiles are essentially bare (no bio, no location, no custom fields filled) for even the most active real contributors — good to know so the redesign doesn't over-promise rich profile data that doesn't exist on the live site.

---

## 13. Login — https://indiancommoner.org/login/

Teal footer band only (no teal page-title band on this page — it's a plain white page). Centered white card, drop-shadow, on a white page background:

- Heading: **"Log In With Your Credentials"**
- Field label **"Username or Email"** + text input
- Field label **"Password"** + password input
- Checkbox **"Remember Me"**
- Link **"Forgot Your Password?"**
- Full-width teal button **"SIGN IN"**
- Below the card, plain link **"Create An Account"**

No social login, no language switcher emphasis, no imagery — simplest page on the site. (Not logged into, per task instructions.)

---

## 14. State-specific pages (from homepage tag cloud)

States on the homepage are **not** linked to dedicated per-state landing pages. Each state name links to a standard **bbPress topic-tag archive** at `/forums/topic-tag/<state-slug>/` (see the full URL table in Section 1). These archive pages reuse the same teal-table forum-listing template as everywhere else on the site (heading "Topic Tag: `<State>`", teal **"Topic"** column header, pinned/regular topic rows with author avatar, category tag, Voices/Posts counts, last-poster + relative date).

### Example — https://indiancommoner.org/forums/topic-tag/andhra-pradesh/ (22 items, 2 pages)
Real topic rows captured (title — author — category tag — relative date):

1. Andhra Pradesh-Culture And Commons: Great Backyard Bird Count (GBBC) — Indu — Sacred Sites And Cultural Landscapes — 5 voices/5 posts — last: Noah, 2 Months Ago *(pinned)*
2. Guardians Of Forests In The Changing World – A Story Of A Women NTFP Collector — Ramesh Babu — Valuation Of Commons — 1/1 — Ramesh Babu, 3 Years 1 Month Ago
3. Tokenistic Representation Of Women In Village Institutions — Malavika — Institutional Arrangements — 3/3 — Nayantara, 3 Years 2 Months Ago
4. Keeping Alive Ancient Tradition Of Planting Trees And Worshiping Them — Ramesh Babu — Sacred Sites And Cultural Landscapes — 0/2 — Ramesh Babu, 3 Years 6 Months Ago
5. Fire Ecology — Lakshmi — Fire Ecology — 1/1 — Lakshmi, 3 Years 6 Months Ago
6. Legal Methods To Protect Common Land — Anonymous — Laws And Enactments — 0/1 — Anonymous, 3 Years 6 Months Ago
7. Burning The Commons: Forest Fires And Their Effects — Aditya — Security And Subsistence — 0/1 — Aditya, 3 Years 6 Months Ago
8. The Symbiotic Relationship Between Commons And Culture — Charan.A — Traditional Knowledge, Customs And Practices — 0/1 — Charan.A, 3 Years 6 Months Ago
9. Commons As Playground — Ayush — Social Movements — 0/1 — Ayush, 3 Years 6 Months Ago
10. Quarantining In The Commons: A Unique Practice In Enamaravaripalle — Vishno — Traditional Knowledge, Customs And Practices — 0/1 — Vishno, 3 Years 6 Months Ago
11. An Account Of The Impact Of Restoration Projects In Common Lands — Yazhini — Restoration Ecology — 0/2 — Yazhini, 3 Years 6 Months Ago
12. Andhra Pradesh-Culture And Commons: The Temple Of Sri Siddeshwara Swami — Indu — Sacred Sites And Cultural Landscapes — 0/1 — Indu, 3 Years 7 Months Ago
13. Jatres And The Culture Of Commons — Vishno — Traditional Knowledge, Customs And Practices — 0/3 — Vishno, 3 Years 7 Months Ago
14. Seed Preservation Methods Practiced By Women In Andhra Pradesh — Lakshmi — Gender-Specific Knowledge Systems — 0/2 — Malavika, 3 Years 7 Months Ago
15. Eco-Feminist Movements — Malavika — Social Movements — 0/2 — Lakshmi, 3 Years 7 Months Ago

(Page 2 of 2 not individually captured — 7 more topics estimated.)

This is genuinely one of the richest, most authentic sets of real topic titles + authors + sub-tags on the whole site and is strongly recommended as seed content for any "browse by state" or "recent topics" mockup in the redesign.

---

## 15. Sticky top navigation & footer (consistent across every page)

### Top utility bar
Plain white bar, small text links: **English** (active, shown in pink `#CC3366`) | **Hindi** | **Kannada** | **Telugu** — all four are real `<a>` tags but three point to `href="#"` (language switching not actually wired to translated content on the crawled pages).

### Main nav (sticky, white background, black text, logo top-left)
Logo image `https://indiancommoner.org/wp-content/uploads/2022/12/Artboard-1@2x-1.png`, text "Indian Commoner" — links to `https://indiancommoner.org/home/`.

- **Forum** → `https://indiancommoner.org/forum-themes/` (no dropdown, direct link)
- **Resources** ▾ (dropdown)
  - Videos → `https://indiancommoner.org/videopost/`
  - Podcasts → `https://indiancommoner.org/podcast/`
  - Literature → `https://indiancommoner.org/literatures/`
  - Newsfeed → `https://indiancommoner.org/newsfeed/`
  - Laws and Regulations → `https://indiancommoner.org/laws`
- **Activities** ▾ (dropdown)
  - Videos and Podcasts → `https://indiancommoner.org/video-and-podcast/`
  - Workshops → `https://indiancommoner.org/workshop/`
- **People** ▾ (dropdown)
  - IC Team → `https://indiancommoner.org/team-members/`
  - Forum Members → `https://indiancommoner.org/members/`
- **Login** → `https://indiancommoner.org/login/`
- Search icon (magnifying glass) → expands an inline "Search for: [Search here...]" text field (site-wide search, no dedicated results page URL captured)

On narrow layouts, the whole nav collapses behind a **"☰ Menu"** hamburger toggle; the same link structure duplicates as a mobile drawer.

### Footer (teal `#01796F` background, white text, appears identically on every page)
Three-column layout:
1. **CenSE logo** (green leaf-hand mark) — `https://indiancommoner.org/wp-content/uploads/2022/12/Cense.png` — links to `http://www.censeindia.org/` — caption "Centre for Social Ecology"
2. Link column A: **Home** (`https://indiancommoner.org/`), **Contact Us** (`https://indiancommoner.org/contact-us/`)
3. Link column B: **Terms of Use** (`https://indiancommoner.org/terms-of-use/`), **Privacy Policy** (`https://indiancommoner.org/privacy-policy/`)
4. **FES logo** (blue/green globe mark + wordmark "FOUNDATION FOR ECOLOGICAL SECURITY") — `https://indiancommoner.org/wp-content/uploads/2022/12/FES.png` — links to `https://fes.org.in/`

Below a divider line, centered row of social icons (white circle outline icons):
- Facebook → `https://www.facebook.com/Indian-Commoner-Forum-100238292592467/`
- Instagram → `https://www.instagram.com/indian_commoner_forum/`
- Twitter → `https://twitter.com/CommonerForum`
- LinkedIn → `https://www.linkedin.com/company/indian-commoner-forum`

No copyright line text was detected in the crawled footer markup beyond the above (no "© 2024 Indian Commoner" string observed).

---

## Appendix — full de-duplicated image URL list by page (for quick hotlinking reference)

**Site-wide chrome** (every page):
- Logo: `https://indiancommoner.org/wp-content/uploads/2022/12/Artboard-1@2x-1.png`
- Footer CenSE logo: `https://indiancommoner.org/wp-content/uploads/2022/12/Cense.png`
- Footer FES logo: `https://indiancommoner.org/wp-content/uploads/2022/12/FES.png`
- BuddyPress default small avatar: `https://indiancommoner.org/wp-content/plugins/buddypress/bp-core/images/mystery-man-50.jpg`
- BuddyPress default large avatar: `https://indiancommoner.org/wp-content/plugins/buddypress/bp-core/images/mystery-man.jpg`

**Homepage** — portrait grid (18 figures) + carousel (5 images) — see Section 1 for the full labelled list.

**Forum Themes grid** — 8 theme card photos — see Section 2.

**Conversion of Commons detail page** — 6 sub-thematic photos — see Section 2.

**Team Members** — 16 black-and-white staff portraits — see Section 11.

**Workshops** — 4 event posters — see Section 10.

**Activities Videos & Podcasts** — 1 SoundCloud embed + 3 YouTube embeds (2 with a custom designed card background) — see Section 9.

**Videos listing (page 1)** — 9 YouTube thumbnails via `img.youtube.com/vi/<id>/hqdefault.jpg` — see Section 4.

Podcasts, Literature, Laws & Regulations, and Newsfeed listings carry **no card thumbnail images** on the live site (solid-color teal cards or, for Newsfeed, no items at all) — the redesign is free to introduce imagery here without contradicting real content, since there is no existing real image to preserve.
