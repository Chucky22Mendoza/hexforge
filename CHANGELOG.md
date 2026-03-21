# Changelog

All notable changes to **hexforge** will be documented in this file.

---

## [1.3.1] — 2026-03-21

### 🐛 Fixed
- **Npx Registry Resolution**: Fixed an issue where executing `npx hexforge-create` or `npx hexforge-module` natively would force npm to search the public registry for non-existent packages.
- **Centralized Router**: Introduced a master entrypoint router (`bin/hexforge.js`) internally resolving all commands to prevent package routing bugs when executing from the environment.

### 💅 Refactored
- **Strict CLI Syntax**: The CLI syntax has been strictly simplified and standardized. The legacy `create` verb has been fully dropped in favor of absolute, clean minimalism:
  - **Create App**: `npx hexforge [react|next] <name>`
  - **Add Module**: `npx hexforge module <name>`

---

## [1.2.0] — 2026-03-21

### ♻️ CLI Restructure & Simplification
- **Unified Scaffold Command**: Merged `hexforge-create-react` and `hexforge-create-next` into a single intuitive `hexforge [react|next] <name>` command, omitting the need for the `create` verb entirely.
- **Smart Module Command**: The `hexforge module <Name>` command now automatically detects whether it is running within a React or Next.js project and applies the correct template generation.
- **Clean Environment**: Reduced the number of exposed executable binaries in `package.json` for a more organized developer experience.

### ✨ Features
- **Global Helper Flags**: Added elegant, visually pleasing terminal output for `-v` / `--version` to check CLI versions and `-h` / `--help` to easily preview the CLI signature directly in the terminal.
- **Project Boundary Safeguards**: The `hexforge module` generator now intelligently aborts execution to prevent unintended scaffolding if triggered outside a valid React or Next.js project root.

---

## [1.1.0] — 2026-03-21

### ✨ Features
- **Modern Minimalist UI**: Enhanced the initial module scaffolding (`section.ejs`) to showcase a polished, modern, and branded design right out of the box.
- **Conditional Styling Ecosystem**: Added flexible styling support across all generated modules, allowing components to adapt to user preferences.
- **CSS Modules Fallback**: Introduced runtime generation of scoped `*.module.css` files for module components when users opt out of Tailwind CSS.
- **CLI Workflow Updates**: CLI toolkits securely assess and propagate the `useTailwind` configuration to EJS templates, ensuring consistent styling generation across React and Next.js targets.

---

## [1.0.1] — 2026-03-19

### Fixed
- Added a default `hexforge` executable to `package.json` so `npx hexforge <name>` works properly out of the box, defaulting to scaffolding a React project.

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

- **Auto router injection** (React) — `hexforge module` reads `Router.tsx` and inserts the new `import` and `<Route>` automatically using anchor comments:
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
