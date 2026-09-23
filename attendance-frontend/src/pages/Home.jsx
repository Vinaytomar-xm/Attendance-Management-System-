import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleCards = [
  {
    title: "Admin",
    desc: "Manage departments, subjects, teachers and students — assign teachers to subjects and keep an eye on the whole college from one dashboard.",
  },
  {
    title: "Teacher",
    desc: "Mark attendance class by class, correct mistakes anytime, and see every subject you teach with student counts and sessions held.",
  },
  {
    title: "Student",
    desc: "Check your attendance percentage — overall and subject-wise — the moment it's marked. No more asking around before an exam.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  const dashboardPath =
    user?.role === "admin" ? "/admin" : user?.role === "teacher" ? "/teacher" : "/student";

  return (
    <div className="min-h-screen bg-ink bg-body-glow flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brass-light to-brass flex items-center justify-center font-display font-bold text-ink text-lg shadow-brand-mark shrink-0">
            AR
          </div>
          <div>
            <h1 className="text-lg text-paper">Attendance Register</h1>
            <span className="text-xs text-paper-line uppercase tracking-wider">College Attendance Management</span>
          </div>
        </div>

        {!loading && (
          <Link to={user ? dashboardPath : "/login"} className="btn btn-brass btn-sm">
            {user ? "Go to Dashboard" : "Login"}
          </Link>
        )}
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <p className="font-display text-[34px] sm:text-[46px] leading-tight max-w-[720px] text-paper mb-5">
          Every roll call, <span className="text-brass-light italic">recorded</span>. Every percentage,{" "}
          <span className="text-brass-light italic">accurate</span>.
        </p>
        <p className="text-paper-line text-[15px] max-w-[520px] mb-8">
          One register for admins, teachers, and students — departments, subjects, sessions and
          attendance, all in one place.
        </p>
        {!loading && (
          <Link to={user ? dashboardPath : "/login"} className="btn btn-primary">
            {user ? `Continue as ${user.role}` : "Sign In to Continue"}
          </Link>
        )}
      </div>

      {/* Role highlights */}
      <div className="px-6 sm:px-10 pb-16">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {roleCards.map((r) => (
            <div key={r.title} className="card">
              <div className="text-brass font-display font-bold text-lg mb-2">{r.title}</div>
              <p className="text-muted text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-paper-line text-xs pb-6">
        Departments · Subjects · Sessions · Attendance — all in one ledger.
      </div>
    </div>
  );
}