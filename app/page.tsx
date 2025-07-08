"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";

interface SummaryResponse {
  summary: string;
  error?: string;
  fallback?: boolean;
  source?: string;
  bullets?: string[];
  blockers?: string[];
  nextSteps?: string[];
  themes?: string[];
  daysCovered?: number;
  dayRangeLabel?: string;
  entriesParsed?: number;
}

export default function HomePage() {
  // keep it simple, paste your stuff and hit go
  const [txt, setTxt] =
    useState(`2025-01-13 09:44  Refactored auth middleware and cleaned up token handling on API gateway.
2025-01-13 15:02  Fixed race condition in React query hook for project dashboard.
2025-01-14 10:17  Added lazy loading on table view and reduced initial payload by ~40 percent.
2025-01-14 17:33  Investigated slow query in reporting service, added index on status + created_at.
2025-01-15 11:09  Paired with designer to tweak empty states and error copy for logs screen.
2025-01-15 16:20  Started experiment branch for streaming updates into activity feed.`);
  const [out, setOut] = useState<string>(
    "This week focused on stability and responsiveness for the main dashboard and reporting flow. Auth handling was cleaned up at the gateway level, the project view now loads faster, and slow queries in the reporting service were tracked down and indexed."
  );
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [src, setSrc] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [pts, setPts] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const [nxt, setNxt] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [days, setDays] = useState<number>(3);
  const [daysLbl, setDaysLbl] = useState<string>("Mon – Wed");
  const [count, setCount] = useState<number>(
    () => txt.split("\n").filter(Boolean).length
  );

  async function go() {
    setLoading(true);
    setErrMsg(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: txt }),
      });
      const data: SummaryResponse = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to summarize");
      }
      setOut(data.summary);
      setOffline(data.source === "fallback");
      if (data.source) setSrc(data.source);
      if (data.bullets) setPts(data.bullets);
      if (data.blockers) setBad(data.blockers);
      if (data.nextSteps) setNxt(data.nextSteps);
      if (data.themes) setTags(data.themes);
      if (typeof data.daysCovered === "number") setDays(data.daysCovered);
      if (typeof data.entriesParsed === "number") setCount(data.entriesParsed);
      if (data.dayRangeLabel) setDaysLbl(data.dayRangeLabel);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  const clear = () => setTxt("");

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main">
        <header className="main-header">
          <div className="header-left">
            <span className="page-label">Agent console</span>
            <h1 className="page-title">Weekly dev summary</h1>
            <p className="page-subtitle">
              Paste your daily logs on the left. DevLog Agent turns them into a
              short weekly recap with progress, blockers, and next steps.
            </p>
          </div>
          <div className="header-right">
            <div className="badge-soft">
              {loading ? "Generating..." : "Last generated: Just now"}
            </div>
            <button
              className="primary-btn"
              onClick={go}
              aria-label="Generate summary"
              disabled={loading}
            >
              <span>{loading ? "Please wait" : "Generate summary"}</span>
            </button>
          </div>
        </header>

        <section className="row">
          <article className="card" aria-labelledby="daily-logs-title">
            <div className="card-header">
              <div>
                <div id="daily-logs-title" className="card-title">
                  Daily logs
                </div>
                <div className="card-subtitle">
                  Raw notes from your day. One entry per line is enough.
                </div>
              </div>
              <span className="pill-mini">Source: pasted</span>
            </div>
            <textarea
              className="log-input"
              value={txt}
              onChange={(e) => setTxt(e.target.value)}
              placeholder="Paste your daily log lines here..."
              aria-label="Daily log input"
            />
            <div className="log-footer">
              <div className="log-meta">
                {txt.split("\n").filter(Boolean).length} entries • Environment:
                staging
              </div>
              <div>
                <button
                  className="secondary-btn"
                  onClick={clear}
                  aria-label="Clear sample logs"
                  disabled={!txt}
                >
                  <span>Clear sample</span>
                </button>
                <button
                  className="primary-btn"
                  onClick={go}
                  aria-label="Summarize logs"
                  disabled={loading || !txt.trim()}
                >
                  <span>{loading ? "Summarizing" : "Summarize logs"}</span>
                </button>
              </div>
            </div>
            {errMsg && (
              <p style={{ color: "#f87171", fontSize: 12 }}>Error: {errMsg}</p>
            )}
          </article>

          <article className="card" aria-labelledby="summary-title">
            <div className="card-header">
              <div>
                <div id="summary-title" className="card-title">
                  AI summary
                </div>
                <div className="card-subtitle">
                  Draft output from DevLog Agent. Edit before sharing with your
                  team.
                </div>
              </div>
              <span className="pill-mini">Agent: weekly-standup</span>
            </div>
            <div className="summary-box">
              <div className="summary-label">Summary</div>
              <p>{out}</p>
              {pts.length > 0 && (
                <ul className="summary-list">
                  {pts.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              <div className="tag-row">
                {(tags.length ? tags : ["general"]).map((t, i) => (
                  <span key={i} className="tag-chip">
                    {t === "general" ? "Focus: general" : `Focus: ${t}`}
                  </span>
                ))}
                <span className="tag-chip">
                  Status:{" "}
                  {loading
                    ? "updating"
                    : offline
                    ? "offline mode"
                    : src === "langchain"
                    ? "model chain"
                    : "ready"}
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="row-bottom">
          <article className="card" aria-labelledby="blockers-title">
            <div className="card-header">
              <div>
                <div id="blockers-title" className="card-title">
                  Blockers and next steps
                </div>
                <div className="card-subtitle">
                  Pulled out from the same logs so nothing gets lost.
                </div>
              </div>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot-wrap">
                  <div className="timeline-dot"></div>
                </div>
                <div className="timeline-body">
                  <span className="timeline-title">Blockers</span>
                  <span className="timeline-meta">
                    {bad.length > 0 ? bad.join("; ") : "None detected"}
                  </span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot-wrap">
                  <div className="timeline-dot"></div>
                </div>
                <div className="timeline-body">
                  <span className="timeline-title">Next week</span>
                  <span className="timeline-meta">
                    {nxt.length > 0
                      ? nxt.join("; ")
                      : "No suggested next steps"}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="card" aria-labelledby="snapshot-title">
            <div className="card-header">
              <div>
                <div id="snapshot-title" className="card-title">
                  Snapshot
                </div>
                <div className="card-subtitle">
                  Quick view of what this summary represents.
                </div>
              </div>
            </div>
            <div className="mini-metrics">
              <div className="metric-card">
                <span className="metric-label">Days covered</span>
                <span className="metric-value">{days}</span>
                <span className="metric-chip">{daysLbl || ""}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Entries parsed</span>
                <span className="metric-value">{count}</span>
                <span className="metric-chip">From input</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Theme</span>
                <span className="metric-value">
                  {tags[0] ? tags[0] : "General"}
                </span>
                <span className="metric-chip">Auto detected</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
