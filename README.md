# Bytes AI investor pages — Railway deploy

Static site, no build step. Railway's Railpack builder auto-detects index.html and serves it.

## Deploy
1. Push this folder to a GitHub repo (or run `railway up` from inside it with the Railway CLI).
2. In Railway: New Project -> Deploy from GitHub repo (or CLI upload).
3. Once deployed, open Settings -> Networking -> Generate Domain (or attach your own, e.g. invest.trybytes.ai via a CNAME).

## Two sites in this repo
| Folder | Deployed as | What it is |
| --- | --- | --- |
| repo root | the existing project (`index.html`) | The full 15-slide investor deck. Unchanged. |
| `teaser/` | its own project, Root Directory `teaser` | **Bytes AI Teaser Deck** — 10 slides closing on a "request the full pitch deck" form. See [teaser/README.md](teaser/README.md). |

They deploy independently: the root project serves the full deck, and a
second project pointed at `teaser/` serves the teaser on its own domain.

## Notes
- No server code needed; everything (fonts, logo, styles) is embedded in each page.
- The root `index.html` stores gate emails in the visitor's browser only.
- The teaser logs both its gate unlock and its full-deck request to a Google
  Sheet — see [teaser/SHEETS-SETUP.md](teaser/SHEETS-SETUP.md).
