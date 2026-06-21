# Vivaah Guest Sorter — Setup

## Files Needed

Place these 4 files in the same folder:

| File | Source | Notes |
|---|---|---|
| `index.html` | ✅ included | Main app UI |
| `app.js` | ✅ included | App logic |
| `contacts-data.js` | **Your file** | Your phone book export |
| `xlsx.full.min.js` | **Download** | SheetJS library |

## Getting xlsx.full.min.js

Download from: https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js

Save it as `xlsx.full.min.js` in this folder. (The app works for VCF/JSON/CSV without it, but Excel import/export requires it.)

## contacts-data.js format

```js
const PRELOADED_CONTACTS = [
  { id: 1, name: "Ramesh Kumar", phones: ["+919876543210"] },
  { id: 2, name: "Seema Devi",   phones: ["+919123456789", "+917654321098"] },
  // ...
];
```

## Usage

1. Open `index.html` in Chrome/Edge/Firefox
2. Click **Load Phone Book** to load pre-loaded contacts, OR
3. Drop a file (VCF / JSON / CSV / Excel / Google Contacts CSV) onto the import zone
4. **Click** a contact to move it to "Selected Guests"
5. **Drag** contacts between lanes to select/deselect
6. Assign each guest: **Tilak** | **Wedding** | **Both**
7. Click **Export Excel** → downloads 3 files:
   - `Tilak_Guest_List.xlsx`
   - `Wedding_Guest_List.xlsx`
   - `Both_Events_Guest_List.xlsx`

## Supported Import Formats

| Format | Notes |
|---|---|
| VCF | Standard vCard export from any phone |
| JSON | Array of `{name, phones}` objects |
| CSV | Generic — auto-detects name + phone columns |
| Excel (.xlsx) | First sheet, auto-detects columns |
| Google Contacts CSV | Google Takeout / Contacts export |
