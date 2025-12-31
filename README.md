# TradeApp - Trading Journal & Learning Platform

Eine moderne, umfassende Trading-Plattform, die Trader dabei unterstützt, ihre Performance zu verfolgen, aus ihren Trades zu lernen und ihre Fähigkeiten kontinuierlich zu verbessern.

## 🎯 Features

- **📊 Dashboard**: Übersicht über wichtigste Trading-Metriken und KPIs
- **📓 Trading Journal**: Detaillierte Dokumentation aller Trades mit Screenshots und Analysen
- **📈 Chart-Analyse**: Technische Analyse mit verschiedenen Indikatoren und Replay-Funktionen
- **👁️ Watchlist**: Verwaltung interessanter Assets mit Live-Preisen
- **🔮 AI Oracle**: KI-gestützte Insights und personalisierte Empfehlungen
- **📚 Learning Hub**: Strukturierte Lernmodule für Trading-Ausbildung
- **🔔 Alerts**: Preisalarme und Benachrichtigungen
- **⚙️ Settings**: Umfassende Einstellungen und Präferenzen

## 🏗️ Architektur

### Tech Stack

- **React 18.3** - UI Framework
- **TypeScript 5.8** - Type Safety
- **Vite 5.4** - Build Tool & Dev Server
- **Tailwind CSS 3.4** - Utility-First CSS
- **shadcn/ui** - Komponenten-Bibliothek
- **React Router 6.30** - Client-Side Routing
- **TanStack Query 5.83** - Server State Management
- **Playwright** - E2E Testing

### Projektstruktur

```
/workspace
├── src/
│   ├── components/          # React Komponenten
│   │   ├── ui/             # Basis UI-Komponenten (shadcn/ui)
│   │   ├── layout/         # Layout-Komponenten (AppShell, Header, Sidebar)
│   │   └── [feature]/      # Feature-spezifische Komponenten
│   ├── pages/              # Routen-Level Komponenten
│   ├── services/           # API Services & Backend-Integration
│   │   ├── api/           # API Client
│   │   ├── trading/       # Trading Services (Journal, etc.)
│   │   ├── analytics/     # Analytics Services
│   │   └── auth/          # Auth Services
│   ├── lib/               # Utility-Funktionen
│   ├── hooks/             # Custom React Hooks
│   ├── config/            # Konfigurationsdateien
│   └── stubs/             # Mock-Daten für Entwicklung
├── playwright/            # E2E Tests
│   ├── tests/
│   └── fixtures/
├── .github/              # GitHub Actions Workflows
├── product_spec.md       # Produkt-Spezifikation
└── tech_spec.md         # Technische Spezifikation
```

## 🚀 Quick Start

### Voraussetzungen

- Node.js 20.x oder höher
- npm oder yarn

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd workspace

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die Anwendung läuft nun auf `http://localhost:5173`

### Verfügbare Scripts

```bash
# Development
npm run dev              # Startet Dev Server mit HMR

# Build
npm run build           # Production Build
npm run build:dev       # Development Build
npm run preview         # Preview Production Build

# Code Quality
npm run lint            # ESLint ausführen
npx tsc --noEmit        # TypeScript Type Check

# Testing
npm run test:e2e        # E2E Tests ausführen
npm run test:e2e:ui     # E2E Tests mit UI
npm run test:e2e:headed # E2E Tests im Browser
npm run test:e2e:debug  # E2E Tests im Debug-Mode
npm run test:e2e:report # Test Report anzeigen
```

## 🧪 Testing

### E2E Tests mit Playwright

```bash
# Installation der Browser (einmalig)
npx playwright install

# Alle Tests ausführen
npm run test:e2e

# Spezifischen Test ausführen
npx playwright test navigation.spec.ts

# Tests im UI-Mode (empfohlen für Entwicklung)
npm run test:e2e:ui

# Tests im Debug-Mode
npm run test:e2e:debug
```

### Test-Struktur

- `playwright/tests/navigation.spec.ts` - Navigation Tests
- `playwright/tests/dashboard.spec.ts` - Dashboard Tests
- `playwright/tests/journal.spec.ts` - Journal Tests
- `playwright/fixtures/test-data.ts` - Test-Fixtures

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Nutze explizite Typen, vermeide `any`
- **React**: Funktionale Komponenten mit Hooks
- **Styling**: Tailwind CSS Utility-Classes, Mobile-First
- **Testing**: `data-testid` für stabile Selektoren

### Commit-Konventionen

