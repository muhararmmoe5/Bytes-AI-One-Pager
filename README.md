# Bytes AI one-pager — one-pager.trybytes.ai

Static site, no build step. Railway serves this folder with `serve`; every
file in the repo is a public URL on the site.

## What's live

| Path | Page |
| --- | --- |
| `/` | **Bytes AI Teaser Deck** — 10 gated slides ending in a "request the full pitch deck" form (`index.html`) |
| `/full-deck.html` | The previous homepage: the full 15-slide investor deck, byte-for-byte as it last shipped, kept so we can switch back. Unlinked from the teaser, still email-gated, PDF download intact. |
| `/teaser.html` | Older standalone landing page ("AI ordering agents for restaurants"), untouched. |
| `/bytes-ai-investor-deck.pdf` | The full-deck PDF that `/full-deck.html`'s download button serves. |

The teaser deliberately omits the competition, go-to-market, raise,
use-of-funds and team slides and has no PDF download — the closing slide
exists to make people request the full deck.

## Going back to the full deck

The old deck is preserved twice over: as `/full-deck.html` in the working
tree, and in git history (`main` before the teaser landed). To make it the
homepage again:

```
git mv index.html teaser-deck.html
git mv full-deck.html index.html
git push
```

…or just ask Claude to swap them back.

## Lead capture

The teaser logs the entrance email (`gate_unlock`) and the closing form
(`deck_request`) to the Google Sheet **Bytes AI Teaser Deck — Leads** once
`CAPTURE_ENDPOINT` at the top of `index.html`'s `<script>` is set. Until
then, captures land only in each visitor's `localStorage` under
`bytes_captures`. One-time setup: [SHEETS-SETUP.md](SHEETS-SETUP.md).

## Deploy
1. Push to `main`; Railway auto-deploys it.
2. Domain is attached in Railway → Settings → Networking.
