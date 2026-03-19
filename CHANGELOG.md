# Changelog

All notable changes to **hexforge** will be documented in this file.

---

## [1.0.0] — 2026-03-19

### ⚒️ Initial Release

First public release of **hexforge** — a CLI scaffolding tool for React and Next.js projects following Hexagonal Architecture (Ports & Adapters).

---

### ✨ New Commands

| Command | Description |
|---|---|
| `hexforge-create-react <name>` | Scaffold a new React + Vite + TypeScript project with hexagonal structure |
| `hexforge-module <ModuleName>` | Generate a hexagonal module and auto-inject its route into `Router.tsx` |
| `hexforge-create-next <name>` | Scaffold a new Next.js App Router + TypeScript project with hexagonal structure |
| `hexforge-next-module <ModuleName>` | Generate a hexagonal module and create its `app/<name>/page.tsx` page |

---

### 🏗️ Architecture

Every project and module is generated following **Hexagonal Architecture**:

```
modules/<name>/
  domain/           → TypeScript entity / domain model
  infrastructure/   → API repository implementation (APINameRepository.ts)
  repository/       → Repository interface / port (NameRepository.ts)
  hooks/            → Business logic hook (useName.ts)
  store/            → Zustand state slice (useNameStore.ts)
  sections/         → React view component (Name.tsx)
  translations/     → i18n keys: es.ts · en.ts · index.ts
  NameViewFactory.tsx → Module entry-point (wraps LanguageProvider + Section)
```

---

### 📦 Generated Stack

#### React projects (`hexforge-create-react`)
- **Vite** + React + TypeScript
- **React Router DOM** — file-based routing via `Router.tsx`
- **Zustand** — global state management
- **date-fns** + **date-fns-tz** — date utilities
- **Tailwind CSS** *(optional, prompted during creation)*
- Custom `index.html` with `hexforge` meta tags

#### Next.js projects (`hexforge-create-next`)
- **Next.js 15** App Router + TypeScript
- **Zustand** — global state management
- **date-fns** + **date-fns-tz** — date utilities
- **Tailwind CSS** *(optional, prompted during creation)*
- Custom `app/layout.tsx` with `hexforge` metadata
- `'use client'` directive pre-applied to `ViewFactory` and `LanguageContext`

---

### 🌟 Features

- **Auto router injection** (React) — `hexforge-module` reads `Router.tsx` and inserts the new `import` and `<Route>` automatically using anchor comments:
  ```
  // @factory-imports — ⚠️ DO NOT REMOVE
  {/* @factory-routes — ⚠️ DO NOT REMOVE */}
  ```

- **Auto page creation** (Next.js) — `hexforge-next-module` creates `src/app/<name>/page.tsx` as a Server Component that renders the module's `ViewFactory`.

- **Built-in i18n** — Every module includes a `LanguageContext` provider with Spanish/English translation support and a `useLanguage()` hook.

- **Parallel file generation** — All independent template files are generated concurrently using `Promise.all` for maximum speed.

- **Branded projects** — All generated files include hexforge metadata:
  - React: `<meta name="generator" content="hexforge v1.0.0" />` in `index.html`
  - Next.js: `generator: 'hexforge v1.0.0'` in `app/layout.tsx` metadata

- **Terminal banner** — Both CLI tools display a styled ASCII banner with ANSI colors on startup (zero external color dependencies).

- **Windows-compatible** — All `execSync` calls use `shell: true` to correctly resolve npm/npx `.cmd` scripts on Windows.

- **npm link compatible** — The `isMain` check uses `import.meta.url` + `fs.realpathSync(process.argv[1])` to correctly resolve symlinks created by `npm link`.

- **Modular templates** — Templates are organized into three subdirectories:
  ```
  templates/
    shared/   ← used by both React and Next.js
    react/    ← React/Vite-specific (Router, Layout, App, ViewFactory)
    next/     ← Next.js-specific ('use client', App Router pages, layout)
  ```

---

### 🧱 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `ejs` | `^5.0.1` | EJS template rendering |
| `fs-extra` | `^11.3.4` | Enhanced file system operations |

---

### 🔗 Links

- npm: https://www.npmjs.com/package/hexforge
- GitHub: https://github.com/Chucky22Mendoza/hexforge

---

### 👤 Author

**Jesús Mendoza Verduzco** — loginlock22@gmail.com
