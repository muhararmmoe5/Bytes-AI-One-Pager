# Bytes AI investor pages — Railway deploy

Static site, no build step. Railway's Railpack builder auto-detects index.html and serves it.

## Deploy
1. Push this folder to a GitHub repo (or run `railway up` from inside it with the Railway CLI).
2. In Railway: New Project -> Deploy from GitHub repo (or CLI upload).
3. Once deployed, open Settings -> Networking -> Generate Domain (or attach your own, e.g. invest.trybytes.ai via a CNAME).

## Versions
| File | Served at | What it is |
| --- | --- | --- |
| `index.html` | `/` | The full 15-slide investor deck. Unchanged. |
| `v2.html` | `/v2.html` | **Bytes AI Teaser Deck** — 10 slides, ending in a "request the full pitch deck" form. |

The teaser drops the competition, go-to-market, raise, use-of-funds and team
slides, and has no PDF download button: the full deck is what the last slide
asks people to request.

## Notes
- No server code needed; everything (fonts, logo, styles) is embedded in each page.
- `index.html` stores gate emails in the visitor's browser only.
- `v2.html` logs both the gate unlock and the full-deck request to a Google
  Sheet once `CAPTURE_ENDPOINT` is filled in — see [SHEETS-SETUP.md](SHEETS-SETUP.md).
  Until then it still keeps every capture in the visitor's `localStorage`.
