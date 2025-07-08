import Sidebar from "../components/Sidebar";

type Status = "Processed" | "Notice" | "Error" | "Committed" | "Experiment";

const rows: Array<{ timestamp: string; status: Status; message: string }> = [
  {
    timestamp: "2025-01-13 • 09:44",
    status: "Processed",
    message:
      "Refactored auth middleware and cleaned up token handling on API gateway.",
  },
  {
    timestamp: "2025-01-13 • 15:02",
    status: "Notice",
    message: "Fixed race condition in React query hook for project dashboard.",
  },
  {
    timestamp: "2025-01-14 • 10:17",
    status: "Processed",
    message:
      "Added lazy loading on table view and reduced initial payload by ~40 percent.",
  },
  {
    timestamp: "2025-01-14 • 17:33",
    status: "Error",
    message:
      "Slow query detected in reporting service (response >2s). Added index on status + created_at.",
  },
  {
    timestamp: "2025-01-15 • 11:09",
    status: "Committed",
    message:
      "Paired with designer to tweak empty states and error copy for logs screen.",
  },
  {
    timestamp: "2025-01-15 • 16:20",
    status: "Experiment",
    message:
      "Started experiment branch for streaming updates into activity feed.",
  },
];

const chip = (s: Status) =>
  s === "Error"
    ? "status-chip status-error"
    : s === "Notice"
    ? "status-chip status-warn"
    : "status-chip status-success";

export default function LogsPage() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main">
        <div className="page-header">
          <h1>Logs</h1>
          <div className="filter-bar">
            <select aria-label="Log level filter">
              <option>All</option>
              <option>Info</option>
              <option>Warning</option>
              <option>Error</option>
            </select>
            <input
              type="text"
              placeholder="Search logs..."
              aria-label="Search logs"
            />
          </div>
        </div>

        <section className="log-list">
          {rows.map((l, i) => (
            <div key={i} className="log-item">
              <div className="log-meta">
                <span>{l.timestamp}</span>
                <span className={chip(l.status)}>{l.status}</span>
              </div>
              <div className="log-message">{l.message}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
