# Robby Baskin — personal site

A minimal, static personal site for a PhD student: home, publications, CV, and
about/contact. No build step, no framework — just HTML, CSS, and a little vanilla
JS. Hosts free on GitHub Pages. Content is edited through a web admin (Sveltia
CMS) with **no backend to pay for**.

## Pages
- `index.html` — home (wordmark, nav, rotating photo)
- `publications.html` — publications grouped by type
- `cv.html` — CV rendered in-page (PDF.js) + a Download PDF link
- `about.html` — bio, photo, contact
- `admin/` — Sveltia CMS admin (see **SETUP-CMS.md**)

## How content works
All content lives in two JSON files that the CMS edits and the pages read at
runtime — no rebuild needed:
- `data/site.json` — name, home photos, bio, photo, email, links, CV file
- `data/publications.json` — the publication list (each item has a type that
  determines which section it appears under)

Uploaded images go in `assets/img/`; the CV PDF goes in `assets/cv/`.

To edit content, use the admin (`/admin`) — see **SETUP-CMS.md** for the three
sign-in options. You *can* also hand-edit the JSON files directly if you prefer.

## Preview locally
```bash
python3 -m http.server 8765
# then open http://localhost:8765
```
Use a server, not the `file://` path — the pages fetch the JSON data and the CV
viewer needs HTTP.

## Deploy (GitHub Pages)
1. Create a GitHub repo and push this folder.
2. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`,
   folder `/ (root)`.
3. The `.nojekyll` file tells Pages to serve `assets/` untouched.
4. Set `repo:` (and optionally `base_url:`) in `admin/config.yml` — see SETUP-CMS.md.

## Still needed from Robby
- Real name confirmation (assumed "Robby Baskin")
- Bio text, university/field, contact email, Google Scholar / GitHub links
- Publication list
- His CV as a PDF (replaces `assets/cv/robby-baskin-cv.pdf`)
- A photo or two (home + about)
