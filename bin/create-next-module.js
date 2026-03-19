#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║             hexforge — create-next-module.js                    ║
 * ║       Hexagonal Architecture Scaffolding for Next.js            ║
 * ║                                                                  ║
 * ║  CLI command : hexforge-next-module <ModuleName>                    ║
 * ║  Author      : Jesús Mendoza Verduzco                           ║
 * ║  License     : ISC                                              ║
 * ║  Version     : 1.0.0                                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Generates a full hexagonal-architecture module for a Next.js App Router
 * project and automatically creates the corresponding page route.
 *
 * Key difference vs React (create-module.js):
 *   - ViewFactory uses 'use client' directive (App Router client boundary)
 *   - LanguageContext uses 'use client' directive
 *   - No Router.tsx injection — creates src/app/<name>/page.tsx instead
 *
 * Generated structure:
 *   src/modules/<name>/
 *     ├── domain/             → Entity / domain model
 *     ├── infrastructure/     → API repository implementation
 *     ├── repository/         → Repository interface / contract
 *     ├── hooks/              → Business-logic hook (use<Name>)
 *     ├── store/              → Zustand state slice (use<Name>Store)
 *     ├── sections/           → React view component
 *     ├── translations/       → i18n keys (es, en, index)
 *     └── <Name>ViewFactory.tsx  ← 'use client' boundary
 *   src/app/<name>/
 *     └── page.tsx            ← Next.js App Router page (Server Component)
 */

import ejs from 'ejs';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  generateDateUtils,
  generateLanguageContext,
  generateResponseWrapper,
  generateFetch,
  generateConfig,
} from './create-module.js';
import { printBanner } from './banner.js';

// ---------------------------------------------------------------------------
// ESM-compatible __dirname
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Template paths
// ---------------------------------------------------------------------------

/** Shared templates — used by both React and Next.js generators. */
const SHARED = {
  domain:         path.join(__dirname, '../templates/shared/domain.ejs'),
  infrastructure: path.join(__dirname, '../templates/shared/infrastructure.ejs'),
  repository:     path.join(__dirname, '../templates/shared/repository.ejs'),
  hook:           path.join(__dirname, '../templates/shared/hook.ejs'),
  section:        path.join(__dirname, '../templates/shared/section.ejs'),
  store:          path.join(__dirname, '../templates/shared/store.ejs'),
  es:             path.join(__dirname, '../templates/shared/es.ejs'),
  en:             path.join(__dirname, '../templates/shared/en.ejs'),
  translations:   path.join(__dirname, '../templates/shared/translations.ejs'),
  config:         path.join(__dirname, '../templates/shared/config.ejs'),
  responseWrapper: path.join(__dirname, '../templates/shared/response-wrapper.ejs'),
  fetch:          path.join(__dirname, '../templates/shared/fetch.ejs'),
  date:           path.join(__dirname, '../templates/shared/date.ejs'),
};

/** Next.js-specific templates — include 'use client' or App Router structure. */
const NEXT = {
  viewFactory:     path.join(__dirname, '../templates/next/view-factory.ejs'),
  languageContext: path.join(__dirname, '../templates/next/language-context.ejs'),
  page:            path.join(__dirname, '../templates/next/page.ejs'),
  homePage:        path.join(__dirname, '../templates/next/home-page.ejs'),
  layout:          path.join(__dirname, '../templates/next/layout.ejs'),
};

// ---------------------------------------------------------------------------
// Core helper
// ---------------------------------------------------------------------------

/**
 * Renders an EJS template and writes the result to disk.
 *
 * @param {string} name         - PascalCase module name passed to the template.
 * @param {string} templatePath - Absolute path to the .ejs template file.
 * @param {string} targetPath   - Absolute path where the output file will be written.
 * @returns {Promise<void>}
 */
async function generateFile(name, templatePath, targetPath) {
  const content = await ejs.renderFile(templatePath, { name });
  await fs.outputFile(targetPath, content);
}

// ---------------------------------------------------------------------------
// Module generators
// ---------------------------------------------------------------------------