Wir folgen [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(scope): Add new feature
fix(scope): Fix bug
docs: Update documentation
style: Format code
refactor(scope): Refactor code
test: Add tests
chore: Update dependencies
```

### Branch-Strategy

```
main           # Production
├── develop    # Integration
    ├── feature/your-feature
    ├── fix/your-bugfix
    └── refactor/your-refactor
```

Siehe [CONTRIBUTING.md](.github/CONTRIBUTING.md) für Details.

## 🏛️ AppShell Foundation Pattern

Die Anwendung basiert auf dem **AppShell Foundation Pattern**, das eine konsistente Layout-Struktur für alle Seiten bietet:

### Komponenten

- **AppShell**: Haupt-Layout-Container
  - **Sidebar**: Desktop-Navigation (collapsible)
  - **Header**: Top-Bar mit Notifications und User-Menu
  - **BottomNav**: Mobile-Navigation
  - **Main Content**: Dynamischer Seiteninhalt

### Navigation als Konfiguration

Die Navigation ist zentral in `src/config/navigation.ts` konfiguriert:

```typescript
export const primaryNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    testId: "nav-dashboard",
  },
  // ...
];
```

**Vorteile:**
- Zentrale Verwaltung aller Routes
- Type-Safety
- Feature-Flags für schrittweises Rollout
- Einfaches Testing

### Responsive Design

- **Mobile (< 768px)**: Bottom Navigation, keine Sidebar
- **Tablet (768-1024px)**: Sidebar sichtbar
- **Desktop (> 1024px)**: Sidebar sichtbar und collapsible

## 🔒 Services Layer

### API Client

Zentraler HTTP-Client in `src/services/api/client.ts`:

```typescript
import { apiClient } from '@/services';

// GET Request
const response = await apiClient.get<User[]>('/users');

// POST Request
const response = await apiClient.post<User>('/users', userData);
```

### Service-Kategorien

1. **Trading Services** (`services/trading/`)
   - Journal-Service
   - Chart-Data-Service
   - Watchlist-Service

2. **Analytics Services** (`services/analytics/`)
   - Performance-Analytics
   - Trade-Statistics

3. **Auth Services** (`services/auth/`)
   - Authentication
   - Session-Management

Siehe [tech_spec.md](./tech_spec.md) für Details.

## 🔄 CI/CD

### GitHub Actions Workflows

- **CI Pipeline** (`.github/workflows/ci.yml`)
  - Linting & Type Check
  - Build
  - E2E Tests (Chromium, Firefox)
  - Security Audit
  - Lighthouse Performance

- **PR Checks** (`.github/workflows/pr-checks.yml`)
  - PR Metadata Check
  - File Size Check
  - Bundle Size Impact
  - Dependency Review

- **Deployment** (`.github/workflows/deploy.yml`)
  - Staging Deployment
  - Production Deployment
  - Smoke Tests
  - Release Creation

### Pre-Commit Checks

Vor jedem Commit werden automatisch ausgeführt:
- ESLint
- TypeScript Type Check
- Prettier (falls konfiguriert)

## 📚 Dokumentation

- **[Product Spec](./product_spec.md)**: Produktanforderungen und User Stories
- **[Tech Spec](./tech_spec.md)**: Technische Architektur und Implementierungsdetails
- **[Contributing Guide](./.github/CONTRIBUTING.md)**: Wie man zum Projekt beiträgt
- **[PR Template](./.github/PULL_REQUEST_TEMPLATE.md)**: Template für Pull Requests

## 🔧 Konfiguration

### Environment Variables

Erstelle eine `.env.local` Datei:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_DEV_NAV=false
VITE_ENABLE_ANALYTICS=false
VITE_APP_VERSION=0.1.0
```

### Playwright Configuration

Konfiguration in `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Timeout: 30s
- Retries: 2 (nur auf CI)
- Browsers: Chromium, Firefox, Webkit, Mobile Chrome, Mobile Safari

## 🐛 Troubleshooting

### Port bereits in Verwendung

```bash
# Finde Prozess auf Port 5173
lsof -ti:5173

# Beende Prozess
kill -9 <PID>
```

### Build-Fehler

```bash
# Cache löschen
rm -rf node_modules dist
npm install
npm run build
```

### Test-Fehler

```bash
# Browser neu installieren
npx playwright install --with-deps

# Tests einzeln ausführen
npx playwright test navigation.spec.ts --debug
```

## 📈 Roadmap

### Phase 1: MVP (Aktuell)
- ✅ AppShell und Navigation
- ✅ Dashboard mit Basis-Metriken
- ✅ Trading Journal CRUD
- ✅ Services Layer
- ✅ E2E Testing Setup
- ✅ CI/CD Pipeline

### Phase 2: Erweiterte Features (Q1 2026)
- Erweiterte Chart-Analyse
- AI Oracle Implementation
- Export-Funktionen
- Erweiterte Statistiken

### Phase 3: Community (Q2 2026)
- Sharing-Features
- Community-Insights
- Social Features

Siehe [product_spec.md](./product_spec.md) für Details.

## 🤝 Contributing

Beiträge sind willkommen! Bitte lies [CONTRIBUTING.md](.github/CONTRIBUTING.md) für Details zum Entwicklungsprozess.

### Quick Contribution Guide

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'feat: Add AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 License

[MIT License](LICENSE) - siehe LICENSE Datei für Details.

## 👥 Team

- **Product Owner**: [Name]
- **Tech Lead**: [Name]
- **Contributors**: Siehe [Contributors](../../graphs/contributors)

## 📞 Support

Bei Fragen oder Problemen:
- Erstelle ein [Issue](../../issues)
- Kontaktiere das Team
- Lies die [Dokumentation](./tech_spec.md)

---

**Gebaut mit ❤️ und TypeScript**
