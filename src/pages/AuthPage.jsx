import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Rocket, Building2, ArrowRight, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL Params: ?type=buyer&mode=login
  const initialType = searchParams.get("type") === "buyer" ? "buyer" : "founder";
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [activeTab, setActiveTab] = useState(initialType);
  const [authMode, setAuthMode] = useState(initialMode); // 'login' or 'signup'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startupName, setStartupName] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (authMode === 'signup') {
        // --- SIGN UP LOGIC ---
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: activeTab,
              full_name: fullName,
              startup_name: activeTab === "founder" ? startupName : null,
            },
          },
        });
      } else {
        // --- SIGN IN LOGIC ---
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { data, error: authError } = result;
      if (authError) throw authError;

      if (data.user) {
        // --- IMPROVED REDIRECT LOGIC ---
        // We use the ACTUAL role from the database, not just the tab they clicked.
        // This prevents a "Buyer" from accidentally logging in on the "Founder" tab 
        // and getting sent to the wrong dashboard initially.
        const userRole = data.user.user_metadata?.role;

        if (userRole === "founder") {
            navigate("/founder/dashboard");
        } else if (userRole === "buyer") {
            navigate("/buyer/dashboard");
        } else {
            // Fallback for users without a role (shouldn't happen with new logic)
            navigate("/");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative z-50">
      
      {/* Awwwards-style Back Button */}
      <button 
        onClick={() => navigate("/")} 
        className="absolute top-8 left-8 flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer z-50 group"
      >
        <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-medium tracking-wide">Back to Home</span>
      </button>

      {/* The Main Glassmorphism Card */}
      <div className="w-full max-w-5xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row min-h-[650px]">
        
        {/* LEFT SIDE: Role Selector */}
        <div className="w-full md:w-5/12 bg-[#0A0A0A]/80 border-b md:border-b-0 md:border-r border-white/5 p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Dynamic Glow Background based on Active Tab */}
          <div className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 pointer-events-none ${activeTab === 'founder' ? 'opacity-100' : 'opacity-0'}`}>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ethaum-green/10 rounded-full blur-[150px]"></div>
          </div>
          <div className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 pointer-events-none ${activeTab === 'buyer' ? 'opacity-100' : 'opacity-0'}`}>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-3">
              Join EthAum<span className="text-ethaum-green">.ai</span>
            </h1>
            <p className="text-gray-400 text-sm tracking-wide mb-12">
              The Series A-D Intelligence Layer.
            </p>

            {/* Role Selection Cards */}
            <div className="flex flex-col gap-5">
               <button type="button" onClick={() => setActiveTab("founder")} className={`flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${activeTab === 'founder' ? 'bg-ethaum-green/5 border-ethaum-green' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}>
                  <div className={`p-4 rounded-full transition-colors ${activeTab === 'founder' ? 'bg-ethaum-green text-black' : 'bg-white/10 text-gray-400 group-hover:text-white'}`}>
                      <Rocket size={24} />
                  </div>
                  <div>
                    <div className={`font-bold text-lg transition-colors ${activeTab === 'founder' ? 'text-ethaum-green' : 'text-white'}`}>Founder</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300">Scaling to $50M ARR</div>
                  </div>
               </button>

               <button type="button" onClick={() => setActiveTab("buyer")} className={`flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${activeTab === 'buyer' ? 'bg-blue-500/5 border-blue-500' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}>
                  <div className={`p-4 rounded-full transition-colors ${activeTab === 'buyer' ? 'bg-blue-500 text-black' : 'bg-white/10 text-gray-400 group-hover:text-white'}`}>
                      <Building2 size={24} />
                  </div>
                  <div>
                    <div className={`font-bold text-lg transition-colors ${activeTab === 'buyer' ? 'text-blue-500' : 'text-white'}`}>Enterprise Buyer</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300">Seeking Pilot Deals</div>
                  </div>
               </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center relative">
          
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold text-white tracking-tight">
               {authMode === 'login' ? 'Sign In.' : (activeTab === 'founder' ? 'List Startup.' : 'Find Tech.')}
            </h2>
            
            {/* Awwwards-style Mode Toggle */}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-[11px] font-black text-ethaum-green hover:text-white uppercase tracking-[0.15em] transition-colors border-b-2 border-ethaum-green pb-1"
            >
              {authMode === 'login' ? 'CREATE ACCOUNT' : 'LOGIN INSTEAD'}
            </button>
          </div>
          
          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{error}</div>}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
             {/* Full Name - Only for Signup */}
             {authMode === 'signup' && (
               <div className="group">
                 <input required type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all" />
               </div>
             )}
             
             {/* Email */}
             <div className="group">
                <input required type="email" placeholder={activeTab === 'founder' ? "founder@startup.com" : "corporate@company.com"} value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all" />
             </div>
             
             {/* Password */}
             <div className="group">
                <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all" />
             </div>
             
             {/* Startup Name - Only for Founder Signup */}
             {authMode === 'signup' && activeTab === 'founder' && (
               <div className="group">
                 <input required type="text" placeholder="Startup Name" value={startupName} onChange={e => setStartupName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 font-medium focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all" />
               </div>
             )}

             <button disabled={loading} className={`mt-6 w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${activeTab === 'founder' ? 'bg-ethaum-green text-black hover:bg-[#b3ff00] shadow-ethaum-green/20' : 'bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/20'}`}>
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight size={20} />}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}