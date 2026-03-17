

## Adsterra Ad Integration Plan

### Ad Script Details
```html
<script src="https://pl28581788.effectivegatecpm.com/2d/3c/a4/2d3ca4e8cc3d556a75388d75ff1997bb.js"></script>
```

This is an **Adsterra Social Bar / Popunder** ad script that automatically displays ads on page load.

---

### Implementation Strategy

**Option 1: Global Script (Recommended)**
Add the script to `index.html` so it loads on every page of the website.

**Option 2: Component-Based**
Create a React component that loads the script only on specific pages (like homepage, movie detail modal).

---

### Recommended Approach: Global Integration

**File to Modify:** `index.html`

**Where to Add:**
Place the script just before the closing `</body>` tag to ensure the page content loads first.

```text
Current Structure:
┌──────────────────────────────┐
│ <head>                       │
│   ... meta tags, fonts ...   │
│ </head>                      │
│ <body>                       │
│   <div id="root"></div>      │
│   <script src="main.tsx">    │
│   <!-- ADD ADSTERRA HERE --> │
│ </body>                      │
└──────────────────────────────┘
```

---

### Technical Details

**Changes to `index.html`:**
Add the Adsterra script after the main app script:
```html
<script type="module" src="/src/main.tsx"></script>
<script src="https://pl28581788.effectivegatecpm.com/2d/3c/a4/2d3ca4e8cc3d556a75388d75ff1997bb.js"></script>
```

---

### Expected Behavior

Once integrated:
- Social Bar will appear on every page (floating bar at bottom/side)
- Or Popunder ad will trigger on first user click
- Non-intrusive and won't block content
- Automatic monetization with each impression

---

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add Adsterra script before `</body>` |

---

### Timeline
Single file change - instant deployment after implementation

