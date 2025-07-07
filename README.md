# DevLog Agent

DevLog Agent turns daily developer logs into weekly summaries using OpenAI. Includes Overview, Logs, and Agents screens.

## Quick start

1. Install deps

```bash
npm install
```

2. Create `.env.local`

```bash
OPENAI_API_KEY=<key>
```

3. Run

```bash
npm run dev
```

Visit http://localhost:3000 for Overview, /logs for Logs, and /agents for Agents.

## How to get an OPENAI_API_KEY

1. Sign in at https://platform.openai.com/
2. Navigate to https://platform.openai.com/api-keys
3. Click “Create new secret key” and name it (e.g. DevLog Agent)
4. Copy the key once displayed (you can't see it again) and paste into `.env.local`

## Summarization pipeline (LangChain + fallback)

The `app/api/summarize/route.ts` endpoint uses **LangChain chain**:

1. Zod schema defines required fields: `summary`, `bullets`, `blockers`, `nextSteps`, `themes`.
2. A prompt template injects raw logs + format instructions.
3. `ChatOpenAI` model (`gpt-4o-mini` by default) generates structured JSON.
4. LangChain's structured output parser validates and returns typed data.
5. Local heuristic analysis (regex + pattern matching) fills any missing arrays and computes metrics (`daysCovered`, `dayRangeLabel`, `entriesParsed`).

Returned fields:

| Field           | Meaning                                                |
| --------------- | ------------------------------------------------------ |
| `summary`       | Concise weekly-style paragraph                         |
| `bullets`       | Key progress line items                                |
| `blockers`      | Detected issues                                        |
| `nextSteps`     | Suggested follow‑ups derived from experiments/progress |
| `themes`        | High-level focus tags (performance, ux, auth, etc.)    |
| `daysCovered`   | Number of distinct date stamps in logs                 |
| `dayRangeLabel` | Human-friendly weekday span (e.g. `Mon – Wed`)         |
| `entriesParsed` | Total non-empty lines parsed                           |
| `source`        | `langchain` or `fallback`                              |
| `fallback`      | Boolean legacy flag (kept for compatibility)           |

## Testing the API quickly

There is a helper script: `scripts/test-summarize.mjs`.

### Run with sample logs

```bash
npm run test:api
```

### Pipe custom logs via stdin

```bash
echo "2025-01-13 Did initial refactor\n2025-01-14 Fixed query latency" | npm run test:api --silent
```

### Use a logs file

```bash
npm run test:api -- ./my-week.txt
```

### Point at a different URL / port

```bash
URL=http://localhost:3001/api/summarize npm run test:api
```
