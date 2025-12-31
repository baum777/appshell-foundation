# AppShell Architecture Documentation

## Überblick

Die AppShell Foundation ist das architektonische Grundgerüst von TradeApp. Sie definiert die Struktur, Navigation und das Layout-System der gesamten Anwendung.

## Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                        AppShell                              │
│  ┌────────────┬────────────────────────────────────────┐   │
│  │            │           Header                       │   │
│  │            │  ┌──────────────────────────────────┐ │   │
│  │            │  │ Logo | Search | Notifications    │ │   │
│  │            │  └──────────────────────────────────┘ │   │
│  │            ├────────────────────────────────────────┤   │
│  │  Sidebar   │                                        │   │
│  │  (Desktop) │          Main Content Area            │   │
│  │            │                                        │   │
│  │  - Logo    │          <Outlet />                   │   │
│  │  - Nav     │          (React Router)               │   │
│  │  - Items   │                                        │   │
│  │  - Footer  │                                        │   │
│  │            │                                        │   │
│  └────────────┴────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        BottomNav (Mobile)                            │  │
│  │  [Dashboard] [Journal] [Learn] [Chart] [Settings]   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Komponenten-Hierarchie

### AppShell (`src/components/layout/AppShell.tsx`)

Die zentrale Layout-Komponente, die alle anderen Layout-Elemente orchestriert.

**Verantwortlichkeiten:**
- Verwaltung des Sidebar-Collapse-Status
- Responsive Layout-Switching (Mobile/Desktop)
- Outlet für React Router (dynamischer Content)

**Props:**
```typescript
// Keine Props - nutzt React Router's Outlet
```

**State:**
```typescript
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
```

**Verwendung:**
```tsx
// In React Router Setup
<Route path="/" element={<AppShell />}>
  <Route index element={<Dashboard />} />
  <Route path="journal" element={<Journal />} />
  {/* ... weitere Routes */}
</Route>
```

### Sidebar (`src/components/layout/Sidebar.tsx`)

Desktop-Navigation mit collapsible Funktionalität.

**Features:**
- Logo/Branding
- Primary Navigation Items
- Advanced Navigation (Collapsible Group)
- Collapse/Expand Funktionalität
- Active Route Highlighting
- Version Footer

**Props:**
```typescript
interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}
```

**Breakpoints:**
- Versteckt: `< 768px` (mobile)
- Sichtbar: `>= 768px` (desktop)
- Width: `224px` (expanded), `64px` (collapsed)

**Navigation-Struktur:**
```typescript
// Primary Items (immer sichtbar)
- Dashboard (/)
- Journal (/journal)
- Learn (/lessons)
- Chart (/chart)
- Alerts (/alerts)
- Settings (/settings)

// Advanced Group (collapsible)
├── Watchlist (/watchlist)
├── Oracle (/oracle)
└── Handbook (/handbook) - nur mit VITE_ENABLE_DEV_NAV
```

### Header (`src/components/layout/Header.tsx`)

Top-Bar mit Notifications und User-Actions.

**Features:**
- Mobile Logo (nur auf Mobile sichtbar)
- Notification Button
- User Menu Button
- Sticky Positioning
- Backdrop Blur Effect

**Layout:**
```
┌──────────────────────────────────────────────┐
│ [Logo (Mobile)]              [🔔] [👤]      │
└──────────────────────────────────────────────┘
```

### BottomNav (`src/components/layout/BottomNav.tsx`)

Mobile Navigation am unteren Bildschirmrand.

**Features:**
- Subset der Primary Navigation
- Icon + Label
- Active State Highlighting
- Fixed Positioning

**Items:**
- Dashboard
- Journal
- Learn
- Chart
- Settings

**Breakpoints:**
- Sichtbar: `< 768px` (mobile)
- Versteckt: `>= 768px` (desktop)

## Navigation-Konfiguration

### Zentrale Konfiguration (`src/config/navigation.ts`)

Alle Navigation-Items sind zentral konfiguriert und typsicher.

**NavItem Interface:**
```typescript
interface NavItem {
  label: string;           // Anzeigename
  path: string;           // Route-Path
  icon: LucideIcon;       // Icon-Komponente
  testId: string;         // Test-ID für E2E Tests
  activeRoutes?: string[]; // Alternative aktive Routen
}
```

