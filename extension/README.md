# Bright — Project Code Jump (browser extension)

A tiny Chrome/Edge extension (Manifest V3) that turns a project code like
`P000042` — the kind of thing that shows up in a Bright email or WhatsApp
message — into a one-click way to open that project.

It never talks to the Bright API directly. Every action just opens
`{baseUrl}/go?code=...` in a normal browser tab, so your existing Bright
login session (cookies) is used exactly as if you'd typed the URL yourself.
No extra permissions, no server-side integration to build.

## Three ways to use it

1. **Popup** — click the extension icon, paste a code, hit Enter.
2. **Right-click** — select a code (or a sentence containing one) anywhere
   on any page, right-click → "Open ... in Bright".
3. **Auto-linking (Gmail/Outlook web)** — codes inside message bodies you're
   reading in `mail.google.com`, `outlook.live.com`, or `outlook.office.com`
   / `outlook.office365.com` get turned into clickable links automatically.
   This is best-effort: webmail DOMs are complex and can change, and the
   linker deliberately skips anything editable (so it never touches what
   you're composing) — the popup and right-click menu always work regardless.

## Install it (unpacked, for now)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Pin it from the puzzle-piece icon in the toolbar if you want it visible.

## Configuring the base URL

Defaults to `https://bright.alkashafqatar.com`. Right-click the extension
icon → **Options** (or click "Settings" in the popup) to point it at a
different deployment — e.g. `http://localhost:3000` while developing.

## Publishing it for real (optional)

Loading unpacked is enough for personal/team use shared as a folder. To get
it into the Chrome Web Store so others can install it with one click, you'd
need your own Google Chrome Web Store developer account (one-time $5 fee),
then zip this folder and submit it through the
[developer dashboard](https://chrome.google.com/webstore/devconsole) —
that step has to be done by whoever owns the listing, so it isn't something
that can be done on your behalf here.

## Files

```
manifest.json   MV3 manifest — permissions, popup, background, content script
shared.js       Base-URL storage + code regex + URL builder, shared by every script
background.js   Registers the right-click "Open in Bright" context menu
popup.html/js   Paste-a-code popup
options.html/js Configure the base URL
content.js      Best-effort auto-linker for Gmail/Outlook web
icons/          16/48/128px extension icons
```
