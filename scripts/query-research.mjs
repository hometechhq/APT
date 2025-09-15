#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const researchDir = path.join(repoRoot, 'research');

const DEFAULT_LIMIT = parseInt(process.env.RESEARCH_SNIPPET_LIMIT || '3', 10);
const MAX_FILE_BYTES = parseInt(process.env.RESEARCH_MAX_FILE_BYTES || String(2 * 1024 * 1024), 10);

const options = {
  limit: Number.isFinite(DEFAULT_LIMIT) ? DEFAULT_LIMIT : 3,
  caseSensitive: false,
  json: false
};

const positional = [];
const rawArgs = process.argv.slice(2);
for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];
  switch (arg) {
    case '--limit':
    case '-l': {
      const value = rawArgs[i + 1];
      if (value && !value.startsWith('--')) {
        const parsed = parseInt(value, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          options.limit = parsed;
        }
        i += 1;
      }
      break;
    }
    case '--case-sensitive':
    case '--cs': {
      options.caseSensitive = true;
      break;
    }
    case '--json': {
      options.json = true;
      break;
    }
    default: {
      positional.push(arg);
      break;
    }
  }
}

const query = positional.join(' ').trim();

if (!query) {
  printUsage();
  process.exit(1);
}

const needle = options.caseSensitive ? query : query.toLowerCase();

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
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFiles(fullPath);
      files.push(...nested);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function scanFile(filePath) {
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }

  if (stat.size > MAX_FILE_BYTES) {
    return {
      path: path.relative(repoRoot, filePath),
      matches: [],
      skipped: true,
      reason: `skipped (size ${(stat.size / (1024 * 1024)).toFixed(2)} MiB exceeds limit)`
    };
  }

  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    return {
      path: path.relative(repoRoot, filePath),
      matches: [],
      skipped: true,
      reason: `skipped (unable to read as utf8: ${err.message})`
    };
  }

  const matches = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const haystack = options.caseSensitive ? line : line.toLowerCase();
    if (haystack.includes(needle)) {
      matches.push({
        line: i + 1,
        text: line.trim()
      });
    }
  }

  if (matches.length === 0) {
    return null;
  }

  return {
    path: path.relative(repoRoot, filePath),
    matches,
    skipped: false,
    mtime: stat.mtime.toISOString()
  };
}

async function main() {
  const files = await listFiles(researchDir);
  if (files.length === 0) {
    console.error(`No research documents found under ${path.relative(repoRoot, researchDir) || '.'}`);
    process.exit(1);
  }

  const results = [];
  const skipped = [];
  for (const file of files) {
    const result = await scanFile(file);
    if (!result) continue;
    if (result.skipped) {
      skipped.push(result);
    } else {
      results.push(result);
    }
  }

  if (options.json) {
    const payload = { query, options, results, skipped };
    console.log(JSON.stringify(payload, null, 2));
    process.exit(results.length > 0 ? 0 : 1);
  }

  if (results.length === 0) {
    console.error(`No matches for "${query}" in ${path.relative(repoRoot, researchDir) || '.'}`);
  } else {
    for (const result of results) {
      console.log(`${result.path} (last updated ${result.mtime})`);
      const toShow = result.matches.slice(0, options.limit);
      for (const match of toShow) {
        console.log(`  L${match.line}: ${match.text}`);
      }
      if (result.matches.length > options.limit) {
        const remaining = result.matches.length - options.limit;
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

  process.exit(results.length > 0 ? 0 : 1);
}

function printUsage() {
  console.log(`Usage: node scripts/query-research.mjs <query> [--limit N] [--case-sensitive] [--json]\n\n` +
    'Searches the /research/ directory for lines matching the query.\n' +
    'Quote multi-word queries to keep them together.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
