import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/NavBar";
import Loader from "../components/Loader";
import { BarChart3, Search, Filter, Briefcase, Clock, CheckCircle2, XCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("watchlist"); // 'watchlist' or 'pilots'
  
  const [watchlist, setWatchlist] = useState([]);
  const [requests, setRequests] = useState([]);

  const containerRef = useRef(null);

  useEffect(() => {
    if (user) fetchBuyerData();
  }, [user]);

  const fetchBuyerData = async () => {
    try {
      // 1. Fetch Watchlist (Upvoted Startups)
      // Note: We join 'startup_upvotes' with 'startups'
      const { data: watchData, error: watchError } = await supabase
        .from('startup_upvotes')
        .select(`
          startup_id,
          startups ( * )
        `)
        .eq('user_id', user.id);

      if (watchError) throw watchError;
      setWatchlist(watchData.map(item => item.startups));

      // 2. Fetch Pilot Requests
      const { data: reqData, error: reqError } = await supabase
        .from('pilot_requests')
        .select(`
          *,
          startups ( name, stage, arr_range, logo_url )
        `)
        .eq('buyer_id', user.id);

      if (reqError) throw reqError;
      setRequests(reqData);

    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      // Lazy load simulation for smoothness
      setTimeout(() => setLoading(false), 1200);
    }
  };

  // --- ANIMATIONS ---
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(".dash-item", {
          y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, activeTab]);

  // Handle Loader
  if (loading) return <Loader onComplete={() => {}} />;

  return (
    <>
      <Navbar />
      
      <div ref={containerRef} className="min-h-screen w-full pt-28 px-6 md:px-12 pb-20 relative z-10 font-sans flex flex-col">
        
        {/* HEADER */}
        <div className="dash-item flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Enterprise Console</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Deal Flow<span className="text-blue-500">.</span>
            </h1>
          </div>
          
          {/* Stats Summary */}
          <div className="flex gap-6 mt-6 md:mt-0">
             <div className="text-right">
                <div className="text-3xl font-black text-white">{watchlist.length}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Watchlist</div>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div className="text-right">
                <div className="text-3xl font-black text-white">{requests.length}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Pilots</div>
             </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="dash-item flex items-center gap-6 mb-8">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => setActiveTab("watchlist")}
                  className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'watchlist' ? 'bg-blue-500 text-black shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'text-gray-400 hover:text-white'}`}
                >
                    Watchlist
                </button>
                <button 
                  onClick={() => setActiveTab("pilots")}
                  className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'pilots' ? 'bg-blue-500 text-black shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'text-gray-400 hover:text-white'}`}
                >
                    Pilot Requests
                </button>
            </div>
            
            <div className="hidden md:flex items-center gap-3 ml-auto opacity-50">
                <Search size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-mono">SEARCH DEALS...</span>
            </div>
        </div>

        {/* --- TAB CONTENT: WATCHLIST --- */}
        {activeTab === 'watchlist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map(startup => (
                    <div key={startup.id} onClick={() => navigate(`/startup/${startup.id}`)} className="dash-item group bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl font-bold text-white">
                                {startup.name.charAt(0)}
                            </div>
                            <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 font-bold uppercase">{startup.stage}</div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{startup.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">{startup.tagline}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest border-t border-white/5 pt-4">
                            <TrendingUp size={12} className="text-blue-500" /> High Velocity
                        </div>
                    </div>
                ))}
                
                {watchlist.length === 0 && (
                   <div className="dash-item col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-4">No startups in watchlist.</p>
                      <button onClick={() => navigate('/')} className="text-blue-400 text-xs font-bold uppercase tracking-widest hover:underline">Explore Feed</button>
                   </div>
                )}
            </div>
        )}

        {/* --- TAB CONTENT: PILOTS --- */}
        {activeTab === 'pilots' && (
            <div className="flex flex-col gap-3">
                {/* Header Row */}
                <div className="dash-item grid grid-cols-12 px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <div className="col-span-4">Startup</div>
                    <div className="col-span-2">Stage</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-3 text-right">Last Update</div>
                </div>

                {/* Rows */}
                {requests.map(req => (
                    <div key={req.id} className="dash-item grid grid-cols-12 px-6 py-4 bg-[#0A0A0A] border border-white/10 rounded-xl items-center hover:bg-white/5 transition-colors">
                        <div className="col-span-4 flex items-center gap-4">
                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                                {req.startups.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-white">{req.startups.name}</span>
                        </div>
                        <div className="col-span-2 text-xs text-gray-400 font-medium">{req.startups.stage}</div>
                        <div className="col-span-3">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : ''}
                                ${req.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ''}
                                ${req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
                            `}>
                                {req.status === 'pending' && <Clock size={10} />}
                                {req.status === 'approved' && <CheckCircle2 size={10} />}
                                {req.status === 'rejected' && <XCircle size={10} />}
                                {req.status}
                            </span>
                        </div>
                        <div className="col-span-3 text-right text-xs text-gray-500 font-mono">
                            {new Date(req.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
                
                {requests.length === 0 && (
                   <div className="dash-item py-20 text-center border border-dashed border-white/10 rounded-2xl">
                      <p className="text-gray-500 text-sm mb-4">No active pilot requests.</p>
                      <button onClick={() => navigate('/')} className="text-blue-400 text-xs font-bold uppercase tracking-widest hover:underline">Find Technology</button>
                   </div>
                )}
            </div>
        )}

      </div>
    </>
  );
}