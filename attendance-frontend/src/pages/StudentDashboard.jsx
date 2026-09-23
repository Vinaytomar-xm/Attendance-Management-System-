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
  const [view, setView] = useState("overview");
  const [classes, setClasses] = useState(null);
  const [classesLoading, setClassesLoading] = useState(false);

  useEffect(() => {
    api.get("/attendance/summary").then(({ data }) => setSummary(data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (view === "classes" && !classes) {
      setClassesLoading(true);
      api.get("/attendance/my-classes").then(({ data }) => setClasses(data.data)).finally(() => setClassesLoading(false));
    }
  }, [view, classes]);

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar title="Student Dashboard" />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">
          <div className="flex gap-1.5 mb-6 flex-wrap">
            <button className={`tab ${view === "overview" ? "active" : ""}`} onClick={() => setView("overview")}>Overview</button>
            <button className={`tab ${view === "classes" ? "active" : ""}`} onClick={() => setView("classes")}>My Classes</button>
          </div>

          {view === "classes" ? (
            <MyClasses classes={classes} loading={classesLoading} />
          ) : loading ? (
            <div className="empty-state">Loading your attendance...</div>
          ) : (
            <>
              <div className="card mb-5">
                <div className="percent-ring-wrap">
                  <PercentRing percentage={summary?.overallPercentage || 0} />
                  <div>
                    <h2>Overall Attendance</h2>
                    <p className="text-muted mt-1">
                      {summary?.present} present out of {summary?.totalClasses} total classes
                    </p>
                    {summary?.overallPercentage < 75 && (
                      <p className="text-stamp-red text-[13px] mt-2 font-semibold">
                        Below the typical 75% requirement — attend upcoming classes to catch up.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[18px] mb-7">
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
                <div className="text-[15px] text-muted uppercase tracking-wider mb-3.5">Subject-wise Breakdown</div>
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
                              className={`status-badge ${s.percentage >= 75 ? "bg-stamp-green/15 text-stamp-green-dark" : "bg-stamp-red/15 text-stamp-red-dark"}`}
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

function MyClasses({ classes, loading }) {
  if (loading) return <div className="card empty-state">Loading your classes...</div>;
  if (!classes) return null;

  return (
    <div className="card">
      <div className="text-[15px] text-muted uppercase tracking-wider mb-3.5">All Enrolled Subjects ({classes.length})</div>
      {classes.length === 0 ? (
        <div className="empty-state">No subjects found for your department & semester yet.</div>
      ) : (
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Classes Held</th>
              <th>Present</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.subjectId}>
                <td>{c.subjectName} <span className="roll-chip">{c.subjectCode}</span></td>
                <td>{c.teacherName}</td>
                <td>{c.totalClasses}</td>
                <td>{c.present}</td>
                <td>
                  <span
                    className={`status-badge ${c.percentage >= 75 ? "bg-stamp-green/15 text-stamp-green-dark" : "bg-stamp-red/15 text-stamp-red-dark"}`}
                  >
                    {c.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}