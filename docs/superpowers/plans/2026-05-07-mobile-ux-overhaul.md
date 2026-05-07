# Map-Centric Mobile UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Kinobok frontend to use a map-centric layout with a floating search bar and a bottom sheet on mobile, mimicking Google Maps.

**Architecture:** 
- Centralize state (search, menu, sidebar) in `page.tsx`.
- Create `SearchBar` and `ConfigMenu` components to separate search/config from results.
- Refactor `MatchSidebar` into a dual-purpose component: bottom-sheet on mobile, fixed sidebar on desktop.
- Update `CinemaMap` to support zoom-based labels and relocated controls.

**Tech Stack:** React (Next.js), TypeScript, Lucide React (for icons), Leaflet, CSS Modules/Globals.

---

### Task 1: Initialize New State and Search Logic in page.tsx

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Add new state variables**

```typescript
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
```

- [ ] **Step 2: Update filtering logic to include searchQuery**

```typescript
  const { matches, filteredCinemas, matchedCinemaIds } = useMemo(() => {
    let result = findMatchesWithFilters(watchlistUris, data, visibleChains);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      // Filter matches by title
      result.matches = result.matches.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.showtimes.some(s => s.cinema.toLowerCase().includes(q))
      );
      // Filter cinemas by name (for display on map)
      result.filteredCinemas = result.filteredCinemas.filter(c => 
        c.name.toLowerCase().includes(q)
      );
      // Note: matchedCinemaIds should stay consistent with total matches
    }
    
    return result;
  }, [watchlistUris, data, visibleChains, searchQuery]);
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: add search and menu state to page.tsx"
```

---

### Task 2: Create SearchBar Component

**Files:**
- Create: `frontend/components/SearchBar.tsx`

- [ ] **Step 1: Implement SearchBar component**

```tsx
"use client";

import { Menu, Search } from "lucide-react";

interface SearchBarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function SearchBar({ onMenuToggle, searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="search-bar-container">
      <button className="icon-button" onClick={onMenuToggle}>
        <Menu size={24} />
      </button>
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search movies or cinemas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add styles to globals.css**

```css
.search-bar-container {
  position: fixed;
  top: 15px;
  left: 15px;
  right: 15px;
  max-width: 450px;
  height: 48px;
  background: var(--lb-sidebar);
  border: 1px solid var(--lb-card);
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.4);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 12px;
}

.search-input-wrapper input {
  background: transparent;
  border: none;
  color: white;
  width: 100%;
  font-size: 16px;
  outline: none;
  padding: 8px;
}

.icon-button {
  background: none;
  border: none;
  color: var(--lb-text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  color: white;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/SearchBar.tsx frontend/app/globals.css
git commit -m "feat: add SearchBar component and styles"
```

---

### Task 3: Create ConfigMenu Component

**Files:**
- Create: `frontend/components/ConfigMenu.tsx`

- [ ] **Step 1: Implement ConfigMenu component**

```tsx
"use client";

import { X } from "lucide-react";
import React from "react";

interface ConfigMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchlistUpload: (uris: string[]) => void;
  visibleChains: string[];
  onToggleChain: (chain: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function ConfigMenu({ 
  isOpen, 
  onClose, 
  visibleChains, 
  onToggleChain,
  handleFileUpload
}: ConfigMenuProps) {
  const chains = ["Multikino", "Cinema City", "Helios"];

  if (!isOpen) return null;

  return (
    <div className="config-menu-overlay" onClick={onClose}>
      <div className="config-menu-content" onClick={(e) => e.stopPropagation()}>
        <div className="config-menu-header">
          <h2>kinꚘbok Warsaw</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="config-section">
          <h3>Upload Watchlist</h3>
          <p>Letterboxd export ZIP or CSV</p>
          <input type="file" accept=".csv,.zip" onChange={handleFileUpload} />
        </div>

        <div className="config-section">
          <h3>Advanced Filters</h3>
          <p>Include big chains:</p>
          {chains.map(chain => (
            <label key={chain} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={visibleChains.includes(chain)} 
                onChange={() => onToggleChain(chain)} 
              />
              {chain}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add styles to globals.css**

```css
.config-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1300;
}

.config-menu-content {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  background: var(--lb-sidebar);
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.5);
}

.config-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.config-section {
  margin-bottom: 25px;
}

.config-section h3 {
  font-size: 1.1em;
  color: var(--lb-orange);
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  cursor: pointer;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ConfigMenu.tsx frontend/app/globals.css
git commit -m "feat: add ConfigMenu component and styles"
```

---

### Task 4: Refactor MatchSidebar to Bottom Sheet

**Files:**
- Modify: `frontend/components/MatchSidebar.tsx`

- [ ] **Step 1: Clean up Sidebar (remove Upload/Filters)**

- [ ] **Step 2: Implement dual-mode layout (Desktop Sidebar vs Mobile Bottom Sheet)**

- [ ] **Step 3: Implement "Folded" vs "Expanded" states**

```tsx
// Inside MatchSidebar.tsx
const containerStyle: React.CSSProperties = isMobile ? {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: isExpanded ? '100%' : '60px',
  zIndex: 1200,
  borderRadius: isExpanded ? '0' : '12px 12px 0 0',
  transition: 'height 0.3s ease-in-out'
} : {
  width: '350px',
  height: '100%'
};
```

- [ ] **Step 4: Add "Arrow Down" button for expanded state**

- [ ] **Step 5: Commit**

```bash
git add frontend/components/MatchSidebar.tsx
git commit -m "refactor: MatchSidebar as a bottom sheet for mobile"
```

---

### Task 5: Update CinemaMap with Labels and Relocated Controls

**Files:**
- Modify: `frontend/components/CinemaMap.tsx`

- [ ] **Step 1: Add zoom state and listener**

```tsx
  const [zoom, setZoom] = useState(DEFAULT_ZOOM_VALUE);
  // Use map events to update zoom
```

- [ ] **Step 2: Implement dynamic labels for markers**

```tsx
// In Marker render
{zoom >= 15 && (
  <div className="marker-label">{cinema.name}</div>
)}
```

- [ ] **Step 3: Relocate controls to bottom-right**

```css
/* Update styles for Locate Me and Zoom controls */
.leaflet-bottom.leaflet-right {
  bottom: 80px; /* Above folded bottom sheet */
  right: 15px;
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/components/CinemaMap.tsx frontend/app/globals.css
git commit -m "feat: add cinema labels on zoom and relocate map controls"
```

---

### Task 6: Final Integration in page.tsx

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Replace MatchSidebar props and add SearchBar/ConfigMenu**

- [ ] **Step 2: Move handleFileUpload logic to page.tsx (to share between components)**

- [ ] **Step 3: Final layout adjustment**

- [ ] **Step 4: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: finalize integration of mobile UX components"
```

---

### Task 7: Verification

- [ ] **Step 1: Verify Search**
Search for "Helios" - only Helios markers should show.
Search for a specific movie title - only that match should show in the list.

- [ ] **Step 2: Verify Bottom Sheet**
On mobile view, check if it's 60px high initially.
Click to expand. Check if "Arrow Down" folds it back.

- [ ] **Step 3: Verify Config Menu**
Click hamburger. Upload a file. Verify it works.

- [ ] **Step 4: Verify Map Labels**
Zoom in to level 15. Verify cinema names appear next to markers.
