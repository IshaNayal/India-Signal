# India Intelligence Dashboard - SPEC.md

## 1. Project Overview

**Project Name:** India Intelligence Dashboard  
**Type:** Interactive data visualization / news analytics dashboard  
**Core Functionality:** Real-time news aggregation and AI-powered impact analysis visualized on an interactive map of India with category-based theming  
**Target Users:** Policy analysts, journalists, business intelligence teams, researchers

---

## 2. Visual & Rendering Specification

### Scene Setup
- **Viewport:** Full-screen, no scroll on main layout
- **Theme:** Dark mode exclusively (no light mode toggle)
- **Background:** Deep charcoal (#0a0a0f) with subtle noise texture
- **Grid:** Faint coordinate grid overlay on map area

### Color Palette
```
Primary Background:    #0a0a0f (near-black)
Secondary Background:  #12121a (card surfaces)
Tertiary Background:   #1a1a24 (elevated elements)
Border:                #2a2a3a (subtle borders)
Text Primary:          #e4e4e7 (off-white)
Text Secondary:         #a1a1aa (muted text)
Text Tertiary:          #71717a (disabled/hints)

Impact Colors:
  Positive:            #22c55e (green-500)
  Positive Glow:        #22c55e40 (40% opacity)
  Negative:            #ef4444 (red-500)
  Negative Glow:        #ef444440 (40% opacity)
  Neutral:              #3b82f6 (blue-500)
  Neutral Glow:         #3b82f640 (40% opacity)

Category Colors:
  Climate:             #06b6d4 (cyan-500)
  Business:            #f59e0b (amber-500)
  Politics:            #8b5cf6 (violet-500)
  Health:              #ec4899 (pink-500)
  Technology:          #06b6d4 (teal-500)
  Sports:              #22c55e (green-500)
  Culture:             #f97316 (orange-500)
  Defense:             #64748b (slate-500)
```

### Typography
- **Font Family:** "JetBrains Mono" for data, "Inter" for UI text
- **Heading Sizes:** 32px (h1), 24px (h2), 18px (h3)
- **Body:** 14px regular, 12px for metadata
- **Monospace Data:** 13px for numbers/stats

### Map Specifications
- **Library:** react-simple-maps with D3-geo
- **Projection:** Mercator (default) or Albers for India
- **TopoJSON:** India states/UTs boundaries
- **Hover State:** State highlights with glow effect
- **Click State:** State selected, shows regional news
- **Animation:** Pulse effect for breaking news locations

---

## 3. Component Specification

### Header Component
- **Logo:** "INDIA INTEL" text with pulse animation
- **Category Tabs:** Horizontal pills with category icons
- **Live Clock:** Digital clock with timezone (IST)
- **Search:** Magnifying glass icon, expandable search input
- **Height:** 64px fixed

### India Map Component
- **Size:** 60% width, 100% height of main area
- **States Overlay:** Color-coded by aggregate impact
- **Markers:** Circular markers for news locations
- **Tooltips:** Hover shows state name + quick stats
- **Legend:** Floating legend for color meanings
- **Interactions:** Pan, zoom, click-to-select

### News Feed Component
- **Width:** 40% width, scrollable
- **Card Design:** Glass-morphism effect
- **Elements per card:**
  - Category badge (top-left, colored)
  - Impact indicator (top-right, colored dot)
  - Headline (bold, 2-line clamp)
  - Summary (2-line clamp)
  - Source + timestamp
  - Location tag
- **States:** Default, hover (glow), selected (border highlight)
- **Animation:** Staggered fade-in on load

### Impact Trend Chart (Sidebar)
- **Type:** Area chart with gradient fill
- **Metrics:** 24-hour rolling impact score
- **Position:** Collapsible bottom panel
- **Height:** 200px when expanded

### Category Filter Panel
- **Location:** Below header, horizontal scroll
- **Chips:** Multi-select toggle chips
- **Icons:** Category-specific icons from Lucide

### Search/Filter Bar
- **Search Input:** Expandable on click
- **Date Range:** Quick filters (Today, Week, Month)
- **Impact Filter:** Positive/Negative/All toggle

---

## 4. State Management (Zustand)

```typescript
interface DashboardState {
  // News Data
  articles: NewsArticle[];
  filteredArticles: NewsArticle[];
  
  // Filters
  selectedCategories: Category[];
  selectedImpact: 'positive' | 'negative' | 'neutral' | 'all';
  searchQuery: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  
  // Map State
  selectedState: string | null;
  hoveredState: string | null;
  mapZoom: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  expandedChart: boolean;
  
  // Actions
  setArticles: (articles: NewsArticle[]) => void;
  setSelectedCategories: (categories: Category[]) => void;
  setSelectedState: (state: string | null) => void;
  setSearchQuery: (query: string) => void;
}
```

---

## 5. API Integration

### News API (GNews API - Free Tier)
- **Endpoint:** `https://gnews.io/api/v4/top-headlines`
- **Country:** `country=in` (India)
- **Language:** `lang=en`
- **Max Results:** 50 per request
- **Categories:** business, entertainment, general, health, science, sports, technology
- **Refresh Interval:** 5 minutes

### AI Classification (Claude API)
- **Model:** claude-sonnet-4-20250514
- **Batch Size:** Process up to 10 articles per call
- **Classification Output:**
  ```json
  {
    "category": "climate|business|politics|health|technology|sports|culture|defense",
    "impact": "positive|negative|neutral",
    "impactScore": -1.0 to 1.0,
    "affectedRegions": ["Maharashtra", "Delhi"],
    "summary": "Brief AI-generated analysis"
  }
  ```

### India TopoJSON
- **Source:** topojson.world or Natural Earth
- **File:** india.topo.json (bundled)
- **Regions:** 28 states + 8 union territories

---

## 6. Interaction Specification

### Map Interactions
- **Hover:** State border glows, tooltip appears
- **Click:** Selects state, filters news feed to region
- **Double-click:** Zoom to state
- **Drag:** Pan map
- **Scroll:** Zoom in/out

### News Card Interactions
- **Hover:** Card lifts with shadow, glow effect
- **Click:** Expands to show full summary + AI analysis
- **Right-click:** Context menu (Share, Save, Mute source)

### Keyboard Shortcuts
- `1-8`: Quick filter by category
- `Esc`: Clear all filters
- `Ctrl+F`: Focus search
- `M`: Toggle map layer visibility

---

## 7. Animation Specification

### Map Animations
- **State Hover:** 200ms border glow transition
- **Marker Pulse:** Continuous 2s ease-in-out pulse for breaking news
- **Region Update:** 500ms color transition on data change

### News Feed Animations
- **Card Entry:** 300ms fade-in + slide-up, staggered by 50ms
- **Card Hover:** 150ms transform scale(1.02) + shadow
- **Filter Change:** 200ms fade transition

### UI Animations
- **Clock Update:** No animation (instant)
- **Tab Switch:** 150ms background slide
- **Search Expand:** 200ms width transition

---

## 8. Performance Targets

- **Initial Load:** < 3 seconds to interactive
- **News Refresh:** Background, no UI freeze
- **Map Render:** 60 FPS during interactions
- **Memory:** < 200MB heap size
- **Bundle Size:** < 2MB gzipped

---

## 9. File Structure

```
india-intelligence-dashboard/
├── public/
│   └── india.topo.json
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── IndiaMap.tsx
│   │   ├── NewsFeed.tsx
│   │   ├── NewsCard.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── ImpactChart.tsx
│   │   └── SearchBar.tsx
│   ├── hooks/
│   │   ├── useNews.ts
│   │   └── useAIClassification.ts
│   ├── store/
│   │   └── dashboardStore.ts
│   ├── services/
│   │   ├── newsApi.ts
│   │   └── claudeApi.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── SPEC.md
```

---

## 10. Acceptance Criteria

1. ✅ Dashboard loads with dark theme, full viewport
2. ✅ India map renders with all states/UTs
3. ✅ News feed displays articles from India
4. ✅ AI classification adds impact + region tags
5. ✅ Map overlays reflect article impact (red/green)
6. ✅ Category tabs filter news by type
7. ✅ Clicking state filters news to that region
8. ✅ Impact chart shows 24-hour trend
9. ✅ Search filters news by keyword
10. ✅ All animations are smooth (60 FPS target)
11. ✅ Responsive layout adapts to window resize
