#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                  hexforge — create-module.js                    ║
 * ║         Hexagonal Architecture Scaffolding for React            ║
 * ║                                                                  ║
 * ║  CLI command : hexforge-module <ModuleName>                         ║
 * ║  Author      : Jesús Mendoza Verduzco                           ║
 * ║  License     : ISC                                              ║
 * ║  Version     : 1.0.0                                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Generates a full hexagonal-architecture module under src/modules/<name>
 * and automatically registers the new route in the project's Router.tsx.
 *
 * Generated structure:
 *   src/modules/<name>/
 *     ├── domain/           → Entity / domain model
 *     ├── infrastructure/   → API repository implementation
 *     ├── repository/       → Repository interface / contract
 *     ├── hooks/            → Business-logic hook (use<Name>)
 *     ├── store/            → Zustand state slice (use<Name>Store)
 *     ├── sections/         → React view component
 *     ├── translations/     → i18n keys (es, en, index)
 *     └── <Name>ViewFactory.tsx → Module entry-point wrapper
 */

import ejs from 'ejs';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { printBanner } from './banner.js';

// ---------------------------------------------------------------------------
// ESM-compatible __dirname
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Template paths — centralised so every generator function references
// the same source of truth.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Shared templates — used by both React and Next.js generators
// ---------------------------------------------------------------------------
const SHARED = {
  domain:          path.join(__dirname, '../templates/shared/domain.ejs'),
  fetch:           path.join(__dirname, '../templates/shared/fetch.ejs'),
  hook:            path.join(__dirname, '../templates/shared/hook.ejs'),
  infrastructure:  path.join(__dirname, '../templates/shared/infrastructure.ejs'),
  repository:      path.join(__dirname, '../templates/shared/repository.ejs'),
  responseWrapper: path.join(__dirname, '../templates/shared/response-wrapper.ejs'),
  section:         path.join(__dirname, '../templates/shared/section.ejs'),
  store:           path.join(__dirname, '../templates/shared/store.ejs'),
  date:            path.join(__dirname, '../templates/shared/date.ejs'),
  translations:    path.join(__dirname, '../templates/shared/translations.ejs'),
  es:              path.join(__dirname, '../templates/shared/es.ejs'),
  en:              path.join(__dirname, '../templates/shared/en.ejs'),
  config:          path.join(__dirname, '../templates/shared/config.ejs'),
};

// ---------------------------------------------------------------------------
// React-specific templates — Vite / React Router / no 'use client'
// ---------------------------------------------------------------------------
const TEMPLATES = {
  ...SHARED,
  viewFactory:    path.join(__dirname, '../templates/react/view-factory.ejs'),
  app:            path.join(__dirname, '../templates/react/app.ejs'),
  router:         path.join(__dirname, '../templates/react/router.ejs'),
  languageContext: path.join(__dirname, '../templates/react/language-context.ejs'),
  layout:         path.join(__dirname, '../templates/react/layout.ejs'),
  indexHtml:      path.join(__dirname, '../templates/react/index-html.ejs'),
};

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Renders an EJS template and writes the result to disk.
 *
 * @param {string}      name         - PascalCase module name passed to the template.
 * @param {string}      templatePath - Absolute path to the .ejs template file.
 * @param {string}      targetPath   - Absolute path where the output file will be written.
 * @returns {Promise<void>}
 */
async function generateFile(name, templatePath, targetPath) {
  const content = await ejs.renderFile(templatePath, { name });
  await fs.outputFile(targetPath, content);
}

// ---------------------------------------------------------------------------
// Module generators — each function is responsible for one cohesive concern.
// ---------------------------------------------------------------------------

