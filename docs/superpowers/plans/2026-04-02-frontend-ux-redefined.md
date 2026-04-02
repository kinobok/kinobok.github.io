# Frontend UX Redefined Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve onboarding with a guidance modal and support for Letterboxd export ZIP files with `localStorage` persistence.

**Architecture:** 
- `GuidanceModal.tsx`: A new client-side component for the onboarding overlay.
- `MatchSidebar.tsx`: Updated to handle `.zip` files using `jszip` and extract `watchlist.csv`.
- `page.tsx`: Updated to hydrate state from `localStorage` on mount and manage modal visibility.

**Tech Stack:** React (Next.js), TypeScript, JSZip, Lucide React (for icons, if available, otherwise CSS), CSS Modules/Globals.

---

### Task 1: Add JSZip Dependency

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install JSZip and its types**

Run: `npm install jszip && npm install -D @types/jszip` in the `frontend` directory.

- [ ] **Step 2: Verify installation**

Check `package.json` for `jszip` and `@types/jszip`.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add jszip dependency for client-side zip handling"
```

---

### Task 2: Create GuidanceModal Component

**Files:**
- Create: `frontend/components/GuidanceModal.tsx`
- Modify: `frontend/app/globals.css` (for modal styles)

- [ ] **Step 1: Define modal styles in globals.css**

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--lb-sidebar);
  border: 1px solid var(--lb-card);
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  text-align: center;
}

.modal-button {
  background: var(--lb-green);
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: opacity 0.2s;
}

.modal-button:hover {
  opacity: 0.9;
}
```

- [ ] **Step 2: Create GuidanceModal.tsx**

```tsx
"use client";

interface GuidanceModalProps {
  onClose: () => void;
}

export default function GuidanceModal({ onClose }: GuidanceModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "var(--lb-text-primary)", marginBottom: "15px" }}>
          Find your Letterboxd watchlist in Warsaw
        </h2>
        <p style={{ color: "var(--lb-text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
          To see which movies from your watchlist are playing in Warsaw, you need your Letterboxd data.
        </p>
        <div style={{ marginBottom: "20px" }}>
          <a
            href="https://letterboxd.com/data/export/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--lb-blue)",
              textDecoration: "underline",
              display: "block",
              marginBottom: "10px",
              fontSize: "1.1em"
            }}
          >
            1. Export your data from Letterboxd
          </a>
          <p style={{ fontSize: "0.9em", color: "var(--lb-text-secondary)" }}>
            Once you have the ZIP file, just upload it here. We'll find your <strong>watchlist.csv</strong> automatically.
          </p>
        </div>
        <button className="modal-button" onClick={onClose}>
          Got it, let's go!
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/GuidanceModal.tsx frontend/app/globals.css
git commit -m "feat: add GuidanceModal component and styles"
```

---

### Task 3: Update MatchSidebar for ZIP Support and LocalStorage

**Files:**
- Modify: `frontend/components/MatchSidebar.tsx`

- [ ] **Step 1: Import JSZip**

```tsx
import JSZip from "jszip";
```

- [ ] **Step 2: Update handleFileUpload to support .zip**

```tsx
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let csvText = "";

    if (file.name.endsWith(".zip")) {
      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        const watchlistFile = Object.keys(contents.files).find(
          (path) => path.endsWith("watchlist.csv")
        );

        if (watchlistFile) {
          csvText = await contents.files[watchlistFile].async("text");
        } else {
          alert(
            "Error: 'watchlist.csv' not found in the uploaded ZIP. Please ensure you are uploading the full Letterboxd export. If you believe this is a bug, please raise an issue at: https://github.com/kinobok/kinobok.github.io/issues/"
          );
          return;
        }
      } catch (error) {
        console.error("Error unzipping file:", error);
        alert("Failed to process ZIP file. Please try uploading the CSV directly.");
        return;
      }
    } else {
      csvText = await file.text();
    }

    const watchlistUris = parseWatchlist(csvText);
    onWatchlistUpload(watchlistUris);
    
    // Save to localStorage
    localStorage.setItem("kinobok_watchlist_uris", JSON.stringify(watchlistUris));
  };
```

- [ ] **Step 3: Update file input accept attribute and helper text**

```tsx
<p style={{ fontSize: "0.9em", color: "var(--lb-text-secondary)" }}>
  Upload your Letterboxd export ZIP (containing <strong>watchlist.csv</strong>) or the CSV itself.
</p>
...
<input
  type="file"
  accept=".csv,.zip"
  onChange={handleFileUpload}
  style={{ fontSize: "0.8em", width: "100%" }}
/>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/components/MatchSidebar.tsx
git commit -m "feat: support ZIP uploads and persist watchlist to localStorage"
```

---

### Task 4: Integrate Modal and Hydration in page.tsx

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Add modal state and hydration logic**

```tsx
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    // 1. Hydrate watchlist from localStorage
    const savedUris = localStorage.getItem("kinobok_watchlist_uris");
    if (savedUris) {
      try {
        setWatchlistUris(JSON.parse(savedUris));
      } catch (e) {
        console.error("Failed to parse saved watchlist", e);
      }
    }

    // 2. Check guidance visibility
    const hasSeenGuidance = localStorage.getItem("kinobok_guidance_seen");
    if (!hasSeenGuidance && !savedUris) {
      setShowGuidance(true);
    }
  }, []);

  const handleCloseGuidance = () => {
    setShowGuidance(false);
    localStorage.setItem("kinobok_guidance_seen", "true");
  };
```

- [ ] **Step 2: Render GuidanceModal**

```tsx
  return (
    <main
      className="main-container"
      style={{ height: "100vh", width: "100vw", display: "flex" }}
    >
      {showGuidance && <GuidanceModal onClose={handleCloseGuidance} />}
      ...
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: hydrate watchlist from localStorage and show GuidanceModal on first visit"
```

---

### Task 5: Verification and Cleanup

- [ ] **Step 1: Verify ZIP upload**
Prepare a ZIP file containing a `watchlist.csv` and upload it. Verify matches appear.

- [ ] **Step 2: Verify persistence**
Refresh the page. Verify matches are still there.

- [ ] **Step 3: Verify missing file alert**
Prepare a ZIP without `watchlist.csv`. Upload and verify the alert message and GitHub link.

- [ ] **Step 4: Verify modal persistence**
Clear `localStorage` and refresh. Modal should appear. Click "Got it" and refresh. Modal should be gone.

- [ ] **Step 5: Final Commit**

```bash
git commit --allow-empty -m "chore: verify frontend UX improvements"
```
