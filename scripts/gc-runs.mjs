#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const runsDir = path.join(repoRoot, 'state', 'runs');
const cdDir = path.join(repoRoot, 'state', 'cd');

const keepRuns = parseInt(getArg('--keep-runs', process.env.KEEP_RUNS || '5'), 10);
const keepDays = parseInt(getArg('--keep-days', process.env.KEEP_DAYS || '30'), 10);

async function wasPromoted(runId) {
  try {
    await fs.access(path.join(cdDir, runId, 'prod'));
    return true;
  } catch {
    return false;
  }
}

async function pruneRuns(dir, checkProd = false) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return; // directory doesn't exist
    throw err;
  }

  const dirs = entries.filter(e => e.isDirectory());
  const stats = await Promise.all(
    dirs.map(async e => {
      const fullPath = path.join(dir, e.name);
      const stat = await fs.stat(fullPath);
      const promoted = checkProd ? await wasPromoted(e.name) : false;
      return { name: e.name, path: fullPath, stat, promoted };
    })
  );

  stats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

  const now = Date.now();
  const keep = [];
  const remove = [];

  for (const s of stats) {
    const ageDays = (now - s.stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (s.promoted || (keep.length < keepRuns && ageDays <= keepDays)) {
      keep.push(s);
    } else {
      remove.push(s);
    }
  }

  for (const r of remove) {
    await fs.rm(r.path, { recursive: true, force: true });
    console.log(`Removed ${r.path}`);
  }
}

function getArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return fallback;
}

async function main() {
  await pruneRuns(runsDir, true);
  await pruneRuns(cdDir);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
