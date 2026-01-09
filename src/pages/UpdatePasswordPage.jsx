import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import { AmbientBackground } from "../components/UIEffects";
import { Lock, Key, ArrowRight, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import gsap from "gsap";

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { user, loading: authLoading } = useAuth(); // GET GLOBAL AUTH STATE
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
       gsap.from(".auth-card", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Redirect if link is invalid (No user session found after loading)
  useEffect(() => {
    if (!authLoading && !user) {
        // Optional: You could redirect to login automatically
        // navigate("/auth?mode=login");
    }
  }, [authLoading, user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TRIPLE CHECK: Ensure we actually have a session before calling update
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Session expired. Please click the reset link in your email again.");
      }

      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => navigate("/auth?mode=login"), 2000);
    } catch (err) {
      console.error("Reset Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. SHOW LOADER WHILE SUPABASE VERIFIES THE EMAIL LINK
  if (authLoading) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black">
            <Loader2 className="animate-spin text-ethaum-green" size={40} />
        </div>
    );
  }

  // 2. SHOW ERROR IF LINK WAS INVALID (No User Session)
  if (!user) {
    return (
        <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center p-4 font-sans relative overflow-hidden">
            <AmbientBackground />
            <div className="auth-card w-full max-w-[450px] bg-[#0A0A0A] border border-red-500/30 rounded-[1.5rem] p-10 text-center shadow-2xl relative z-10">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
                <h2 className="text-xl font-bold text-white mb-2">Link Expired or Invalid</h2>
                <p className="text-gray-500 text-xs mb-6">The recovery link you clicked is invalid or has already been used.</p>
                <button onClick={() => navigate("/auth?mode=login")} className="w-full py-3 bg-white text-black font-bold uppercase text-xs rounded-xl hover:bg-ethaum-green transition-all">
                    Return to Login
                </button>
            </div>
        </div>
    );
  }

  // 3. SHOW FORM (Session Active)
  return (
    <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <AmbientBackground />
      
      <div className="auth-card w-full max-w-[450px] bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl relative z-10">
        
        <div className="p-8 md:p-10">
            {/* Header */}
            <div className="mb-8 border-b border-white/5 pb-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-ethaum-green mb-6 shadow-[0_0_20px_rgba(204,255,0,0.1)]">
                    <Lock size={20} />
                </div>
                <h2 className="text-2xl font-light text-white tracking-tighter leading-none">
                    Reset <span className="font-bold text-ethaum-green">Credentials.</span>
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Secure Uplink Established</p>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="mb-6 p-3 bg-red-900/10 border-l-2 border-red-500 text-red-400 text-[10px] font-mono animate-in fade-in">
                    ERROR :: {error}
                </div>
            )}
            
            {success ? (
                <div className="p-4 bg-green-900/10 border border-green-500/30 rounded-xl text-center animate-in zoom-in-95">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-white font-bold text-sm">Update Successful</p>
                    <p className="text-gray-500 text-xs mt-1">Redirecting to login...</p>
                </div>
            ) : (
                /* Form */
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div className="group relative">
                        <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-ethaum-green transition-colors" />
                        <input 
                            required 
                            type="password" 
                            placeholder="Enter New Password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full bg-[#111] border border-white/5 rounded-xl px-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-ethaum-green/50 focus:bg-white/5 transition-all"
                        />
                    </div>

                    <button disabled={loading} className="mt-2 w-full rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest py-3.5 hover:bg-ethaum-green transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Set New Password'}
                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}