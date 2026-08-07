import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";

const TABS = ["Overview", "Departments", "Subjects", "Teachers", "Students"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("Overview");
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  return (
    <div className="app-shell">
      <Topbar title="Admin Dashboard" />
      <div className="page-scroll">
        <div className="dashboard-body">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && <Overview />}
          {tab === "Departments" && <Departments notify={notify} />}
          {tab === "Subjects" && <Subjects notify={notify} />}
          {tab === "Teachers" && <Teachers notify={notify} />}
          {tab === "Students" && <Students notify={notify} />}
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/attendance/dashboard-stats").then(({ data }) => setStats(data.data));
  }, []);

  const cards = [
    { label: "Total Students", value: stats?.totalStudents },
    { label: "Total Teachers", value: stats?.totalTeachers },
    { label: "Today's Sessions", value: stats?.todaysSessions },
    { label: "Departments", value: stats?.totalDepartments },
    { label: "Subjects", value: stats?.totalSubjects },
  ];

  return (
    <div>
      <div className="section-title">At a glance</div>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="num">{c.value ?? "—"}</div>
            <div className="label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card empty-state">Select a tab above to manage departments, subjects, teachers, or students.</div>
    </div>
  );
}

function Departments({ notify }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    api.get("/departments").then(({ data }) => setList(data.data));
  }, []);

  useEffect(() => load(), [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/departments", form);
      notify("Department created");
      setForm({ name: "", code: "" });
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create department", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      notify("Department deleted");
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      <div className="card">
        <div className="section-title">Add Department</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Computer Science" />
          </div>
          <div className="field">
            <label>Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="CSE" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Saving..." : "Create Department"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">All Departments ({list.length})</div>
        {list.length === 0 ? (
          <div className="empty-state">No departments yet.</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td><span className="roll-chip">{d.code}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Subjects({ notify }) {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ subjectName: "", subjectCode: "", semester: "", department: "" });
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    api.get("/subjects").then(({ data }) => setList(data.data));
    api.get("/departments").then(({ data }) => setDepartments(data.data));
    api.get("/teachers").then(({ data }) => setTeachers(data.data));
  }, []);

  useEffect(() => load(), [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/subjects", form);
      notify("Subject created");
      setForm({ subjectName: "", subjectCode: "", semester: "", department: "" });
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create subject", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (subjectId, teacherId) => {
    if (!teacherId) return;
    try {
      await api.patch(`/subjects/${subjectId}/assign-teacher`, { teacherId });
      notify("Teacher assigned");
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to assign teacher", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subject?")) return;
    try {
      await api.delete(`/subjects/${id}`);
      notify("Subject deleted");
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      <div className="card">
        <div className="section-title">Add Subject</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Subject Name</label>
            <input value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} required placeholder="Data Structures" />
          </div>
          <div className="field">
            <label>Subject Code</label>
            <input value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} required placeholder="CS201" />
          </div>
          <div className="field">
            <label>Semester</label>
            <input type="number" min="1" max="12" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required placeholder="3" />
          </div>
          <div className="field">
            <label>Department</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Saving..." : "Create Subject"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">All Subjects ({list.length})</div>
        {list.length === 0 ? (
          <div className="empty-state">No subjects yet.</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Sem</th>
                <th>Dept</th>
                <th>Teacher</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id}>
                  <td>{s.subjectName} <span className="roll-chip">{s.subjectCode}</span></td>
                  <td>{s.semester}</td>
                  <td>{s.department?.code}</td>
                  <td>
                    <select
                      defaultValue={s.assignedTeacher?._id || ""}
                      onChange={(e) => handleAssign(s._id, e.target.value)}
                    >
                      <option value="">{s.assignedTeacher?.name || "Unassigned"}</option>
                      {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Teachers({ notify }) {
  return <PeopleManager role="teacher" notify={notify} endpoint="/teachers" />;
}

function Students({ notify }) {
  return <PeopleManager role="student" notify={notify} endpoint="/students" />;
}

function PeopleManager({ role, notify, endpoint }) {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: "", rollNo: "", semester: "",
  });

  const load = useCallback(() => {
    api.get(endpoint).then(({ data }) => setList(data.data));
    api.get("/departments").then(({ data }) => setDepartments(data.data));
  }, [endpoint]);

  useEffect(() => load(), [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(endpoint, form);
      notify(`${role === "teacher" ? "Teacher" : "Student"} added`);
      setForm({ name: "", email: "", password: "", department: "", rollNo: "", semester: "" });
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to add", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this account?")) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      notify("Deleted");
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      <div className="card">
        <div className="section-title">Add {role === "teacher" ? "Teacher" : "Student"}</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Temporary Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <div className="field">
            <label>Department</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          {role === "student" && (
            <>
              <div className="field">
                <label>Roll No.</label>
                <input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} required />
              </div>
              <div className="field">
                <label>Semester</label>
                <input type="number" min="1" max="12" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required />
              </div>
            </>
          )}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Saving..." : `Add ${role === "teacher" ? "Teacher" : "Student"}`}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">All {role === "teacher" ? "Teachers" : "Students"} ({list.length})</div>
        {list.length === 0 ? (
          <div className="empty-state">Nobody added yet.</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                {role === "student" && <th>Roll No.</th>}
                <th>Name</th>
                <th>Email</th>
                <th>Dept</th>
                {role === "student" && <th>Sem</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id}>
                  {role === "student" && <td><span className="roll-chip">{p.rollNo}</span></td>}
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.department?.code}</td>
                  {role === "student" && <td>{p.semester}</td>}
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
