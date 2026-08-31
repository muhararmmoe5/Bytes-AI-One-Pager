# Bytes AI Teaser Deck

A standalone static site. Ten gated slides ending in a "request the full
pitch deck" form; both the entrance email and the request are logged to a
Google Sheet.

Deploy this **folder** as its own project — it is independent of the
one-pager at the repo root and shares nothing but the source images.

## Deploy on Railway

1. Railway → **New Project → Deploy from GitHub repo** → this repo.
2. **Settings → Source → Root Directory:** `teaser`
   (this is the step that makes it a separate site rather than a second
   copy of the one-pager).
3. **Settings → Networking → Generate Domain**, or add a custom domain such
   as `teaser.trybytes.ai` via a CNAME.
4. If you use a domain other than `teaser.trybytes.ai`, update the three
   absolute `og:`/`twitter:` URLs at the top of `index.html` so link
   previews resolve.

Any static host works the same way — point the project root at `teaser/`.
Nixpacks reads `package.json` and serves the folder with `serve`.

## Slides

Introduction · Problem · Product · Live demos · Traction · Why now ·
Market · Moat · Distribution · Request the full deck

Deliberately omitted, because the last slide exists to ask for them:
competition, go-to-market, the raise, use of funds, team. There is no PDF
download button for the same reason.

## Lead capture

Set `CAPTURE_ENDPOINT` near the top of the `<script>` in `index.html`.
Until it is set, captures are still written to each visitor's
`localStorage` under `bytes_captures`. Full setup: [SHEETS-SETUP.md](SHEETS-SETUP.md).
