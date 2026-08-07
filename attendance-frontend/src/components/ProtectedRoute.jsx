import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