**NavGroup Interface:**
```typescript
interface NavGroup {
  label: string;
  testId: string;
  triggerTestId: string;
  icon: LucideIcon;
  items: NavItem[];
  featureFlag?: string;    // Optional: Feature-Flag
}
```

**Exports:**
```typescript
export const primaryNavItems: NavItem[];      // Haupt-Navigation
export const sidebarOnlyItems: NavItem[];     // Nur in Sidebar
export const mobileNavItems: NavItem[];       // Mobile Bottom Nav
export const advancedNavGroup: NavGroup;      // Advanced Group
```

**Utility Functions:**
```typescript
// Prüft ob Route aktiv ist
isRouteActive(currentPath: string, navItem: NavItem): boolean

// Prüft ob Dev-Nav enabled ist
isDevNavEnabled(): boolean
```

## Responsive Behavior

### Breakpoints

```typescript
// Tailwind Breakpoints
'sm': '640px',   // Small devices
'md': '768px',   // Medium devices (Tablets)
'lg': '1024px',  // Large devices (Laptops)
'xl': '1280px',  // Extra large devices
'2xl': '1536px'  // 2X Extra large devices
```

### Layout-Switching

| Viewport | Sidebar | Header Logo | Bottom Nav | Behavior |
|----------|---------|-------------|------------|----------|
| < 768px (Mobile) | Hidden | Visible | Visible | Mobile-optimiert |
| >= 768px (Desktop) | Visible | Hidden | Hidden | Desktop mit Sidebar |

### CSS Classes

```tsx
// Sidebar Responsive
className="hidden md:flex"  // Versteckt auf Mobile, flex auf Desktop

// Bottom Nav Responsive  
className="md:hidden"       // Sichtbar auf Mobile, versteckt auf Desktop

// Mobile Logo
className="md:hidden"       // Nur auf Mobile
```

## State Management

### Lokaler State

**Sidebar Collapse:**
```typescript
// In AppShell
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// Passed to Sidebar
<Sidebar 
  collapsed={sidebarCollapsed}
  onCollapsedChange={setSidebarCollapsed}
/>
```

**Advanced Nav Group:**
```typescript
// In Sidebar
const [advancedOpen, setAdvancedOpen] = useState(true);
```

### Route State

Active Route wird via `useLocation()` Hook ermittelt:

```typescript
const location = useLocation();
const isActive = isRouteActive(location.pathname, navItem);
```

## Styling

### Theme Variables

```css
/* Sidebar */
--sidebar: 240 10% 3.9%;
--sidebar-border: 240 3.7% 15.9%;

/* Background */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;

/* Card */
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;
```

### Active State Classes

```typescript
// In navigation.ts config
const activeClasses = "nav-item-active";
const inactiveClasses = "nav-item-inactive";
```

**CSS Definition:**
```css
.nav-item-active {
  @apply bg-primary text-primary-foreground font-semibold;
}

.nav-item-inactive {
  @apply text-muted-foreground hover:bg-secondary/50 hover:text-foreground;
}
```

## Accessibility

### Semantic HTML

```tsx
// Sidebar
<aside role="complementary">
  <nav aria-label="Main navigation">
    {/* Navigation Items */}
  </nav>
</aside>

// Header
<header role="banner">
  {/* Header Content */}
</header>

// Main Content
<main role="main">
  <Outlet />
</main>
```

### ARIA Labels

```tsx
// Collapse Button
<Button 
  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
  onClick={handleToggle}
/>

// Navigation Items
<Link 
  aria-current={isActive ? "page" : undefined}
  to={item.path}
>
  {item.label}
</Link>
```

### Keyboard Navigation

- ✅ Tab-Navigation funktioniert
- ✅ Enter/Space auf interaktiven Elementen
- ✅ Focus-Visible States
- ✅ Skip-to-Content Link (optional)

## Testing

### Test-IDs

Alle Navigation-Items haben `data-testid` Attribute:

```typescript
// In navigation config
{
  label: "Dashboard",
  path: "/",
  icon: LayoutDashboard,
  testId: "nav-dashboard",  // ← für Testing
}
```

### Playwright Tests

