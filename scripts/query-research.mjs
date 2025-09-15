#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const researchRoot = path.join(repoRoot, 'research');

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printUsage();
  process.exit(0);
}

let onTime;
let fromTime;
let toTime;

try {
  onTime = parseDateArg(args.on, '--on');
  fromTime = parseDateArg(args.from, '--from');
  toTime = parseDateArg(args.to, '--to');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const featureFilter = args.feature;

async function collectEntries() {
  const matches = [];
  await walk(researchRoot, async filePath => {
    const relPath = path.relative(repoRoot, filePath);
    let raw;
    try {
      raw = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      console.warn(`Skipping ${relPath}: unable to read file (${err.message})`);
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.warn(`Skipping ${relPath}: invalid JSON (${err.message})`);
      return;
    }

    if (!data || typeof data !== 'object' || !Array.isArray(data.entries)) {
      return;
    }

    for (const entry of data.entries) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }

      const featureSlug = entry.feature_slug || entry.feature_id || entry.feature;
      if (featureFilter && featureSlug !== featureFilter) {
        continue;
      }

      const capturedTime = parseTimestamp(entry.captured_at) ?? parseTimestamp(entry.timestamp) ?? parseTimestamp(entry.recorded_at) ?? parseTimestamp(entry.validity?.start);
      if (fromTime !== null && (capturedTime === null || capturedTime < fromTime)) {
        continue;
      }
      if (toTime !== null && (capturedTime === null || capturedTime > toTime)) {
        continue;
      }

      if (onTime !== null) {
        const validity = entry.validity && typeof entry.validity === 'object' ? entry.validity : {};
        const startTime = parseTimestamp(validity.start) ?? capturedTime;
        const endTime = parseTimestamp(validity.end ?? validity.until ?? entry.valid_until);
        if (startTime === null || onTime < startTime) {
          continue;
        }
        if (endTime !== null && onTime > endTime) {
          continue;
        }
      }

      const sanitized = JSON.parse(JSON.stringify(entry));
      sanitized.source_file = relPath;
      if (!sanitized.feature_slug && featureSlug) {
        sanitized.feature_slug = featureSlug;
      }
      matches.push(sanitized);
    }
  });

  matches.sort((a, b) => {
    const aTime = parseTimestamp(a.captured_at) ?? parseTimestamp(a.validity?.start) ?? 0;
    const bTime = parseTimestamp(b.captured_at) ?? parseTimestamp(b.validity?.start) ?? 0;
    return bTime - aTime;
  });

  return matches;
}

collectEntries()
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

async function walk(dir, onFile) {
  let dirents;
  try {
    dirents = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }
    throw err;
  }

  for (const dirent of dirents) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      await walk(fullPath, onFile);
    } else if (dirent.isFile() && dirent.name.endsWith('.history.json')) {
      await onFile(fullPath);
    }
  }
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      parsed.help = true;
      continue;
    }
    if (token === '--feature' || token === '-f') {
      parsed.feature = requireValue(argv, ++i, token);
      continue;
    }
    if (token === '--on') {
      parsed.on = requireValue(argv, ++i, token);
      continue;
    }
    if (token === '--from') {
      parsed.from = requireValue(argv, ++i, token);
      continue;
    }
    if (token === '--to') {
      parsed.to = requireValue(argv, ++i, token);
      continue;
    }
    if (token.startsWith('-')) {
      throw new Error(`Unknown option: ${token}`);
    }
    parsed._.push(token);
  }
  return parsed;
}

function requireValue(argv, index, flag) {
  if (index >= argv.length || argv[index].startsWith('-')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return argv[index];
}

function parseDateArg(value, flag) {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid date for ${flag}: ${value}. Use an ISO-8601 string (e.g. 2024-06-01T12:00:00Z).`);
  }
  return timestamp;
}

function parseTimestamp(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function printUsage() {
  console.log(`Usage: node scripts/query-research.mjs [options]\n\n` +
    `Scans research history files (*.history.json) under /research and prints matching entries as JSON.\n\n` +
    `Options:\n` +
    `  -h, --help           Show this message and exit.\n` +
    `  -f, --feature <slug> Limit results to a specific feature slug.\n` +
    `      --on <timestamp> Return entries whose validity window covers the given ISO-8601 timestamp.\n` +
    `      --from <timestamp> Limit to entries captured on or after the timestamp.\n` +
    `      --to <timestamp>   Limit to entries captured on or before the timestamp.\n` +
    `\nExamples:\n` +
    `  node scripts/query-research.mjs --feature onboarding --on 2024-06-01T00:00:00Z\n` +
    `  node scripts/query-research.mjs --from 2024-01-01 --to 2024-03-31\n`);
}
