import Sidebar from "../components/Sidebar";

type Agent = {
  id: string;
  name: string;
  role: string;
  model: string;
  lastRun: string;
  status: "idle" | "running" | "error";
};

const list: Agent[] = [
  { id: "weekly-standup", name: "Weekly Standup", role: "Summarizes weekly dev logs", model: "gpt-4o-mini", lastRun: "2025-01-15 16:30", status: "idle" },
  { id: "blocker-scan", name: "Blocker Scanner", role: "Extracts blockers from notes", model: "gpt-4o-mini", lastRun: "2025-01-15 15:02", status: "running" },
  { id: "perf-focus", name: "Perf Focus", role: "Flags performance related tasks", model: "gpt-4o-mini", lastRun: "2025-01-14 18:11", status: "error" },
];

const badge = (s: Agent["status"]) =>
  s === "error"
    ? "status-chip status-error"
    : s === "running"
    ? "status-chip status-warn"
    : "status-chip status-success";

export default function AgentsPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <header className="main-header" style={{ marginBottom: 8 }}>
          <div className="header-left">
            <span className="page-label">Agent console</span>
            <h1 className="page-title">Agents</h1>
            <p className="page-subtitle">Configured AI helpers that transform raw developer logs into structured insights.</p>
          </div>
        </header>
        <section className="card" aria-labelledby="agents-table-title">
          <div className="card-header">
            <div>
              <div id="agents-table-title" className="card-title">Registered agents</div>
              <div className="card-subtitle">Status, purpose and last execution time.</div>
            </div>
            <span className="pill-mini">{list.length} total</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>Name</th>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>Role</th>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>Model</th>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>Last run</th>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id} style={{ borderTop: "1px solid rgba(31,41,55,0.6)" }}>
                    <td style={{ padding: "8px 8px", fontWeight: 500 }}>{a.name}</td>
                    <td style={{ padding: "8px 8px", color: "var(--text-soft)" }}>{a.role}</td>
                    <td style={{ padding: "8px 8px" }}>{a.model}</td>
                    <td style={{ padding: "8px 8px", color: "var(--text-soft)" }}>{a.lastRun}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <span className={badge(a.status)}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
