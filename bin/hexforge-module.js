#!/usr/bin/env node

/**
 * hexforge-module
 * Automatically detects Next.js vs React and scaffolds a module.
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { printVersion, printHelp } from './banner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let args = process.argv.slice(2);

// Intercept flags
if (args[0] === '-v' || args[0] === '--version' || args[0] === '-V') {
  printVersion();
  process.exit(0);
}
if (args[0] === '-help' || args[0] === '--help' || args[0] === '-h' || args.length === 0) {
  printHelp();
  process.exit(0);
}

if (args[0] === 'module') args.shift();
const moduleName = args[0];

if (!moduleName) {
  console.error('❌ Module name is required.\n   Usage: npx hexforge module <ModuleName>\n   Example: npx hexforge module Product');
  process.exit(1);
}

const packageJsonPath = path.join(process.cwd(), 'package.json');
let isNext = false;
let isReact = false;

if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (deps['next']) {
    isNext = true;
  } else if (deps['react']) {
    isReact = true;
  }
}

if (!isNext && !isReact) {
  console.error('❌ Could not detect Next.js or React in the current directory.');
  console.error('   Please run this command from the root of a Next.js or React project.');
  process.exit(1);
}

const targetScript = isNext ? 'create-next-module.js' : 'create-module.js';
const scriptPath = path.join(__dirname, targetScript);

const result = spawnSync('node', [scriptPath, moduleName], { stdio: 'inherit' });
process.exit(result.status ?? 0);
