import { useEffect, useState } from "react";
import api from "../api/axios";
import Topbar from "../components/Topbar";

function PercentRing({ percentage }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? "#3f6e52" : percentage >= 50 ? "#b0791f" : "#a3392e";

  return (
    <svg className="percent-ring" viewBox="0 0 116 116">
      <circle cx="58" cy="58" r={radius} fill="none" stroke="#d8cdb0" strokeWidth="10" />
      <circle
        cx="58"
        cy="58"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 58 58)"
      />
      <text x="58" y="64" textAnchor="middle" fontSize="22">{percentage}%</text>
    </svg>
  );
}

export default function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/attendance/summary").then(({ data }) => setSummary(data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <Topbar title="Student Dashboard" />
      <div className="page-scroll">
        <div className="dashboard-body">
          {loading ? (
            <div className="empty-state">Loading your attendance...</div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="percent-ring-wrap">
                  <PercentRing percentage={summary?.overallPercentage || 0} />
                  <div>
                    <h2>Overall Attendance</h2>
                    <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
                      {summary?.present} present out of {summary?.totalClasses} total classes
                    </p>
                    {summary?.overallPercentage < 75 && (
                      <p style={{ color: "var(--stamp-red)", fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                        Below the typical 75% requirement — attend upcoming classes to catch up.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="stat-grid">
                <div className="stat-card">
                  <div className="num">{summary?.totalClasses ?? 0}</div>
                  <div className="label">Total Classes</div>
                </div>
                <div className="stat-card">
                  <div className="num">{summary?.present ?? 0}</div>
                  <div className="label">Present</div>
                </div>
                <div className="stat-card">
                  <div className="num">{summary?.absent ?? 0}</div>
                  <div className="label">Absent</div>
                </div>
              </div>

              <div className="card">
                <div className="section-title">Subject-wise Breakdown</div>
                {(!summary?.subjectWise || summary.subjectWise.length === 0) ? (
                  <div className="empty-state">No attendance records yet.</div>
                ) : (
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Present</th>
                        <th>Total</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.subjectWise.map((s) => (
                        <tr key={s.subjectId}>
                          <td>{s.subjectName} <span className="roll-chip">{s.subjectCode}</span></td>
                          <td>{s.present}</td>
                          <td>{s.total}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                background: s.percentage >= 75 ? "rgba(63,110,82,0.15)" : "rgba(163,57,46,0.15)",
                                color: s.percentage >= 75 ? "#2c4f3b" : "#7c2a21",
                              }}
                            >
                              {s.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
