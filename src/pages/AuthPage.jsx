import { useState, useRef, useLayoutEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { AmbientBackground } from "../components/UIEffects";
import { ArrowLeft, Rocket, Building2, ArrowRight, Loader2, Lock, Mail, Key, User, Globe, HelpCircle } from "lucide-react";
import gsap from "gsap";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // --- STATE & REFS ---
  const containerRef = useRef(null);
  const formRef = useRef(null);
  
  const initialType = searchParams.get("type") === "buyer" ? "buyer" : "founder";
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [activeTab, setActiveTab] = useState(initialType);
  const [authMode, setAuthMode] = useState(initialMode); // 'login', 'signup', 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startupName, setStartupName] = useState("");

  // --- ANIMATIONS ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Reset animations on mode switch
      const tl = gsap.timeline();
      
      tl.fromTo(".auth-card", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      )
      .fromTo(".visual-panel-content", 
        { x: -20, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 
        "-=0.3"
      )
      .fromTo(".form-element", 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "back.out(1.2)" }, 
        "-=0.3"
      );

    }, containerRef);
    return () => ctx.revert();
  }, [authMode]);

  // --- HANDLERS ---

  // 1. FORGOT PASSWORD HANDLER
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) throw error;
        setSuccessMsg("Recovery signal broadcasted. Check your inbox.");
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  // 2. AUTH HANDLER (Robust Logic + Metadata Fix)
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let result;
      
      if (authMode === 'signup') {
        // A. SIGN UP (WITH METADATA - Fixes Race Condition)
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: activeTab, // CRITICAL: Sets role immediately in session
              full_name: fullName,
              startup_name: activeTab === 'founder' ? startupName : null
            }
          }
        });

        const { data, error: authError } = result;
        if (authError) throw authError;

        if (data.user) {
            // B. MANUAL PROFILE UPSERT (The "Fix" for DB crash)
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                email: email,
                role: activeTab,
                full_name: fullName,
                startup_name: activeTab === "founder" ? startupName : null
            }, { onConflict: 'id' });

            if (profileError) {
                console.error("Profile Error:", profileError);
                throw new Error("Identity created, but profile sync failed. Contact support.");
            }
        }

      } else {
        // C. SIGN IN
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { data, error: authError } = result;
      if (authError) throw authError;

      if (data.user) {
        // D. ROUTING (Prioritizes Metadata for immediate redirect)
        const userRole = data.user.user_metadata?.role || activeTab;

        if (userRole === "founder") navigate("/founder/dashboard");
        else if (userRole === "buyer") navigate("/buyer/dashboard");
        else navigate("/");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      let msg = err.message;
      if (msg.includes("already registered")) msg = "Identity already exists. Please login.";
      if (msg.includes("Database error")) msg = "System busy. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    if (authMode === 'forgot') setAuthMode('login');
    else setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* 1. GLOBAL AMBIENCE */}
      <AmbientBackground />
      
      {/* 2. NAVIGATION */}
      <button 
        onClick={() => navigate("/")} 
        className="absolute top-8 left-8 flex items-center gap-3 text-gray-500 hover:text-white transition-all cursor-pointer z-50 group mix-blend-difference"
      >
        <div className="p-2.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
            <ArrowLeft size={14} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest hidden md:block">Return to Base</span>
      </button>

      {/* 3. THE MONOLITH CARD */}
      <div className="auth-card w-full max-w-[850px] min-h-[500px] bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10">
        
        {/* === LEFT PANEL: VISUAL CORTEX === */}
        <div className="relative w-full md:w-[45%] bg-[#0f0f0f] border-b md:border-b-0 md:border-r border-white/5 p-8 md:p-10 flex flex-col justify-between overflow-hidden group">
            
            {/* Dynamic Backgrounds */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${authMode !== 'forgot' && activeTab === 'founder' ? 'opacity-100' : 'opacity-0'}`}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-ethaum-green/5 rounded-full blur-[80px]"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${authMode !== 'forgot' && activeTab === 'buyer' ? 'opacity-100' : 'opacity-0'}`}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-500/5 rounded-full blur-[80px]"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>
             {/* Recovery Background */}
             <div className={`absolute inset-0 transition-opacity duration-1000 ${authMode === 'forgot' ? 'opacity-100' : 'opacity-0'}`}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-purple-500/5 rounded-full blur-[80px]"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Content */}
            <div className="visual-panel-content relative z-10 h-full flex flex-col justify-center">
                
                {authMode === 'login' ? (
                    <div className="space-y-5">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-ethaum-green shadow-[0_0_20px_rgba(204,255,0,0.1)]">
                            <Lock size={20} />
                        </div>
                        <h1 className="text-4xl font-light text-white leading-[0.9] tracking-tighter">
                            Secure <br/><span className="font-bold">Uplink.</span>
                        </h1>
                        <p className="text-gray-500 text-xs leading-relaxed max-w-xs border-l border-white/10 pl-4">
                            Access real-time deal flow, manage your vault, and track pilot performance metrics.
                        </p>
                    </div>
                ) : authMode === 'forgot' ? (
                    <div className="space-y-5">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                            <HelpCircle size={20} />
                        </div>
                        <h1 className="text-4xl font-light text-white leading-[0.9] tracking-tighter">
                            Recovery <br/><span className="font-bold">Mode.</span>
                        </h1>
                        <p className="text-gray-500 text-xs leading-relaxed max-w-xs border-l border-white/10 pl-4">
                            Initiate automated credential reset protocols. Secure link will be dispatched.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-light text-white mb-2 tracking-tighter">
                                Initialize <br/><span className="font-bold text-ethaum-green">Protocol.</span>
                            </h1>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Select Ecosystem Role</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* Role Card: Founder */}
                            <button 
                                onClick={() => setActiveTab("founder")}
                                className={`group/card relative p-1 rounded-xl transition-all duration-300 ${activeTab === 'founder' ? 'bg-gradient-to-r from-ethaum-green/50 to-transparent' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                <div className="bg-[#111] p-4 rounded-lg flex items-center gap-4 border border-white/5 h-full relative z-10">
                                    <div className={`p-2.5 rounded-lg transition-colors ${activeTab === 'founder' ? 'bg-ethaum-green text-black' : 'bg-white/5 text-gray-500'}`}>
                                        <Rocket size={18} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold text-xs ${activeTab === 'founder' ? 'text-white' : 'text-gray-400'}`}>Founder</div>
                                        <div className="text-[10px] text-gray-600">Scaling Deep Tech</div>
                                    </div>
                                    {activeTab === 'founder' && <div className="absolute right-4 w-1.5 h-1.5 bg-ethaum-green rounded-full shadow-[0_0_10px_#ccff00]"></div>}
                                </div>
                            </button>

                            {/* Role Card: Buyer */}
                            <button 
                                onClick={() => setActiveTab("buyer")}
                                className={`group/card relative p-1 rounded-xl transition-all duration-300 ${activeTab === 'buyer' ? 'bg-gradient-to-r from-blue-500/50 to-transparent' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                <div className="bg-[#111] p-4 rounded-lg flex items-center gap-4 border border-white/5 h-full relative z-10">
                                    <div className={`p-2.5 rounded-lg transition-colors ${activeTab === 'buyer' ? 'bg-blue-500 text-black' : 'bg-white/5 text-gray-500'}`}>
                                        <Building2 size={18} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold text-xs ${activeTab === 'buyer' ? 'text-white' : 'text-gray-400'}`}>Enterprise Buyer</div>
                                        <div className="text-[10px] text-gray-600">Seeking Pilots</div>
                                    </div>
                                    {activeTab === 'buyer' && <div className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>}
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Decor */}
                <div className="absolute bottom-0 left-0 text-[9px] text-gray-700 font-mono uppercase tracking-widest">
                    System v2.4.0 :: {authMode === 'forgot' ? 'RECOVERY' : activeTab.toUpperCase()}
                </div>
            </div>
        </div>

        {/* === RIGHT PANEL: CONTROL PLANE === */}
        <div className="flex-1 bg-[#0A0A0A] p-8 md:p-10 flex flex-col justify-center relative">
            
            {/* Header */}
            <div className="form-element flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                    {authMode === 'login' ? 'Identify.' : authMode === 'signup' ? 'Register.' : 'Recover.'}
                </h2>
                <button 
                    onClick={toggleMode}
                    className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group"
                >
                    {authMode === 'login' ? 'No Access?' : 'Has ID?'}
                    <span className="text-ethaum-green group-hover:underline">
                        {authMode === 'login' ? 'Apply for Key' : 'Login'}
                    </span>
                </button>
            </div>

            {/* Feedback Display */}
            {error && (
                <div className="form-element mb-6 p-3 bg-red-900/10 border-l-2 border-red-500 text-red-400 text-[10px] font-mono animate-in fade-in slide-in-from-left-2">
                    ERROR :: {error}
                </div>
            )}
            {successMsg && (
                <div className="form-element mb-6 p-3 bg-green-900/10 border-l-2 border-green-500 text-green-400 text-[10px] font-mono animate-in fade-in slide-in-from-left-2">
                    SUCCESS :: {successMsg}
                </div>
            )}

            {/* Form */}
            <form ref={formRef} onSubmit={authMode === 'forgot' ? handleForgot : handleAuth} className="flex flex-col gap-4">
                
                {/* Full Name (Signup Only) */}
                {authMode === 'signup' && (
                    <div className="form-element group relative">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-ethaum-green transition-colors" />
                        <input 
                            required 
                            type="text" 
                            placeholder="Full Name"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full bg-[#111] border border-white/5 rounded-xl px-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-ethaum-green/50 focus:bg-white/5 transition-all"
                        />
                    </div>
                )}

                {/* Email (Always Visible) */}
                <div className="form-element group relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-ethaum-green transition-colors" />
                    <input 
                        required 
                        type="email" 
                        placeholder={authMode === 'login' ? "Access ID (Email)" : "Corporate Email"}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#111] border border-white/5 rounded-xl px-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-ethaum-green/50 focus:bg-white/5 transition-all"
                    />
                </div>

                {/* Password (Login/Signup Only) */}
                {authMode !== 'forgot' && (
                    <div className="form-element group relative">
                        <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-ethaum-green transition-colors" />
                        <input 
                            required 
                            type="password" 
                            placeholder="Encrypted Key (Password)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-[#111] border border-white/5 rounded-xl px-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-ethaum-green/50 focus:bg-white/5 transition-all"
                        />
                    </div>
                )}

                {/* Forgot Password Link (Login Only) */}
                {authMode === 'login' && (
                    <div className="form-element flex justify-end">
                        <button 
                            type="button" 
                            onClick={() => setAuthMode('forgot')}
                            className="text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                {/* Startup Name (Founder Signup Only) */}
                {authMode === 'signup' && activeTab === 'founder' && (
                    <div className="form-element group relative">
                        <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-ethaum-green transition-colors" />
                        <input 
                            required 
                            type="text" 
                            placeholder="Venture Name"
                            value={startupName}
                            onChange={e => setStartupName(e.target.value)}
                            className="w-full bg-[#111] border border-white/5 rounded-xl px-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-ethaum-green/50 focus:bg-white/5 transition-all"
                        />
                    </div>
                )}

                {/* Action Button */}
                <button 
                    disabled={loading}
                    className="form-element mt-6 w-full group relative overflow-hidden rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest py-3.5 hover:bg-ethaum-green transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" size={16} /> : (
                            authMode === 'login' ? 'Authenticate' : 
                            authMode === 'signup' ? 'Initiate Launch' : 'Send Reset Link'
                        )}
                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </span>
                </button>

            </form>
        </div>

      </div>
    </div>
  );
}