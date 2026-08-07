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
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">AR</div>
        <div className="brand-text">
          <h1>{title}</h1>
          <span>Attendance Register</span>
        </div>
      </div>
      <div className="topbar-user">
        <div className="user-meta">
          <div>{user?.name}</div>
          <div className="role">{user?.role}</div>
        </div>
        <div className="avatar">{initials}</div>
        <button className="btn btn-ghost btn-sm" style={{ color: "#f6f1e4", borderColor: "rgba(246,241,228,0.35)" }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
