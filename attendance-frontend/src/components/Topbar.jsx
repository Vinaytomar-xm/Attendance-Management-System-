import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="topbar sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brass-light to-brass flex items-center justify-center font-display font-bold text-ink text-lg shadow-brand-mark shrink-0">
          AR
        </div>
        <div>
          <h1 className="text-lg text-paper">{title}</h1>
          <span className="text-xs text-paper-line uppercase tracking-wider">Attendance Register</span>
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="text-paper leading-tight">
          <div>{user?.name}</div>
          <div className="text-[11.5px] uppercase tracking-wider text-paper-line">{user?.role}</div>
        </div>
        <div className="avatar">{initials}</div>
        <button className="btn btn-ghost btn-sm text-paper border-paper/35" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}