/**
 * Scaffolds all hexagonal module files for a Next.js project.
 *
 * Uses `next-view-factory.ejs` — which includes the `'use client'` directive —
 * instead of the standard `view-factory.ejs` used in React/Vite projects.
 * This marks the ViewFactory as the client component boundary in App Router.
 *
 * @param {string} name      - PascalCase module name (e.g. "Product").
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function nextModuleFiles(name, targetDir) {
  const nameLower  = name.toLowerCase();
  const modulePath = path.join(targetDir, 'modules', nameLower);

  await Promise.all([
    generateFile(name, SHARED.domain,         path.join(modulePath, 'domain',        `${nameLower}.ts`)),
    generateFile(name, SHARED.infrastructure,  path.join(modulePath, 'infrastructure', `API${name}Repository.ts`)),
    generateFile(name, SHARED.hook,            path.join(modulePath, 'hooks',         `use${name}.ts`)),
    generateFile(name, SHARED.section,         path.join(modulePath, 'sections',      `${name}.tsx`)),
    generateFile(name, SHARED.store,           path.join(modulePath, 'store',         `use${name}Store.ts`)),
    generateFile(name, SHARED.repository,      path.join(modulePath, 'repository',    `${name}Repository.ts`)),
    // ↓ Next.js-specific: 'use client' directive required for App Router
    generateFile(name, NEXT.viewFactory,       path.join(modulePath,                  `${name}ViewFactory.tsx`)),
    generateFile(name, SHARED.es,              path.join(modulePath, 'translations',  'es.ts')),
    generateFile(name, SHARED.en,              path.join(modulePath, 'translations',  'en.ts')),
    generateFile(name, SHARED.translations,    path.join(modulePath, 'translations',  'index.ts')),
  ]);
}

/**
 * Creates the Next.js App Router page for a module.
 *
 * The page is a Server Component that simply renders the ViewFactory
 * (which handles the 'use client' boundary internally).
 *
 * Output: src/app/<name>/page.tsx
 *
 * @param {string} name      - PascalCase module name (e.g. "Product").
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateNextPage(name, targetDir) {
  const content = await ejs.renderFile(NEXT.page, { name });
  await fs.outputFile(path.join(targetDir, 'app', name.toLowerCase(), 'page.tsx'), content);
}

/**
 * Creates/overwrites the root home page (src/app/page.tsx).
 * Replaces the default create-next-app placeholder page.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateNextHomePage(targetDir) {
  const content = await ejs.renderFile(NEXT.homePage);
  await fs.outputFile(path.join(targetDir, 'app', 'page.tsx'), content);
}

/**
 * Creates/overwrites the Next.js root layout (src/app/layout.tsx).
 * Preserves the globals.css import from create-next-app.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @param {string} name        - PascalCase Project Name (e.g. "My App").
 * @returns {Promise<void>}
 */
export async function generateNextLayout(targetDir, name) {
  const content = await ejs.renderFile(NEXT.layout, { name });
  await fs.outputFile(path.join(targetDir, 'app', 'layout.tsx'), content);
}

/**
 * Generates the LanguageContext with the 'use client' directive.
 *
 * In Next.js App Router, React Context API requires 'use client' since
 * it relies on browser-side state. This overrides the React version.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateNextLanguageContext(targetDir) {
  const content = await ejs.renderFile(NEXT.languageContext);
  await fs.outputFile(path.join(targetDir, 'context', 'LanguageContext.tsx'), content);
}

/**
 * Bootstraps the full initial file structure for a new Next.js Hexforge project.
 *
 * Differences from React's initFiles:
 *   - No router generation (App Router handles routing via the file system)
 *   - No App.tsx (Next.js uses app/layout.tsx + app/page.tsx)
 *   - LanguageContext includes 'use client'
 *   - ViewFactory includes 'use client'
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @param {string} name        - PascalCase Project Name (e.g. "My App").
 * @returns {Promise<void>}
 */
export async function initNextFiles(targetDir, name) {
  // All independent files generated concurrently
  await Promise.all([
    nextModuleFiles('Home', targetDir),
    generateResponseWrapper(targetDir),
    generateFetch(targetDir),
    generateDateUtils(targetDir),
    generateNextLanguageContext(targetDir),
    generateConfig(targetDir),
    generateNextLayout(targetDir, name),
  ]);

  // Home page must run after the Home module is created
  await generateNextHomePage(targetDir);
}

// ---------------------------------------------------------------------------
// CLI entry-point — only runs when invoked directly as `hexforge-next-module <Name>`
// ---------------------------------------------------------------------------
const isMain = import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;

if (isMain) {
  const moduleName = process.argv[2];

  printBanner({
    command     : 'hexforge-next-module',
    description : 'Next.js hexagonal module generator',
  });

  if (!moduleName) {
    console.error('❌ Module name is required.\n   Usage: hexforge-next-module <ModuleName>\n   Example: hexforge-next-module Product');
    process.exit(1);
  }

  // Normalise to PascalCase
  const componentName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const targetDir     = path.join(process.cwd(), 'src');

  console.log(`⚙️  Generating Next.js module: ${componentName}\n`);

  try {
    await nextModuleFiles(componentName, targetDir);
    await generateNextPage(componentName, targetDir);
    console.log(`\n✅ Module "${componentName}" created at src/modules/${componentName.toLowerCase()}`);
    console.log(`🔗 Page created at src/app/${componentName.toLowerCase()}/page.tsx`);
  } catch (err) {
    console.error('❌ Error generating module:', err.message);
    process.exit(1);
  }
}
