

## SEO Keywords Feature for Upload Form

### Problem
Currently movies table mein koi keywords/tags field nahi hai. SEO keywords add karne se Google search mein content better rank karega aur users ko content dhundhne mein madad milegi.

### Plan

**1. Database Migration**
- `movies` table mein `seo_keywords` column add karna (type: `text`, nullable)
- Keywords comma-separated store honge (e.g., "action, thriller, hindi dubbed, 2024")

**2. Upload Form Update (`src/pages/Upload.tsx`)**
- Submit button ke upar ek "SEO Keywords" section add karna
- Input field with placeholder showing example keywords
- Helper text explaining how to add keywords (comma-separated)
- Auto-suggest common keywords based on selected category/language
- formData mein `seo_keywords` field add karna
- Insert query mein `seo_keywords` include karna

**3. SEO Meta Tags Integration**
- Movie detail modal mein keywords ko meta description mein use karna for better search visibility
- Index page pe movie cards mein keywords as hidden text for crawlers

### UI Design
```text
┌─────────────────────────────────────┐
│ SEO Keywords (Optional)             │
│ ┌─────────────────────────────────┐ │
│ │ action, thriller, hindi dubbed  │ │
│ └─────────────────────────────────┘ │
│ Add comma-separated keywords to     │
│ help users find this content         │
│                                     │
│ Suggested: [Hindi Dubbed] [2024]    │
│ [Action] [Thriller] (based on       │
│ selected category)                  │
└─────────────────────────────────────┘
```

### Files to Modify
| File | Change |
|------|--------|
| Database | Add `seo_keywords text` column to `movies` table |
| `src/pages/Upload.tsx` | Add SEO keywords input section with suggestions |

### Lovable Cloud Error
The backend authentication has expired and needs reconnection. This is separate from the feature - I'll handle the reconnection first.

