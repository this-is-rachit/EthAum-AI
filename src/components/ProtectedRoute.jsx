import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react"; // ONLY USE THIS ICON

export default function ProtectedRoute({ allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        {/* SIMPLE SPINNER ONLY */}
        <Loader2 className="animate-spin text-ethaum-green" size={40} />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (allowedRole && role !== allowedRole) {
    if (role === 'founder') return <Navigate to="/founder/dashboard" replace />;
    if (role === 'buyer') return <Navigate to="/buyer/dashboard" replace />;
  }

  return <Outlet />;
}