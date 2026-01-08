import { ArrowRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 py-4 md:px-12 bg-transparent pointer-events-none font-sans">
      
      {/* Logo - NOW CLICKABLE */}
      <div 
        onClick={() => navigate("/")}
        className="pointer-events-auto flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1 pr-4 shadow-2xl backdrop-blur-xl cursor-pointer group transition-all hover:bg-white/10"
      >
        <div className="w-8 h-8 bg-ethaum-green rounded-full flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.3)] group-hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-shadow">E</div>
        <span className="text-white font-bold tracking-tight">EthAum<span className="text-ethaum-green">.ai</span></span>
      </div>

      {/* Nav Links (Desktop) */}
      <div className="pointer-events-auto hidden lg:flex items-center gap-8 bg-white/5 border border-white/5 px-8 py-2.5 rounded-full backdrop-blur-lg">
        <a href="/#launches" className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-ethaum-green uppercase transition-all">Launches</a>
        <div className="w-1 h-1 rounded-full bg-white/10"></div>
        <a href="/#intelligence" className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-ethaum-green uppercase transition-all">Quadrants</a>
        <div className="w-1 h-1 rounded-full bg-white/10"></div>
        <a href="/#deals" className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-ethaum-green uppercase transition-all">Pilots</a>
      </div>

      {/* Actions */}
      <div className="pointer-events-auto flex items-center gap-4">
        {user ? (
            <button onClick={handleSignOut} className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors px-3">
                <LogOut size={14} /> Sign Out
            </button>
        ) : (
            <button onClick={() => navigate("/auth?type=buyer&mode=login")} className="hidden md:block text-xs font-bold text-gray-400 hover:text-white transition-colors px-3">
                Sign In
            </button>
        )}

        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-2xl">
          {user ? (
             <button onClick={() => navigate(user.user_metadata?.role === 'founder' ? "/founder/dashboard" : "/buyer/dashboard")} className="hidden sm:flex items-center px-5 py-2 text-xs font-bold text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5">
               Dashboard
             </button>
          ) : (
             <button onClick={() => navigate("/auth?type=buyer&mode=signup")} className="hidden sm:flex items-center px-5 py-2 text-xs font-bold text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5">
               Find Pilots
             </button>
          )}
          
          <button onClick={() => navigate("/auth?type=founder&mode=signup")} className="flex items-center gap-2 bg-ethaum-green text-black px-6 py-2 rounded-full text-xs font-black hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(204,255,0,0.2)] group">
            Join as Founder
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </nav>
  );
}