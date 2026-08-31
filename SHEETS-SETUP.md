# Logging teaser-deck leads to Google Sheets

`index.html` (the teaser deck) captures two things and posts them as rows to a Google Sheet:

| Event | Fires when |
| --- | --- |
| `gate_unlock` | someone enters their email on the entrance screen |
| `deck_request` | someone submits the "Request the full pitch deck" form on the last slide |

The deck is a static page, so it needs a public endpoint to write to. A Google
Apps Script web app bound to the sheet is the shortest path — no server, no
third-party form service, and the data never leaves the Google account that
owns the sheet.

## The sheet

**Bytes AI Teaser Deck — Leads**
https://docs.google.com/spreadsheets/d/1JGfA717t4hqErYnTthKw7E5jmdiRyEX1reaUjwjCy08/edit

Header row is already in place:

`Timestamp · Event · Email · Name · Firm · Deck · Page URL · Referrer`

## One-time setup (about two minutes)

Deploying an Apps Script has to be done from a signed-in browser, so these
steps are yours to run.

1. Open the sheet above, then **Extensions → Apps Script**.
2. Delete the placeholder `myFunction` and paste in the script below.
3. Click **Save**.
4. **Deploy → New deployment**. Hit the gear next to "Select type" and choose
   **Web app**.
5. Set **Execute as: Me** and **Who has access: Anyone**, then **Deploy**.
   - "Anyone" means anyone can POST a row. It does not expose the sheet's
     contents — the script only ever appends.
6. Authorize when prompted. Google will warn that the app is unverified
   because you just wrote it; choose **Advanced → Go to (project name)**.
7. Copy the **Web app URL**. It ends in `/exec`.
8. Send me that URL and I will drop it into `index.html`, or paste it yourself
   into the `CAPTURE_ENDPOINT` line near the top of the page's `<script>`:

   ```js
   var CAPTURE_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
   ```

## The script

```javascript
const HEADERS = ['Timestamp', 'Event', 'Email', 'Name', 'Firm', 'Deck', 'Page URL', 'Referrer'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Leads') || ss.getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const d = JSON.parse(e.postData.contents);
    sheet_().appendRow([
      d.at || new Date().toISOString(),
      d.event || '',
      d.email || '',
      d.name || '',
      d.firm || '',
      d.deck || '',
      d.page || '',
      d.referrer || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Bytes AI teaser capture endpoint is live.');
}
```

## Notes

- **Redeploy after editing the script.** Apps Script serves the deployed
  version, not the saved one: **Deploy → Manage deployments → pencil icon →
  Version: New version → Deploy**. The `/exec` URL stays the same.
- **Nothing is lost while the endpoint is unset.** Every capture is also
  written to the visitor's `localStorage` under `bytes_captures`. Once the URL
  is in place, new submissions go to the sheet as well.
- **The request is fire-and-forget.** Apps Script sends no CORS headers, so
  the page posts with `mode: 'no-cors'` — the row lands, but the page cannot
  read the reply. That is why the success message shows regardless of whether
  the write succeeded; the sheet is the source of truth.
- **To verify it works**, submit the form once on the live page and refresh
  the sheet. A row should appear within a second or two.
- **To get notified on each request**, in the sheet use
  **Tools → Notification settings → Notify me when… any changes are made**.
