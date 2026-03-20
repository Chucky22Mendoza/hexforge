#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║             hexforge — create-next-project.js                   ║
 * ║       Hexagonal Architecture Scaffolding for Next.js            ║
 * ║                                                                  ║
 * ║  CLI command : hexforge-create-next <project-name>                  ║
 * ║  Author      : Jesús Mendoza Verduzco                           ║
 * ║  License     : ISC                                              ║
 * ║  Version     : 1.0.0                                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Bootstraps a production-ready Next.js (App Router) project following
 * hexagonal (ports & adapters) architecture conventions.
 *
 * What this script does:
 *   1. Scaffolds a Next.js project with App Router + TypeScript via create-next-app
 *   2. Optionally includes Tailwind CSS
 *   3. Installs Zustand (global state) and date-fns (date utilities)
 *   4. Creates the hexagonal folder structure under src/
 *   5. Generates all initial files from EJS templates (Next.js-aware)
 *   6. Overwrites app/page.tsx and app/layout.tsx with hexforge templates
 *
 * Key differences vs hexforge-create-react:
 *   - Uses create-next-app instead of Vite
 *   - No react-router-dom (App Router handles routing via the file system)
 *   - No App.tsx (replaced by app/layout.tsx + app/page.tsx)
 *   - ViewFactory and LanguageContext include 'use client' directive
 *   - New modules create src/app/<name>/page.tsx instead of Router.tsx injection
 *
 * Usage:
 *   hexforge-create-next <project-name>
 *   hexforge-create-next my-next-app
 */

import { execSync }        from 'child_process';
import fs                  from 'fs-extra';
import path                from 'path';
import { createInterface } from 'readline';
import { initNextFiles }   from './create-next-module.js';
import { printBanner }     from './banner.js';

// ---------------------------------------------------------------------------
// Project paths
// ---------------------------------------------------------------------------

/** Name of the project directory to create (defaults to 'my-hexforge-next-app'). */
const projectName = process.argv[2] || 'my-hexforge-next-app';

/** Absolute path to the project root. */
const projectPath = path.join(process.cwd(), projectName);

/** Absolute path to the project's src/ directory. */
const srcPath = path.join(projectPath, 'src');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps readline's question in a Promise for use with async/await.
 *
 * @param {import('readline').Interface} rl     - Active readline interface.
 * @param {string}                       prompt - Question text shown to the user.
 * @returns {Promise<string>}
 */
function question(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

/**
 * Runs a shell command synchronously and logs a label beforehand.
 * shell: true is required on Windows (npm/npx are .cmd scripts).
 *
 * @param {string} label   - Human-readable step description.
 * @param {string} command - Shell command to execute.
 * @param {object} [opts]  - Additional options forwarded to execSync.
 */
function runStep(label, command, opts = {}) {
  console.log(`\n${label}`);
  execSync(command, { shell: true, stdio: 'inherit', cwd: projectPath, ...opts });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Orchestrates the full Next.js project creation flow:
 * interactive prompts → create-next-app → dependency install → file generation.
 *
 * @returns {Promise<void>}
 */
async function main() {
  printBanner({
    command     : 'hexforge-create-next',
    description : 'Next.js hexagonal project generator',
  });

  console.log(`⚙️  Creating Next.js project: ${projectName}\n`);

  // --- Interactive prompts ------------------------------------------------
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const tailwindAnswer = await question(rl, '🎨 Do you want to use Tailwind CSS? (y/n) [y]: ');
  const useTailwind    = tailwindAnswer.trim().toLowerCase() !== 'n';

  rl.close();

  // --- Step 1: Scaffold with create-next-app -------------------------------
  // Flags explained:
  //   --typescript     → TypeScript (required for hexforge templates)
  //   --eslint         → ESLint config
  //   --app            → App Router (not Pages Router)
  //   --src-dir        → Place source under src/ to match hexagonal structure
  //   --import-alias   → @/* alias for clean absolute imports
  //   --no-turbopack   → Use Webpack (more stable for most setups)
  //   --tailwind / --no-tailwind → Conditional based on user answer
  const twFlag = useTailwind ? '--tailwind' : '--no-tailwind';
  console.log('\n📦 Scaffolding project with Next.js (App Router + TypeScript)...');
  execSync(
    `npx create-next-app@latest ${projectName} --typescript --eslint --app --src-dir --import-alias "@/*" ${twFlag} --no-turbopack`,
    { shell: true, stdio: 'inherit', cwd: process.cwd() }
  );

  // --- Step 2: Zustand (global state) --------------------------------------
  runStep('🐻 Installing Zustand...', 'npm install zustand');

  // --- Step 3: Date utilities -----------------------------------------------
  runStep('📅 Installing date-fns and date-fns-tz...', 'npm install date-fns date-fns-tz');

  // --- Step 4: Hexagonal folder structure ----------------------------------
  // Note: src/app/ already exists from create-next-app.
  // We only create the additional hexagonal layers.
  console.log('\n📁 Creating hexagonal folder structure...');

  const folders = [
    // Shared infrastructure
    'src/config',
    'src/context',
    'src/helpers',
    'src/utils',
    // Shared module types
    'src/modules/shared/types',
    // Home module — hexagonal layers
    'src/modules/home/domain',
    'src/modules/home/infrastructure',
    'src/modules/home/hooks',
    'src/modules/home/sections',
    'src/modules/home/store',
    'src/modules/home/repository',
    'src/modules/home/translations',
  ];

  folders.forEach((dir) => fs.ensureDirSync(path.join(projectPath, dir)));

  // --- Step 5: Generate files from templates --------------------------------
  // This overwrites app/page.tsx and app/layout.tsx with hexforge versions.
  console.log('\n📄 Generating files from templates...');
  await initNextFiles(srcPath, projectName, useTailwind);

  // --- Done -----------------------------------------------------------------
  console.log(`\n✅ Next.js project "${projectName}" created successfully!`);
  console.log(`
👉 Get started:
   cd ${projectName}
   npm run dev

⚒️ Add a new module anytime:
   hexforge-next-module <ModuleName>

   Example:
   hexforge-next-module Product    → creates src/modules/product/ + src/app/product/page.tsx
   hexforge-next-module Dashboard  → creates src/modules/dashboard/ + src/app/dashboard/page.tsx
`);
}

// ---------------------------------------------------------------------------
// Bootstrap — top-level error boundary
// ---------------------------------------------------------------------------
main().catch((err) => {
  console.error('\n❌ Error creating Next.js project:', err.message);
  process.exit(1);
});
