/**
 * banner.js — hexforge terminal branding
 *
 * Prints a styled ASCII banner to stdout whenever a hexforge command starts.
 * Uses raw ANSI escape codes so there are zero extra runtime dependencies.
 *
 * @module banner
 */

// ---------------------------------------------------------------------------
// ANSI helpers (lightweight — avoids adding a colour library dependency)
// ---------------------------------------------------------------------------

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

// Foreground colours
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const WHITE  = '\x1b[97m';
const GRAY   = '\x1b[90m';

/**
 * Wraps text with ANSI colour/style codes.
 *
 * @param {string} code  - ANSI opening code.
 * @param {string} text  - Content to colour.
 * @returns {string} Styled string that resets after itself.
 */
const c = (code, text) => `${code}${text}${RESET}`;

// ---------------------------------------------------------------------------
// Banner data — single source of truth for CLI metadata
// ---------------------------------------------------------------------------

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkgJson = require('../package.json');

const PKG = {
  version : pkgJson.version,
  author  : pkgJson.author || 'Jesús Mendoza Verduzco',
  license : pkgJson.license || 'ISC',
  repo    : 'npmjs.com/package/hexforge',
};

// ---------------------------------------------------------------------------
// Banner renderer
// ---------------------------------------------------------------------------

/**
 * Prints the hexforge ASCII banner to stdout.
 *
 * @param {object}  [opts]             - Display options.
 * @param {string}  [opts.command]     - Current CLI command label (e.g. "hexforge-module").
 * @param {string}  [opts.description] - Short description shown below the logo.
 *
 * @example
 * printBanner({ command: 'hexforge-module', description: 'Hexagonal module generator' });
 */
export function printBanner({ command = '', description = '' } = {}) {
  const bee  = c(YELLOW, '⚒️');
  const logo = c(BOLD + YELLOW, 'hexforge') + c(BOLD + WHITE, '-cli');

  // Width of the inner box (between the border characters)
  const W = 62;

  /**
   * Pads `text` (visible chars only) to exactly `width` chars, centred.
   * ANSI codes are invisible, so length is counted on the raw string
   * after stripping escape sequences.
   */
  const centre = (text, width) => {
    const visible = text.replace(/\x1b\[[0-9;]*m/g, '');
    const pad  = Math.max(0, width - visible.length);
    const left = Math.floor(pad / 2);
    const right = pad - left;
    return ' '.repeat(left) + text + ' '.repeat(right);
  };

  const border  = c(YELLOW, '║');
  const topBar  = c(YELLOW, '╔' + '═'.repeat(W) + '╗');
  const midBar  = c(YELLOW, '╠' + '═'.repeat(W) + '╣');
  const botBar  = c(YELLOW, '╚' + '═'.repeat(W) + '╝');
  const blank   = `${border}${' '.repeat(W)}${border}`;

  // Logo line  ·  ⚒️  hexforge
  const logoLine   = `${border}${centre(`${bee}  ${logo}  ${bee}`, W)}${border}`;

  // Tagline
  const tagLine    = `${border}${centre(c(DIM + CYAN, 'Hexagonal Architecture Scaffolding for React'), W)}${border}`;

  // Command badge (optional)
  const cmdText    = command
    ? `${border}${centre(c(GRAY, '▸  ') + c(BOLD + CYAN, command), W)}${border}`
    : null;

  // Description (optional)
  const descText   = description
    ? `${border}${centre(c(DIM + WHITE, description), W)}${border}`
    : null;

  // Metadata row
  const meta       = `${border}${centre(
    c(GRAY, `v${PKG.version}  ·  ${PKG.author}  ·  ${PKG.license}`),
    W
  )}${border}`;

  const lines = [
    '',
    topBar,
    blank,
    logoLine,
    tagLine,
    blank,
    ...(cmdText  ? [midBar, blank, cmdText]  : []),
    ...(descText ? [descText]                : []),
    blank,
    midBar,
    `${border}${centre(c(GRAY, PKG.repo), W)}${border}`,
    botBar,
    '',
  ];

  console.log(lines.join('\n'));
}

/**
 * Prints the hexforge version block.
 */
export function printVersion() {
  const bee  = c(YELLOW, '⚒️');
  const logo = c(BOLD + YELLOW, 'hexforge');
  console.log(`\n  ${bee}  ${logo}  ${c(GRAY, `v${PKG.version}`)}\n`);
}

/**
 * Prints the CLI help menu formatting it elegantly.
 */
export function printHelp() {
  printBanner({ command: 'help', description: 'Available commands and options' });
  
  console.log(`
${c(BOLD + CYAN, 'Commands:')}
  ${c(YELLOW, 'hexforge')} [react|next] <name>         Scaffolds a new project. Defaults to React.
  ${c(YELLOW, 'hexforge module')} <ModuleName>         Generates a new module inside an existing project.

${c(BOLD + CYAN, 'Options:')}
  ${c(WHITE, '-v, --version')}                        Show the current hexforge version.
  ${c(WHITE, '-help, --help, -h')}                    Show this help message.

${c(BOLD + CYAN, 'Examples:')}
  npx hexforge my-react-app
  npx hexforge next my-next-app
  npx hexforge module User
`);
}