/**
 * Scaffolds all files for a single hexagonal module.
 *
 * @param {string} name      - PascalCase module name (e.g. "Product").
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function moduleFiles(name, targetDir) {
  const nameLower  = name.toLowerCase();
  const modulePath = path.join(targetDir, 'modules', nameLower);

  await Promise.all([
    generateFile(name, TEMPLATES.domain,         path.join(modulePath, 'domain',        `${nameLower}.ts`)),
    generateFile(name, TEMPLATES.infrastructure,  path.join(modulePath, 'infrastructure', `API${name}Repository.ts`)),
    generateFile(name, TEMPLATES.hook,            path.join(modulePath, 'hooks',         `use${name}.ts`)),
    generateFile(name, TEMPLATES.section,         path.join(modulePath, 'sections',      `${name}.tsx`)),
    generateFile(name, TEMPLATES.store,           path.join(modulePath, 'store',         `use${name}Store.ts`)),
    generateFile(name, TEMPLATES.repository,      path.join(modulePath, 'repository',    `${name}Repository.ts`)),
    generateFile(name, TEMPLATES.viewFactory,     path.join(modulePath,                  `${name}ViewFactory.tsx`)),
    generateFile(name, TEMPLATES.es,              path.join(modulePath, 'translations',  'es.ts')),
    generateFile(name, TEMPLATES.en,              path.join(modulePath, 'translations',  'en.ts')),
    generateFile(name, TEMPLATES.translations,    path.join(modulePath, 'translations',  'index.ts')),
  ]);
}

/**
 * Generates the shared date utility file.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateDateUtils(targetDir) {
  const content = await ejs.renderFile(TEMPLATES.date);
  await fs.outputFile(path.join(targetDir, 'utils', 'date.ts'), content);
}

/**
 * Generates the application router (Router.tsx) seeded with the given module.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @param {string} name      - PascalCase name of the initial module (e.g. "Home").
 * @returns {Promise<void>}
 */
export async function generateRouter(targetDir, name) {
  const content = await ejs.renderFile(TEMPLATES.router, { name });
  await fs.outputFile(path.join(targetDir, 'router', 'Router.tsx'), content);
}

/**
 * Generates the root App.tsx file.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateApp(targetDir) {
  const content = await ejs.renderFile(TEMPLATES.app);
  await fs.outputFile(path.join(targetDir, 'App.tsx'), content);
}

/**
 * Generates the LanguageContext provider for i18n support.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateLanguageContext(targetDir) {
  const content = await ejs.renderFile(TEMPLATES.languageContext);
  await fs.outputFile(path.join(targetDir, 'context', 'LanguageContext.tsx'), content);
}

/**
 * Generates the shared ResponseWrapper type definition.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateResponseWrapper(targetDir) {
  const content = await ejs.renderFile(TEMPLATES.responseWrapper);
  await fs.outputFile(path.join(targetDir, 'modules', 'shared', 'types', 'response-wrapper.ts'), content);
}

/**
 * Generates the shared fetch helper utility.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateFetch(targetDir) {
  const content = await ejs.renderFile(TEMPLATES.fetch);
  await fs.outputFile(path.join(targetDir, 'helpers', 'fetch.ts'), content);
}

/**
 * Generates the environment-aware config file.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateConfig(targetDir) {
  const content = await ejs.renderFile(TEMPLATES.config);
  await fs.outputFile(path.join(targetDir, 'config', 'config.ts'), content);
}

/**
 * Generates the root Layout component.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function generateLayout(targetDir) {
  const content = await ejs.renderFile(TEMPLATES.layout);
  await fs.outputFile(path.join(targetDir, 'layouts', 'Layout.tsx'), content);
}

/**
 * Bootstraps the full initial file structure for a new Hexforge project.
 * Creates the Home module plus all shared infrastructure files in parallel
 * where possible.
 *
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function initFiles(targetDir) {
  // Shared infrastructure files can be generated concurrently
  await Promise.all([
    moduleFiles('Home', targetDir),
    generateResponseWrapper(targetDir),
    generateFetch(targetDir),
    generateDateUtils(targetDir),
    generateApp(targetDir),
    generateLanguageContext(targetDir),
    generateConfig(targetDir),
    generateLayout(targetDir),
  ]);

  // Router must run after Home module exists (it references HomeViewFactory)
  await generateRouter(targetDir, 'Home');
}

// ---------------------------------------------------------------------------
// Router injection — used by `hexforge-module` to register new modules
// automatically, without requiring manual edits to Router.tsx.
// ---------------------------------------------------------------------------

/**
 * Reads the project's existing Router.tsx and inserts a new import statement
 * and <Route> entry for the given module.
 *
 * Detection is based on two anchor comments kept in Router.tsx:
 *   - `// @factory-imports`  → new imports are inserted above this line
 *   - `{/* @factory-routes *\/}` → new routes are inserted above this line
 *
 * ⚠️  Both anchors are required. If Router.tsx is missing or lacks the anchors
 *     the injection is skipped with a warning.
 *
 * @param {string} name      - PascalCase module name (e.g. "Product").
 * @param {string} targetDir - Absolute path to the project's src/ directory.
 * @returns {Promise<void>}
 */
