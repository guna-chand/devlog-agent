"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const p = usePathname();

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand">
        <div className="brand-icon">
          <span>DL</span>
        </div>
        <div className="brand-text">
          <div className="brand-title">DevLog Agent</div>
          <div className="brand-subtitle">AI summaries for dev work</div>
        </div>
      </div>

      <div>
        <div className="nav-section-label">Console</div>
        <ul className="nav-list">
          <li className={p === "/" ? "nav-item active" : "nav-item"}>
            <Link
              href="/"
              className="flex items-center gap-2"
              style={{ all: "unset" }}
              aria-current={p === "/" ? "page" : undefined}
            >
              <span>Overview</span>
            </Link>
          </li>
          <li className={p === "/logs" ? "nav-item active" : "nav-item"}>
            <Link
              href="/logs"
              className="flex items-center gap-2"
              style={{ all: "unset" }}
              aria-current={p === "/logs" ? "page" : undefined}
            >
              <span>Logs</span>
            </Link>
          </li>
          <li className={p === "/agents" ? "nav-item active" : "nav-item"}>
            <Link
              href="/agents"
              className="flex items-center gap-2"
              style={{ all: "unset" }}
              aria-current={p === "/agents" ? "page" : undefined}
            >
              <span>Agents</span>
            </Link>
          </li>
          <li className="nav-item">
            <span>Settings</span>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="pill">
          <span className="pill-dot"></span>
          <span>Weekly summary ready</span>
        </div>
        <small>
          DevLog Agent groups your daily notes into clean summaries so you can
          share progress without rewriting everything.
        </small>
      </div>
    </aside>
  );
}

export default Sidebar;
