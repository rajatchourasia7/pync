# Path Cutter — Technical Context

## What is this?
A Chrome extension (Manifest V3) that maps user-defined short names to URLs and redirects via the omnibox.

## Architecture
- **`manifest.json`** — Declares omnibox keyword `pc`, permissions (`storage`), popup, and background service worker.
- **`background.js`** — Listens to `chrome.omnibox` events, looks up the short name in `chrome.storage.local`, and redirects the active tab.
- **`popup.html` / `popup.js` / `popup.css`** — UI for CRUD operations on mappings + JSON export/import.

## Data Model
Mappings stored in `chrome.storage.local` as:
```json
{"mappings": {"shortname": "https://full-url.com"}}
```

## Key Decisions
- Omnibox keyword is `pc`. User types `pc<Tab>shortname<Enter>`.
- Duplicate short names show a warning with cancel/overwrite options.
- No content scripts — the extension never modifies web pages.
- Chrome only (v1). Firefox and mobile Chrome planned for later versions.
