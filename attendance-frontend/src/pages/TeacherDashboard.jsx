import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    api.get("/subjects").then(({ data }) => {
      const mine = data.data.filter((s) => s.assignedTeacher?._id === user?.id || s.assignedTeacher === user?.id);
      setSubjects(mine);
      if (mine.length) setSubjectId(mine[0]._id);
    });
  }, [user]);

  const loadRoster = async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const { data } = await api.get("/attendance/roster", {
        params: { subjectId, className, date },
      });
      setStudents(data.students);
      setAlreadyMarked(data.alreadyMarked);

      const initial = {};
      data.students.forEach((s) => {
        const existing = data.existingMarks.find((m) => m.student === s._id);
        initial[s._id] = existing?.status || "Present";
      });
      setMarks(initial);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to load roster", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, className, date]);

  const setStatus = (studentId, status) => {
    setMarks((m) => ({ ...m, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map((s) => ({ studentId: s._id, status: marks[s._id] || "Present" }));
      await api.post("/attendance/mark", { subjectId, className, date, records });
      notify("Attendance saved successfully");
      setAlreadyMarked(true);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to save attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  const currentSubject = subjects.find((s) => s._id === subjectId);

  return (
    <div className="app-shell">
      <Topbar title="Teacher Dashboard" />
      <div className="page-scroll">
        <div className="dashboard-body">
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-title">Mark Attendance</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div className="field">
                <label>Subject</label>
                <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  {subjects.length === 0 && <option value="">No subjects assigned</option>}
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Class / Section (optional)</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. A" />
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            {alreadyMarked && (
              <div className="error-banner" style={{ background: "rgba(63,110,82,0.1)", borderColor: "rgba(63,110,82,0.35)", color: "#2c4f3b" }}>
                Attendance for this session was already marked — you're viewing/editing existing marks.
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <div className="section-title" style={{ margin: 0 }}>
                {currentSubject ? `${currentSubject.subjectName} · Semester ${currentSubject.semester}` : "Select a subject"}
              </div>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || students.length === 0}>
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>

            {loading ? (
              <div className="empty-state">Loading roster...</div>
            ) : students.length === 0 ? (
              <div className="empty-state">No students found for this subject's department & semester.</div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id}>
                      <td><span className="roll-chip">{s.rollNo}</span></td>
                      <td>{s.name}</td>
                      <td>
                        <div className="stamp-row">
                          {["Present", "Absent", "Late", "Leave"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              data-status={status}
                              className={`stamp-btn ${marks[s._id] === status ? "active" : ""}`}
                              onClick={() => setStatus(s._id, status)}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
