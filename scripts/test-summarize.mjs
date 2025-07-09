#!/usr/bin/env node
// Minimal script to POST sample logs to the local API and print JSON
// Usage:
//   node scripts/test-summarize.mjs                # uses sample text
//   node scripts/test-summarize.mjs ./logs.txt     # reads logs from file
//   echo "2025-01-13 Did stuff" | node scripts/test-summarize.mjs  # reads from stdin

import fs from 'node:fs/promises';

async function readInput() {
  const arg = process.argv[2];
  // If a file path is passed, read it
  if (arg) {
    return await fs.readFile(arg, 'utf8').catch(() => {
      console.error(`Could not read file: ${arg}`);
      process.exit(1);
    });
  }
  // If input is piped, read from stdin
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8');
  }
  // Fallback: sample logs
  return `2025-01-13 09:44  Refactored auth middleware and cleaned up token handling on API gateway.\n`+
         `2025-01-14 10:17  Added lazy loading on table view and reduced initial payload by ~40 percent.\n`+
         `2025-01-15 16:20  Started experiment branch for streaming updates into activity feed.`;
}

async function main() {
  const logs = (await readInput()).trim();
  if (!logs) {
    console.error('No logs provided.');
    process.exit(1);
  }

  const url = process.env.URL || 'http://localhost:3000/api/summarize';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs })
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(`Request failed (${res.status}):`, txt);
    process.exit(1);
  }

  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
