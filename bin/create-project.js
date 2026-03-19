#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                 hexforge — create-project.js                    ║
 * ║         Hexagonal Architecture Scaffolding for React            ║
 * ║                                                                  ║
 * ║  CLI command : hexforge-create-react <project-name>            ║
 * ║  Author      : Jesús Mendoza Verduzco                           ║
 * ║  License     : ISC                                              ║
 * ║  Version     : 1.0.0                                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Bootstraps a production-ready React + TypeScript project following
 * hexagonal (ports & adapters) architecture conventions.
 *
 * What this script does:
 *   1. Scaffolds a Vite + React + TypeScript project
 *   2. Installs core dependencies (React Router, Zustand, date-fns)
 *   3. Optionally installs Tailwind CSS
 *   4. Creates the hexagonal folder structure under src/
 *   5. Generates all initial files from EJS templates via create-module.js
 *
 * Usage:
 *   hexforge-create-react <project-name>
 *   hexforge-create-react my-app
 */

import { execSync }       from 'child_process';
import fs                 from 'fs-extra';
import path               from 'path';
import { createInterface } from 'readline';
import { initFiles, generateIndexHtml } from './create-module.js';
import { printBanner }    from './banner.js';

// ---------------------------------------------------------------------------
// Project paths — derived from CLI argument or default name
// ---------------------------------------------------------------------------

/** Name of the project directory to create (defaults to 'my-hexforge-app'). */
const projectName = process.argv[2] || 'my-hexforge-app';

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
 * @param {import('readline').Interface} rl   - Active readline interface.
 * @param {string}                       prompt - Question text shown to the user.
 * @returns {Promise<string>} The user's input.
 */
function question(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

/**
 * Runs a shell command synchronously and logs a label beforehand.
 * Centralises stdio options and working directory for all execSync calls.
 *
 * @param {string} label   - Human-readable step description shown in the terminal.
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
 * Orchestrates the full project creation flow:
 * interactive prompts → Vite scaffold → dependency install → file generation.
 *
 * @returns {Promise<void>}
 */
async function main() {
  printBanner({
    command     : 'hexforge-create-react',
    description : 'Hexagonal React project generator',
  });

  console.log(`⚙️  Creating project: ${projectName}\n`);

  // --- Interactive prompts ------------------------------------------------
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const tailwindAnswer = await question(rl, '🎨 Do you want to use Tailwind CSS? (y/n) [y]: ');
  const useTailwind    = tailwindAnswer.trim().toLowerCase() !== 'n';

  rl.close();

  // --- Step 1: Scaffold with Vite -----------------------------------------
  // cwd: process.cwd() because projectPath does not exist yet at this point.
  console.log('\n📦 Scaffolding project with Vite (React + TypeScript)...');
  execSync(
    `npm create vite@latest ${projectName} --no -- --template react-ts`,
    { shell: true, stdio: 'ignore', cwd: process.cwd() }
  );

  // Overwrite Vite's default index.html with hexforge meta tags
  await generateIndexHtml(projectPath, projectName);

  // --- Step 2: Base dependencies ------------------------------------------
  runStep('📦 Installing base dependencies...', 'npm install');

  // --- Step 3: React Router -----------------------------------------------
  runStep('🔀 Installing React Router...', 'npm install react-router-dom');

  // --- Step 4: Tailwind CSS (optional) -------------------------------------
  if (useTailwind) {
    runStep('🎨 Installing Tailwind CSS...', 'npm install tailwindcss @tailwindcss/vite');
  }

  // --- Step 5: Zustand (global state) --------------------------------------
  runStep('🐻 Installing Zustand...', 'npm install zustand');

  // --- Step 6: Date utilities ----------------------------------------------
  runStep('📅 Installing date-fns and date-fns-tz...', 'npm install date-fns date-fns-tz');

  // --- Step 7: Hexagonal folder structure ----------------------------------
  console.log('\n📁 Creating hexagonal folder structure...');

  const folders = [
    // Shared infrastructure
    'src/config',
    'src/context',
    'src/helpers',
    'src/layouts',
    'src/router',
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

  // --- Step 8: Generate files from templates -------------------------------
  console.log('\n📄 Generating files from templates...');
  await initFiles(srcPath);

  // --- Done ----------------------------------------------------------------
  console.log(`\n✅ Project "${projectName}" created successfully!`);
  console.log(`
👉 Get started:
   cd ${projectName}
   npm run dev

⚒️ Add a new module anytime:
   hexforge-module <ModuleName>

   Example:
   hexforge-module Product     → creates src/modules/product/ and registers the route
   hexforge-module Dashboard   → creates src/modules/dashboard/ and registers the route
`);
}

// ---------------------------------------------------------------------------
// Bootstrap — top-level error boundary
// ---------------------------------------------------------------------------
main().catch((err) => {
  console.error('\n❌ Error creating project:', err.message);
  process.exit(1);
});