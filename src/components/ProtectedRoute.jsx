import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) return <Loader />;

  // 1. Not Logged In -> Redirect to Landing
  if (!user) return <Navigate to="/" replace />;

  // 2. Wrong Role -> Redirect to correct Dashboard
  if (allowedRole && role !== allowedRole) {
    if (role === 'founder') return <Navigate to="/founder/dashboard" replace />;
    if (role === 'buyer') return <Navigate to="/buyer/dashboard" replace />;
  }

  return <Outlet />;
}