export async function injectModuleIntoRouter(name, targetDir) {
  const routerFile = path.join(targetDir, 'router', 'Router.tsx');

  if (!await fs.pathExists(routerFile)) {
    console.warn('⚠️  Router.tsx not found — skipping router injection.');
    return;
  }

  let content  = await fs.readFile(routerFile, 'utf-8');
  const nameLower = name.toLowerCase();

  // Guard: skip if the module is already registered
  if (content.includes(`${name}ViewFactory`)) {
    console.log(`ℹ️  "${name}" is already registered in the router.`);
    return;
  }

  const importLine = `import ${name}ViewFactory from "../modules/${nameLower}/${name}ViewFactory";`;
  const routeLine  = `<Route path="/${nameLower}" element={<${name}ViewFactory />} />`;

  // Insert import above the @factory-imports anchor (regex ignores trailing warning text)
  content = content.replace(
    /\/\/ @factory-imports.*/,
    `${importLine}\n// @factory-imports — ⚠️ DO NOT REMOVE: used by hexforge-module to auto-inject imports`
  );

  // Insert route above the @factory-routes anchor (regex ignores trailing warning text)
  content = content.replace(
    /\{?\/\* @factory-routes.*?\*\/\}?/,
    `${routeLine}\n          {/* @factory-routes — ⚠️ DO NOT REMOVE: used by hexforge-module to auto-inject routes */}`
  );

  await fs.writeFile(routerFile, content, 'utf-8');
  console.log(`🔗 Route "/${nameLower}" registered in Router.tsx`);
}

/**
 * Overwrites the Vite-generated index.html with a hexforge version that
 * includes proper meta description and generator tags.
 *
 * Note: targetDir here is the PROJECT ROOT (not src/), since index.html
 * lives at the root of a Vite project.
 *
 * @param {string} projectRoot - Absolute path to the project root directory.
 * @param {string} name        - Project name used as the <title>.
 * @returns {Promise<void>}
 */
export async function generateIndexHtml(projectRoot, name) {
  const content = await ejs.renderFile(TEMPLATES.indexHtml, { name });
  await fs.outputFile(path.join(projectRoot, 'index.html'), content);
}
// ---------------------------------------------------------------------------
// CLI entry-point — only runs when invoked directly as `hexforge-module <Name>`
//
// Detection uses import.meta.url vs pathToFileURL(process.argv[1]) so that
// npm-link symlinks are resolved correctly before comparison.
// ---------------------------------------------------------------------------
const isMain = import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;

if (isMain) {
  const moduleName = process.argv[2];

  printBanner({
    command     : 'hexforge-module',
    description : 'Hexagonal module generator',
  });

  if (!moduleName) {
    console.error('❌ Module name is required.\n   Usage: hexforge-module <ModuleName>\n   Example: hexforge-module Product');
    process.exit(1);
  }

  // Normalise to PascalCase (e.g. "product" → "Product")
  const componentName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const targetDir     = path.join(process.cwd(), 'src');

  console.log(`⚙️  Generating module: ${componentName}\n`);

  try {
    await moduleFiles(componentName, targetDir);
    await injectModuleIntoRouter(componentName, targetDir);
    console.log(`\n✅ Module "${componentName}" created at src/modules/${componentName.toLowerCase()}`);
  } catch (err) {
    console.error('❌ Error generating module:', err.message);
    process.exit(1);
  }
}
