# 🍓 Saucebook
> A Chrome/Firefox extension that enhances the voting experience on Flavortown 
> and syncs your votes with Google Drive & NotebookLM


## Features

- **Interactive Star Ratings** - Replace default radio buttons with smooth 9-star interface
- **Auto-Save Drafts** - Automatically save your votes locally while typing
- **Draft Restoration** - Reload the page and your votes come back instantly
- **Google Drive Sync** - Upload your votes to a dedicated Drive folder
- **AI Suggestions** - Get smart voting suggestions based on project text
- **Real-Time Preview** - See your average score update in real-time
- **Storage Dashboard** - View all saved drafts in the options page

---
## Installation

1. Go to the repo
2. Go to releases
3. Download the crx file
4. Open `chrome://extensions/`
5. Enable **Developer mode** (top right)
6. Click **Load unpacked**
7. Select the `build/chrome/` folder
8. Done! Icon appears in your toolbar

### Local development
#### Chrome

1. Clone or download this repo
2. Install node_modules `npm install`
3. Run `npm run build` to create production build
4. Open `chrome://extensions/`
5. Enable **Developer mode** (top right)
6. Click **Load unpacked**
7. Select the `build/chrome/` folder
8. Done! Icon appears in your toolbar


#### Firefox

1. Same as Chrome, but use `build/firefox/` folder
2. Go to `about:debugging`
3. Click **This Firefox**
4. Click **Load Temporary Add-on**
5. Select `build/firefox/manifest.json`

# How to use

### On flavortown

1. Go to https://flavortown.hackclub.com
2. Click on any project to vote
3. **Stars appear** - click them to rate (1-9)
4. Preview bar shows **average score in real-time**
5. Click **Export to drive** to upload to Google Drive
6. Your votes **auto-save** every 1 second

### In popup

1. Click the **Saucebook icon** in toolbar
2. Click **"Link google"** to connect to Drive
3. See all your **saved drafts**
4. Quick links to **Google Drive** and **NotebookLM**

### In Options (settings)
1. Click **Settings** in popup
2. **Dashboard** - see stats (total drafts, average score, latest date)
3. **Storage** - view/delete individual drafts
4. **Drive** - manage Drive sync
5. **Account** - Google login status
6. **About** - version info

---

# Development

### Project Structure
Saucebook/
├── background/
│ └── service-worker.js # Background handler for Drive upload
├── content/
│ ├── content.js # Main extension logic
│ └── content.css # Styling for vote enhancement
├── popup/
│ ├── popup.html # Popup UI
│ ├── popup.js # Popup logic
│ └── popup.css # Popup styling
├── options/
│ ├── options.html # Settings page
│ ├── options.js # Settings logic
│ └── options.css # Settings styling
├── utils/
│ ├── storage.js # Draft save/load functions
│ ├── ai-suggester.js # AI voting suggestions
│ ├── dom-enhancer.js # Star rating UI enhancement
│ └── drive-api.js # Google Drive integration
├── icons/ # Extension icons
├── script/
│ └── build.js # Build script for Chrome/Firefox
├── manifest.json # Chrome manifest
├── manifest.firefox.json # Firefox manifest overrides
└── package.json # Dependencies

### Build

```bash
# Install dependencies (if needed)
npm install

# Build for Chrome and Firefox
npm run build

# Output: build/chrome and build/firefox
```

## How it works

1. **Content Script** runs on Flavortown pages
2. **Finds vote form** and replaces radio buttons with stars
3. **Auto-saves to LocalStorage** on each change
4. **Background Worker** handles Google Drive uploads
5. **Popup** shows drafts list and Drive/NotebookLM links
6. **Options Page** provides full dashboard + storage management


# Key Functions

## Storage (utils/storage.js)
- `saveDraft(projectId, ratings, notes)` - Save vote to localStorage
- `getDraft(projectId)` - Retrieve single draft
- `getDrafts()` - Get all drafts
- `deleteDraft(projectId)` - Remove draft

## AI Suggester (utils/ai-suggester.js)
- `suggestScores(projectText)` - Analyze project text and suggest scores (1-9)

## DOM Enhancement (utils/dom-enhancer.js)
- `setRating(container, category, value)` - Handle star click
- `updateStarDisplay(container, value)` - Highlight active stars
- `updatePreview()` - Update average score bar
- `triggerAutoSave()` - Debounced save function

## Drive API (utils/drive-api.js)
- `getAuthToken()` - Get Google OAuth token
- `ensureFolder()` - Create/find Saucebook folder in Drive
- `uploadVoteData(voteData, projectId)` - Upload JSON to Drive

---

## Permissions

```json
"permissions": [
  "storage",                    // LocalStorage for drafts
  "identity",                   // Google OAuth2
  "activeTab"                   // Access current tab
],
"host_permissions": [
  "https://flavortown.hackclub.com/*",    // Inject into Flavortown
  "https://www.googleapis.com/*"          // Google Drive API
]
```

---

## Customization

### Change Star Color
Edit `content/content.css`:
```css
.fve-star--active {
    color: #your-color;
    opacity: 1;
    transform: scale(1.1);
}
```

### Change Auto-Save Delay
Edit `utils/dom-enhancer.js`:
```js
autoSaveTimer = setTimeout(() => { ... }, 1000);  // Change 1000ms as needed
```

### Adjust Star Range
Edit `content/content.js`:
```js
for (let i = 1; i < 10; i++) {  // Change 10 to your desired max
    // ...
}
```

---

## Dark Mode

Toggle dark mode in **Settings > Account & Appearance**

Persists across:
- Options page
- Popup
- Flavortown voting page

**Saved in:** `chrome.storage.sync.darkMode`

## Known Issues

- Google Drive sync may take 1-2 minutes to propagate
- Firefox requires temporary add-on reload on browser restart
- AI suggestions are basic heuristics (no API call)

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run build`
5. Submit a PR

---

## Support & Troubleshooting

- **Extension not showing?** Check chrome://extensions/ and verify "Developer mode" is ON
- **Drafts not saving?** Go to Options > Clear All
- **Drive not syncing?** Click "Link google" in popup
- **Errors?** Open F12 > Console tab to debug

---

**Version:** 1.0.0  
**Last Updated:** April 22, 2026  


Made with ❤️ by Ferro