```typescript
// Navigation Test
test('should navigate to journal', async ({ page }) => {
  await page.click('[data-testid="nav-journal"]');
  await expect(page).toHaveURL('/journal');
});

// Active State Test
test('should highlight active route', async ({ page }) => {
  await page.goto('/journal');
  const journalLink = page.locator('[data-testid="nav-journal"]');
  await expect(journalLink).toHaveClass(/nav-item-active/);
});

// Responsive Test
test('should show sidebar on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  const sidebar = page.locator('aside');
  await expect(sidebar).toBeVisible();
});
```

## Performance

### Optimierungen

1. **Code Splitting**: Routes werden lazy geladen
2. **Memoization**: Icons werden nicht neu gerendert
3. **CSS Transitions**: Hardware-beschleunigt
4. **Conditional Rendering**: Komponenten nur wenn nötig

### Metrics

- Initial Render: < 100ms
- Route Change: < 50ms
- Sidebar Toggle: < 300ms (mit Animation)
- Mobile/Desktop Switch: Instant

## Erweiterung

### Neues Navigation-Item hinzufügen

1. **Icon importieren:**
```typescript
import { NewIcon } from 'lucide-react';
```

2. **Zu Config hinzufügen:**
```typescript
export const primaryNavItems: NavItem[] = [
  // ... existing items
  {
    label: 'New Feature',
    path: '/new-feature',
    icon: NewIcon,
    testId: 'nav-new-feature',
  },
];
```

3. **Route hinzufügen:**
```tsx
<Route path="new-feature" element={<NewFeature />} />
```

4. **Test schreiben:**
```typescript
test('should navigate to new feature', async ({ page }) => {
  await page.click('[data-testid="nav-new-feature"]');
  await expect(page).toHaveURL('/new-feature');
});
```

### Feature-Flag für Nav-Item

```typescript
// In navigation.ts
export const experimentalNavGroup: NavGroup = {
  label: 'Experimental',
  featureFlag: 'VITE_ENABLE_EXPERIMENTAL',
  items: [/* ... */],
};

// In Sidebar.tsx
const showExperimental = import.meta.env.VITE_ENABLE_EXPERIMENTAL === 'true';

{showExperimental && (
  <div>
    {experimentalNavGroup.items.map(renderNavItem)}
  </div>
)}
```

### Custom Layout für spezielle Seiten

```tsx
// Ohne AppShell
<Route path="/standalone" element={<StandalonePage />} />

// Mit Custom Layout
<Route path="/custom" element={<CustomLayout />}>
  <Route index element={<CustomPage />} />
</Route>
```

## Best Practices

### ✅ Do's

- Verwende zentrale Navigation-Konfiguration
- Nutze `data-testid` für alle interaktiven Elemente
- Implementiere responsive Breakpoints konsequent
- Teste auf verschiedenen Viewports
- Nutze semantic HTML und ARIA-Labels
- Halte Navigation-Logik in Config-Datei

### ❌ Don'ts

- Keine hardcoded Routes in Komponenten
- Keine inline Navigation-Konfiguration
- Keine fragilen CSS-Selektoren in Tests
- Keine fixen Timeouts in Tests
- Keine doppelten Navigation-Items
- Keine Navigation-Logik in UI-Komponenten

## Troubleshooting

### Problem: Sidebar bleibt auf Mobile sichtbar

**Lösung:**
```tsx
// Prüfe CSS-Klassen
className="hidden md:flex"  // ← muss auf Sidebar sein
```

### Problem: Active State funktioniert nicht

**Lösung:**
```typescript
// Prüfe activeRoutes in Config
{
  path: '/chart',
  activeRoutes: ['/chart', '/chart/replay', '/replay'],  // ← alle Varianten
}
```

### Problem: Navigation-Item ist nicht klickbar

**Lösung:**
```tsx
// Prüfe z-index und pointer-events
className="relative z-10 pointer-events-auto"
```

## Weitere Ressourcen

- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Playwright Testing](https://playwright.dev/)

## Changelog

### v1.0.0 (2024-12-31)
- Initial AppShell Implementation
- Responsive Sidebar
- Navigation Config System
- Mobile Bottom Nav
- E2E Tests Setup
