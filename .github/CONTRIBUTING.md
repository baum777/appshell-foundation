# Contributing to TradeApp

Vielen Dank für dein Interesse, zu TradeApp beizutragen! 🎉

## Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Entwicklungs-Setup](#entwicklungs-setup)
- [Workflow](#workflow)
- [Coding Standards](#coding-standards)
- [Commit-Konventionen](#commit-konventionen)
- [Pull Request Prozess](#pull-request-prozess)
- [Testing](#testing)
- [Dokumentation](#dokumentation)

## Code of Conduct

- Sei respektvoll und inklusiv
- Konstruktives Feedback ist willkommen
- Fokus auf sachliche Diskussionen
- Hilf anderen, wenn möglich

## Entwicklungs-Setup

### Voraussetzungen

- Node.js 20.x oder höher
- npm oder yarn
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/tradeapp.git
cd tradeapp

# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Tests ausführen
npm run test:e2e
```

### Umgebungsvariablen

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_DEV_NAV=true
VITE_ENABLE_ANALYTICS=false
```

## Workflow

### 1. Branch erstellen

Erstelle einen neuen Branch von `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

**Branch-Naming-Konventionen:**

- `feature/` - Neue Features
- `fix/` - Bugfixes
- `docs/` - Dokumentation
- `refactor/` - Code-Refactoring
- `test/` - Test-Ergänzungen
- `chore/` - Build-Prozess, Dependencies

### 2. Entwickeln

- Folge den [Coding Standards](#coding-standards)
- Schreibe Tests für neue Funktionalität
- Committe häufig mit aussagekräftigen Nachrichten

### 3. Testen

```bash
# Linting
npm run lint

# Type Checking
npx tsc --noEmit

# E2E Tests
npm run test:e2e
```

### 4. Pull Request erstellen

Siehe [Pull Request Prozess](#pull-request-prozess)

## Coding Standards

### TypeScript

- Verwende TypeScript für alle neuen Dateien
- Definiere explizite Typen für Function Parameters und Returns
- Vermeide `any` - nutze `unknown` wenn nötig
- Nutze Interfaces für Objekt-Shapes

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React

- Verwende funktionale Komponenten mit Hooks
- Props sollten typisiert sein
- Verwende `data-testid` für testbare Elemente
- Nutze React.memo() für teure Komponenten

```tsx
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      data-testid="custom-button"
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

### Styling

- Verwende Tailwind CSS Utility-Classes
- Nutze `cn()` Utility für bedingte Klassen
- Vermeide inline-styles (außer dynamische Werte)
- Folge Mobile-First Ansatz

```tsx
// ✅ Good
<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-primary text-primary-foreground",
  "md:flex-row md:gap-4"
)}>
  {/* ... */}
</div>

// ❌ Bad
<div style={{ display: 'flex', alignItems: 'center' }}>
  {/* ... */}
</div>
```

### Dateistruktur

```
src/
├── components/
│   ├── ui/              # Basis UI-Komponenten
│   └── feature/         # Feature-spezifische Komponenten
├── pages/               # Route-Level Komponenten
├── services/            # API Services
├── lib/                 # Utilities
├── hooks/               # Custom Hooks
└── config/              # Konfigurationen
```

### Komponenten-Organisation

```tsx
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Event Handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

## Commit-Konventionen

Wir folgen dem [Conventional Commits](https://www.conventionalcommits.org/) Standard:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Neues Feature
- `fix`: Bugfix
- `docs`: Dokumentation
- `style`: Formatierung, fehlende Semikolons
- `refactor`: Code-Umstrukturierung
- `perf`: Performance-Verbesserung
- `test`: Tests hinzufügen/ändern
- `chore`: Build-Prozess, Dependencies

### Beispiele

```bash
# Feature
git commit -m "feat(journal): Add export to CSV functionality"

# Bugfix
git commit -m "fix(sidebar): Correct collapse animation on mobile"

# Breaking Change
git commit -m "feat(api)!: Change authentication endpoint

BREAKING CHANGE: The /auth endpoint now requires a different payload structure."

# Mit Scope und Body
git commit -m "refactor(dashboard): Simplify KPI calculation logic

Extracted complex calculation into separate utility function for better testability and reusability."
```

## Pull Request Prozess

### 1. Vorbereitung

- Stelle sicher, dass alle Tests passen
- Führe Linting und Type-Check aus
- Rebase auf aktuellen `develop` Branch
- Löse alle Merge-Konflikte

```bash
git checkout develop
git pull origin develop
git checkout your-branch
git rebase develop
```

### 2. PR erstellen

- Verwende das PR-Template
- Füge aussagekräftigen Titel hinzu (folgt Commit-Convention)
- Beschreibe die Änderungen im Detail
- Füge Screenshots hinzu (bei UI-Änderungen)
- Verlinke verwandte Issues

### 3. Code Review

- Mindestens 1 Approval erforderlich
- Reagiere auf Feedback konstruktiv
- Mache requested Changes zeitnah
- Diskutiere bei Unklarheiten

### 4. Merge

- Squash and Merge wird bevorzugt
- Stelle sicher, dass CI/CD grün ist
- Lösche Branch nach Merge

## Testing

### E2E Tests (Playwright)

```bash
# Alle Tests ausführen
npm run test:e2e

# Spezifische Test-Datei
npx playwright test navigation.spec.ts

# Mit UI
npm run test:e2e:ui

# Debug Mode
npm run test:e2e:debug
```

### Test Best Practices

- ✅ Verwende `data-testid` für Selektoren
- ✅ Nutze `waitFor` statt fixer Timeouts
- ✅ Teste User-Verhalten, nicht Implementation
- ✅ Isoliere Tests voneinander
- ❌ Vermeide fragile CSS-Selektoren
- ❌ Keine abhängigen Tests

```typescript
// ✅ Good
test('should navigate to journal', async ({ page }) => {
  await page.click('[data-testid="nav-journal"]');
  await expect(page).toHaveURL('/journal');
});

// ❌ Bad
test('should navigate to journal', async ({ page }) => {
  await page.click('.sidebar > nav > a:nth-child(2)');
  await page.waitForTimeout(1000);
  expect(page.url()).toContain('journal');
});
```

## Dokumentation

### Code-Kommentare

- Kommentiere das "Warum", nicht das "Was"
- Nutze JSDoc für öffentliche APIs
- Erkläre komplexe Algorithmen
- Vermeide offensichtliche Kommentare

```typescript
// ✅ Good
/**
 * Calculates Sharpe Ratio for given returns
 * @param returns Array of return values
 * @param riskFreeRate Risk-free rate (default: 2%)
 * @returns Sharpe Ratio or 0 if calculation not possible
 */
function calculateSharpeRatio(returns: number[], riskFreeRate = 0.02): number {
  // Return 0 early if no data to avoid division by zero
  if (returns.length === 0) return 0;
  
  // ...
}

// ❌ Bad
// This function calculates the Sharpe Ratio
function calculateSharpeRatio(returns: number[]): number {
  // Loop through returns
  for (const r of returns) {
    // Add to sum
    sum += r;
  }
}
```

### README Updates

- Aktualisiere README bei neuen Features
- Füge Setup-Schritte für neue Dependencies hinzu
- Dokumentiere neue Environment Variables

## Fragen?

Bei Fragen kannst du:

- Ein Issue erstellen
- In Diskussionen nachfragen
- Das Team kontaktieren

Vielen Dank für deine Beiträge! 🚀
