import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const cut = (s: string) => s.replace(/^\d{4}-\d{2}-\d{2}[^A-Za-z0-9]*\d{2}:\d{2}\s+/, "").replace(/\\n/g, "").trim();

function scan(raw: string) {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const joined = lines.join(" ").toLowerCase();

  // themes
  const themes: string[] = [];
  if (/(perf|lazy|payload|latency|index|slow|cache|optim)/i.test(joined)) themes.push("performance");
  if (/(ux|design|copy|empty state|ui)/i.test(joined)) themes.push("ux polish");
  if (/(auth|token|security)/i.test(joined)) themes.push("auth");

  // buckets
  const progress = lines.filter(l => /(added|refactor|fixed|improv|cleaned|implemented|index|tweak)/i.test(l));
  const blockers = lines.filter(l => /(blocked|waiting|error|slow|issue|investigat|bug)/i.test(l));
  const experiments = lines.filter(l => /(experiment|prototype|spike|try|explor)/i.test(l));

  // bullets from progress
  const bullets = progress.slice(0, 5).map(cut);

  // next steps heuristic from experiments/progress
  const nextStepsSeed = experiments.length ? experiments : progress;
  const nextSteps = nextStepsSeed.slice(0, 3).map(l => {
    const s = cut(l);
    if (/started|start/i.test(s)) return s.replace(/started|start/i, "Finish").trim();
    if (/investigat/i.test(s)) return s.replace(/investigat\w*/i, "Document findings and fix");
    if (/added|refactor|fixed|improv|implemented/i.test(s)) return `Roll out: ${s}`;
    return s;
  });

  // dates covered
  const dateRe = /^(\d{4}-\d{2}-\d{2})/;
  const dates = new Set<string>();
  lines.forEach(l => {
    const m = l.match(dateRe);
    if (m) dates.add(m[1]);
  });
  const daysCovered = dates.size || (lines.length ? 1 : 0);
  const dateArr = Array.from(dates).sort();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const toDay = (d: string) => dayNames[new Date(d).getDay()];
  const dayRangeLabel = dateArr.length
    ? (dateArr.length === 1 ? toDay(dateArr[0]) : `${toDay(dateArr[0])} – ${toDay(dateArr[dateArr.length - 1])}`)
    : "";

  return { bullets, blockers: blockers.slice(0, 3).map(cut), nextSteps, themes, daysCovered, dayRangeLabel, entriesParsed: lines.length } as const;
}

function quick(raw: string) {
  const analysis = scan(raw);
  const parts: string[] = [];
  if (analysis.themes.length) parts.push(`Focus on ${analysis.themes.join(" & ")}.`);
  if (analysis.bullets.length) parts.push(`Key progress: ${analysis.bullets.slice(0, 3).join("; ")}.`);
  if (analysis.blockers.length) parts.push(`Blockers: ${analysis.blockers.slice(0, 2).join("; ")}.`);
  if (analysis.nextSteps.length) parts.push(`Next: ${analysis.nextSteps.slice(0, 2).join("; ")}.`);
  const summary = parts.length
    ? parts.join(" ")
    : "Parsed logs and prepared a concise weekly summary based on detected progress, blockers, and experiments.";
  return { summary, fallback: true, source: "fallback", ...analysis } as const;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { logs } = body as { logs?: string };
  if (!logs || !logs.trim()) {
    return NextResponse.json({ error: "Missing logs" }, { status: 400 });
  }

  // If no API key configured, use local heuristic summarizer
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || /your_real_key_here/i.test(apiKey)) return NextResponse.json(quick(logs));

  try {
    // LangChain: structured output (matches front-end fields)
    const schema = z.object({
      summary: z.string().describe("short paragraph summary"),
      bullets: z.array(z.string()).default([]),
      blockers: z.array(z.string()).default([]),
      nextSteps: z.array(z.string()).default([]),
      themes: z.array(z.string()).default([]),
    });
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const fmt = parser.getFormatInstructions();

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You write weekly style updates from raw dev logs. Be concise and practical. Return JSON that exactly matches the requested format.",
      ],
      [
        "user",
        "Logs:\n{logs}\n\nFormat strictly as:\n{fmt}",
      ],
    ]);

    const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2, apiKey });
    const chain = prompt.pipe(llm).pipe(parser);
  const obj = (await chain.invoke({ logs, fmt })) as z.infer<typeof schema>;

    const analysis = scan(logs);
    const out = {
      summary: obj.summary ?? "",
      bullets: (obj.bullets && obj.bullets.length ? obj.bullets : analysis.bullets),
      blockers: (obj.blockers && obj.blockers.length ? obj.blockers : analysis.blockers),
      nextSteps: (obj.nextSteps && obj.nextSteps.length ? obj.nextSteps : analysis.nextSteps),
      themes: (obj.themes && obj.themes.length ? obj.themes : analysis.themes),
      daysCovered: analysis.daysCovered,
      dayRangeLabel: analysis.dayRangeLabel,
      entriesParsed: analysis.entriesParsed,
      source: "langchain",
    };
    return NextResponse.json(out);
  } catch (err: unknown) {
    type ErrShape = { status?: number; code?: string };
    const e = err as ErrShape;
    const code = e?.status ?? e?.code;
    if (code === 429 || code === "insufficient_quota") return NextResponse.json(quick(logs));
    console.error("/api/summarize error", err);
    return NextResponse.json(quick(logs));
  }
}
