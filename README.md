# Bytes AI Investor One-Pager — Railway deploy

Static site, single file. Railway's Railpack builder auto-detects index.html and serves it.

## Deploy
1. Push this folder to a GitHub repo (or run `railway up` from inside it with the Railway CLI).
2. In Railway: New Project -> Deploy from GitHub repo (or CLI upload).
3. Once deployed, open Settings -> Networking -> Generate Domain (or attach your own, e.g. invest.trybytes.ai via a CNAME).

## Notes
- No server code needed; everything (fonts, logo, styles) is embedded in index.html.
- The email gate stores entered emails in each visitor's browser only. To capture them, set a webhook URL in the page's captureEndpoint before exporting a new copy.
