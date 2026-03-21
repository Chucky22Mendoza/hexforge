#!/usr/bin/env node

/**
 * hexforge (Master Router)
 * Entry point for `npx hexforge`.
 * Routes commands to either create or module generators.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];

// Handle global flags
if (command === '-v' || command === '--version' || command === '-V') {
  const { printVersion } = await import('./banner.js');
  printVersion();
  process.exit(0);
}

if (command === '-help' || command === '--help' || command === '-h') {
  const { printHelp } = await import('./banner.js');
  printHelp();
  process.exit(0);
}

// Router Logic
let targetScript = 'hexforge-create.js'; // Default heavily to creation for backwards compat

if (command === 'module') {
  targetScript = 'hexforge-module.js';
} else if (!command) {
  const { printHelp } = await import('./banner.js');
  printHelp();
  process.exit(0);
}

const scriptPath = path.join(__dirname, targetScript);
const childArgs = [...args]; // pass all args through

const result = spawnSync('node', [scriptPath, ...childArgs], { stdio: 'inherit' });
process.exit(result.status ?? 0);
