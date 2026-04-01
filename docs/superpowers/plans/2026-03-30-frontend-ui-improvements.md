# Frontend UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the kinꚘbok frontend into a mobile-responsive app with map-based matches and geolocation.

**Architecture:** Approach A (Vanilla CSS + Browser APIs). Responsive layout using CSS Media Queries, bottom sheet states in React, and Geolocation via `navigator.geolocation`.

**Tech Stack:** Next.js (TypeScript), Leaflet (React-Leaflet), Vanilla CSS.

---

### Task 1: Responsive Layout & Global Styles

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Add Responsive CSS to `globals.css`**
```css
/* Bottom sheet and responsive layout */
@media (max-width: 767px) {
  .main-container {
    flex-direction: column-reverse !important;
  }
}

.bottom-sheet {
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
}

@media (max-width: 767px) {
  .bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100% !important;
    border-right: none !important;
    border-top: 1px solid #ccc;
    border-radius: 12px 12px 0 0;
    background: white;
  }
  
  .bottom-sheet.collapsed { transform: translateY(calc(100% - 60px)); }
  .bottom-sheet.partial { transform: translateY(50%); }
  .bottom-sheet.expanded { transform: translateY(0); }

  .drag-handle {
    width: 40px;
    height: 5px;
    background: #ccc;
    border-radius: 3px;
    margin: 10px auto;
    cursor: pointer;
  }
}

@media (min-width: 768px) {
  .drag-handle { display: none; }
}
```

- [ ] **Step 2: Update `page.tsx` to use CSS classes**
Update the `<main>` tag:
```tsx
<main className="main-container" style={{ height: "100vh", width: "100vw", display: "flex" }}>
```

- [ ] **Step 3: Commit**
```bash
git add frontend/app/globals.css frontend/app/page.tsx
git commit -m "style: add responsive layout and bottom sheet CSS"
```

---

### Task 2: Mobile-Responsive Sidebar (Bottom Sheet)

**Files:**
- Modify: `frontend/components/MatchSidebar.tsx`

- [ ] **Step 1: Implement Sheet State**
Add `sheetState` ('collapsed' | 'partial' | 'expanded') and `isMobile` check.
```tsx
const [sheetState, setSheetState] = useState<'collapsed' | 'partial' | 'expanded'>('partial');
// Simple mobile detection
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
```

- [ ] **Step 2: Add Drag Handle & State Toggles**
Add the `.drag-handle` div at the top of the sidebar. Add a click handler to cycle states on mobile.

- [ ] **Step 3: Apply dynamic classes to sidebar**
```tsx
const sheetClass = isMobile ? `bottom-sheet ${sheetState}` : "";
// ...
<div className={`sidebar ${sheetClass}`} style={{ ...existingStyles }}>
```

- [ ] **Step 4: Commit**
```bash
git add frontend/components/MatchSidebar.tsx
git commit -m "feat: implement responsive bottom sheet in MatchSidebar"
```

---

### Task 3: Map Popups with Screenings & Links

**Files:**
- Modify: `frontend/components/CinemaMap.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Pass `matches` to `CinemaMap` in `page.tsx`**
```tsx
<CinemaMap
  cinemas={filteredCinemas}
  highlightedCinemaIds={matchedCinemaIds}
  matches={matches} // New prop
/>
```

- [ ] **Step 2: Update `CinemaMap` props and Popup content**
```tsx
interface CinemaMapProps {
  // ... existing
  matches?: Match[];
}
// Inside the popup:
const cinemaMatches = matches?.filter(m => m.showtimes.some(s => s.cinema_id === cinema.id));
{cinemaMatches && cinemaMatches.length > 0 && (
  <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
    <hr />
    <strong>Matches:</strong>
    <ul style={{ paddingLeft: '15px', margin: '5px 0' }}>
      {cinemaMatches.map(m => (
        <li key={m.id}>
          <a href={m.boxd_uri} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
            {m.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
```

- [ ] **Step 3: Commit**
```bash
git add frontend/components/CinemaMap.tsx frontend/app/page.tsx
git commit -m "feat: add matches and Letterboxd links to map popups"
```

---

### Task 4: Geolocation Integration

**Files:**
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/components/CinemaMap.tsx`

- [ ] **Step 1: Add `userLocation` state to `page.tsx`**
```tsx
const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
```

- [ ] **Step 2: Implement "Locate Me" in `CinemaMap.tsx`**
Add a button that calls:
```tsx
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    onLocationFound(loc); // Callback to page.tsx
  },
  (err) => console.error(err)
);
```

- [ ] **Step 3: Add User Marker to Map**
Use a blue marker icon for `userLocation`.

- [ ] **Step 4: Commit**
```bash
git add frontend/app/page.tsx frontend/components/CinemaMap.tsx
git commit -m "feat: implement browser geolocation and user marker"
```

---

### Task 5: Final Polish & Verification

- [ ] **Step 1: Manual Verification**
- Test responsive toggle in dev tools.
- Verify map pins show correct Letterboxd links.
- Verify "Locate Me" centers map and shows blue dot.
- [ ] **Step 2: Run existing tests**
Run: `npm test` in `frontend/`
- [ ] **Step 3: Commit final fixups**
```bash
git commit -m "chore: final polish and verification"
```
