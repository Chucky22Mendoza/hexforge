#!/usr/bin/env node

/**
 * hexforge-create
 * Router for scaffolding React or Next.js projects.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { printVersion, printHelp } from './banner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let framework = 'react';
let projectName = '';

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

if (args[0] === 'create') args.shift();

if (args[0] === 'next' || args[0] === 'react') {
  framework = args[0];
  projectName = args[1];
} else {
  projectName = args[0];
}

if (!projectName) {
  console.error('❌ Project name is required.\n   Usage: npx hexforge-create [react|next] <ProjectName>\n   Example: npx hexforge-create next my-app\n   Example: npx hexforge-create my-react-app');
  process.exit(1);
}

const targetScript = framework === 'next' ? 'create-next-project.js' : 'create-project.js';
const scriptPath = path.join(__dirname, targetScript);

const result = spawnSync('node', [scriptPath, projectName], { stdio: 'inherit' });
process.exit(result.status ?? 0);
