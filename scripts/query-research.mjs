#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const researchDir = path.join(repoRoot, 'research');

const rawArgs = process.argv.slice(2);

function usage() {
  console.log(`Usage: node scripts/query-research.mjs <query> [--limit N] [--case-sensitive] [--json]\n\n` +
    'Search the /research/ directory for lines that mention the query.');
}

let limit = parseInt(process.env.RESEARCH_SNIPPET_LIMIT || '3', 10);
if (!Number.isFinite(limit) || limit <= 0) limit = 3;
let caseSensitive = false;
let outputJson = false;

const terms = [];
for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];
  switch (arg) {
    case '--help':
    case '-h':
      usage();
      process.exit(0);
      break;
    case '--limit':
    case '-l': {
      const value = rawArgs[i + 1];
      if (!value || value.startsWith('-')) {
        console.error('Missing value after --limit');
        process.exit(1);
      }
      const parsed = parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        console.error('Limit must be a positive integer.');
        process.exit(1);
      }
      limit = parsed;
      i += 1;
      break;
    }
    case '--case-sensitive':
    case '--cs':
      caseSensitive = true;
      break;
    case '--json':
      outputJson = true;
      break;
    default:
      terms.push(arg);
  }
}

const query = terms.join(' ').trim();
if (!query) {
  usage();
  process.exit(1);
}

const needle = caseSensitive ? query : query.toLowerCase();

async function listFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFiles(full);
      files.push(...nested);
    } else {
      files.push(full);
    }
  }
  return files;
}

async function scanFile(filePath) {
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return { skipped: true, reason: 'file removed before scanning' };
    throw err;
  }

  if (stat.size > (2 * 1024 * 1024)) {
    return {
      skipped: true,
      reason: `skipped (size ${(stat.size / (1024 * 1024)).toFixed(2)} MiB exceeds limit)`
    };
  }

  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    return { skipped: true, reason: `skipped (unable to read as utf8: ${err.message})` };
  }

  const matches = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const haystack = caseSensitive ? line : line.toLowerCase();
    if (haystack.includes(needle)) {
      matches.push({ line: i + 1, text: line.trim() });
    }
  }

  if (matches.length === 0) {
    return null;
  }

  return {
    path: path.relative(repoRoot, filePath),
    matches,
    mtime: stat.mtime.toISOString(),
    skipped: false
  };
}

async function main() {
  const files = await listFiles(researchDir);
  const results = [];
  const skipped = [];

  if (files.length === 0) {
    if (outputJson) {
      console.log(JSON.stringify({
        query,
        options: { limit, caseSensitive },
        results,
        skipped,
        warning: 'No research documents found under /research/.'
      }, null, 2));
    } else {
      console.warn('No research documents found under /research/.');
    }
    return 0;
  }

  for (const file of files) {
    const result = await scanFile(file);
    if (!result) continue;
    if (result.skipped) {
      skipped.push({ path: path.relative(repoRoot, file), reason: result.reason });
    } else {
      results.push(result);
    }
  }

  if (outputJson) {
    console.log(JSON.stringify({ query, options: { limit, caseSensitive }, results, skipped }, null, 2));
  } else if (results.length === 0) {
    console.warn(`No matches for "${query}" in /research/.`);
  } else {
    for (const result of results) {
      console.log(`${result.path} (last updated ${result.mtime})`);
      const shown = result.matches.slice(0, limit);
      for (const match of shown) {
        console.log(`  L${match.line}: ${match.text}`);
      }
      if (result.matches.length > limit) {
        const remaining = result.matches.length - limit;
        console.log(`  ... ${remaining} more match${remaining === 1 ? '' : 'es'} in this file`);
      }
      console.log('');
    }
  }

  if (skipped.length > 0) {
    console.warn('Skipped files:');
    for (const item of skipped) {
      console.warn(`  ${item.path} — ${item.reason}`);
    }
  }

  return 0;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

