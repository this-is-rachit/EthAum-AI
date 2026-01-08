import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/NavBar"; 
import Loader from "../components/Loader"; 
import ChatWindow from "../components/ChatWindow"; // Import Chat
import { Rocket, BarChart3, Plus, CheckCircle2, AlertCircle, TrendingUp, Globe, Tag, Layers, DollarSign, Inbox, Check, X, Clock, User, MessageCircle } from "lucide-react";
import gsap from "gsap";

export default function FounderDashboard() {
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); 
  const [startup, setStartup] = useState(null);
  const [requests, setRequests] = useState([]);
  
  // Chat State
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  
  // Refs
  const containerRef = useRef(null);
  const scoreRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "", tagline: "", description: "", website_url: "", stage: "Series A", arr_range: "$1M-$5M"
  });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Startup Profile
      const { data: startupData, error: startupError } = await supabase
        .from('startups')
        .select('*')
        .eq('founder_id', user.id)
        .single();

      if (startupError && startupError.code !== 'PGRST116') throw startupError;
      
      if (startupData) {
        setStartup(startupData);
        setFormData(startupData);
        
        // Initial Fetch of Requests
        await fetchRequestsManual(startupData.id);

        // Realtime Subscription
        const channel = supabase.channel('founder-requests')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'pilot_requests', filter: `startup_id=eq.${startupData.id}` },
            () => fetchRequestsManual(startupData.id)
          )
          .subscribe();

        return () => supabase.removeChannel(channel);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false); 
    }
  };

  // --- ROBUST FETCH FUNCTION (No Joins) ---
  const fetchRequestsManual = async (startupId) => {
    try {
        // A. Get Requests
        const { data: rawRequests, error: reqError } = await supabase
          .from('pilot_requests')
          .select('*')
          .eq('startup_id', startupId)
          .order('created_at', { ascending: false });

        if (reqError) throw reqError;
        if (!rawRequests || rawRequests.length === 0) {
            setRequests([]);
            return;
        }

        // B. Get Buyers manually using IDs from requests
        const buyerIds = [...new Set(rawRequests.map(r => r.buyer_id))];
        
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email, startup_name')
            .in('id', buyerIds);

        if (profileError) throw profileError;

        // C. Merge Data
        const mergedRequests = rawRequests.map(req => {
            const buyer = profiles.find(p => p.id === req.buyer_id);
            return {
                ...req,
                buyer: buyer || { full_name: "Unknown Buyer", email: "N/A" } // Fallback
            };
        });

        setRequests(mergedRequests);

    } catch (err) {
        console.error("Manual Fetch Error:", err);
    }
  };

  // --- ACTIONS ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('startups')
        .upsert({ founder_id: user.id, ...formData, updated_at: new Date() });
      if (error) throw error;
      fetchDashboardData();
      alert("Profile updated successfully.");
    } catch (error) { alert(error.message); }
  };

  const handleRequestAction = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('pilot_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      
      if (error) throw error;
      
      // Update UI Optimistically
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      alert("Failed to update request.");
    }
  };

  // --- ANIMATIONS ---
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(".dash-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.05, ease: "power2.out" });
        if (scoreRef.current && startup) {
            gsap.from(scoreRef.current, {
                textContent: 0, duration: 2, ease: "power2.out", snap: { textContent: 1 },
                onUpdate: function() { this.targets()[0].innerHTML = Math.ceil(this.targets()[0].textContent); },
            });
        }
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, activeTab]);

  if (loading) return <Loader onComplete={() => {}} />;

  return (
    <>
    <Navbar />
    
    {/* CHAT MODAL */}
    {activeChatRequest && (
        <ChatWindow 
            request={activeChatRequest} 
            currentUser={user} 
            onClose={() => setActiveChatRequest(null)} 
        />
    )}
    
    <div ref={containerRef} className="min-h-screen w-full pt-28 px-6 md:px-12 pb-20 relative z-10 font-sans">
      
      {/* HEADER & TABS */}
      <div className="dash-item flex flex-col md:flex-row justify-between items-end mb-10 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Founder Studio<span className="text-ethaum-green">.</span>
          </h1>
          <div className="flex items-center gap-6 mt-4">
             <button 
               onClick={() => setActiveTab("overview")}
               className={`text-xs font-bold uppercase tracking-widest transition-colors pb-1 border-b-2 ${activeTab === 'overview' ? 'text-white border-ethaum-green' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
             >
                Configuration
             </button>

             <button 
               onClick={() => setActiveTab("requests")}
               className={`text-xs font-bold uppercase tracking-widest transition-colors pb-1 border-b-2 flex items-center gap-2 ${activeTab === 'requests' ? 'text-white border-ethaum-green' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
             >
                Incoming Pilots
                {requests.filter(r => r.status === 'pending').length > 0 && (
                   <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
             </button>
          </div>
        </div>
        
        <div className="mt-6 md:mt-0">
           <button className="flex items-center gap-2 px-5 py-2 bg-ethaum-green text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white transition-colors shadow-[0_0_20px_rgba(204,255,0,0.2)]">
             <Plus size={14} /> New Launch
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- MAIN CONTENT AREA --- */}
        <div className="dash-item lg:col-span-8">
          
          {/* VIEW: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-ethaum-green"><Rocket size={18} /></div>
                    <h2 className="text-lg font-bold text-white">Profile Configuration</h2>
                </div>
                
                <form onSubmit={handleSave} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Startup Name</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-ethaum-green/50 focus:bg-white/5 outline-none transition-all" />
                        </div>
                        <div className="group">
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Website URL</label>
                            <input required type="url" value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-ethaum-green/50 focus:bg-white/5 outline-none transition-all" />
                        </div>
                    </div>
                    <div className="group">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">The Pitch</label>
                        <input required type="text" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-ethaum-green/50 focus:bg-white/5 outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Stage</label>
                            <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-ethaum-green/50 outline-none"><option>Series A</option><option>Series B</option><option>Series C</option><option>Series D</option></select>
                        </div>
                        <div className="group">
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">ARR</label>
                            <select value={formData.arr_range} onChange={e => setFormData({...formData, arr_range: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-ethaum-green/50 outline-none"><option>$1M-$5M</option><option>$5M-$20M</option><option>$20M-$50M</option><option>$50M+</option></select>
                        </div>
                    </div>
                    <div className="group">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Description</label>
                        <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 focus:border-ethaum-green/50 focus:bg-white/5 outline-none transition-all" />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-ethaum-green transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
          )}

          {/* VIEW: REQUESTS (INBOX) */}
          {activeTab === 'requests' && (
             <div className="flex flex-col gap-4">
                {requests.length === 0 ? (
                   <div className="bg-[#0A0A0A] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                      <Inbox size={48} className="mx-auto text-gray-600 mb-4" />
                      <h3 className="text-gray-400 font-bold">No Pending Requests</h3>
                      <p className="text-xs text-gray-600 mt-2">When buyers request a pilot, they will appear here.</p>
                   </div>
                ) : (
                   requests.map(req => (
                      <div key={req.id} className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-white/20 transition-colors">
                         
                         {/* Buyer Info */}
                         <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                               <User size={20} />
                            </div>
                            <div>
                               <h3 className="text-white font-bold">{req.buyer?.full_name || "Enterprise Buyer"}</h3>
                               <p className="text-xs text-gray-500">{req.buyer?.email || "No Email Provided"}</p>
                               <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider">
                                  <Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}
                               </div>
                            </div>
                         </div>

                         {/* Status Badge & Chat */}
                         <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setActiveChatRequest(req)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-ethaum-green border border-white/5 transition-all"
                                title="Open Chat"
                            >
                                <MessageCircle size={18} />
                            </button>

                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border 
                                ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                                ${req.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                                ${req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                            `}>
                               {req.status}
                            </span>
                         </div>

                         {/* Actions (Only show if pending) */}
                         {req.status === 'pending' && (
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => handleRequestAction(req.id, 'rejected')}
                                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Decline"
                                >
                                   <X size={18} />
                                </button>
                                <button 
                                  onClick={() => handleRequestAction(req.id, 'approved')}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ethaum-green text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                                >
                                   <Check size={14} /> Approve
                                </button>
                             </div>
                         )}
                      </div>
                   ))
                )}
             </div>
          )}

        </div>

        {/* --- RIGHT COLUMN: ANALYTICS HUD --- */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="dash-item relative bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 overflow-hidden group hover:border-ethaum-green/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-ethaum-green/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <div><h3 className="text-sm font-bold text-white">EthAum Score</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">ROI Probability</p></div>
                    <div className="p-2 bg-white/5 rounded-lg text-ethaum-green"><BarChart3 size={16} /></div>
                 </div>
                 <div className="flex items-baseline gap-1 mb-3">
                    <span ref={scoreRef} className="text-6xl font-black text-white tracking-tighter leading-none">{startup ? '850' : '0'}</span>
                    <span className="text-sm font-medium text-gray-600">/900</span>
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3"><div className="h-full bg-ethaum-green shadow-[0_0_10px_#ccff00]" style={{ width: startup ? '85%' : '0%' }}></div></div>
                 <div className="flex items-center gap-2 text-[10px] text-ethaum-green font-bold uppercase tracking-wide"><TrendingUp size={12} /><span>Top 5% of Sector</span></div>
              </div>
           </div>

           <div className="dash-item bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Launch Readiness</h3>
              <div className="space-y-3">
                 <div className={`flex items-center justify-between p-3 rounded-lg border ${startup ? 'bg-ethaum-green/5 border-ethaum-green/20' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-3">{startup ? <CheckCircle2 size={16} className="text-ethaum-green" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>}<span className={`text-xs font-bold ${startup ? 'text-white' : 'text-gray-500'}`}>Profile Created</span></div>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 opacity-40">
                    <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full border-2 border-gray-600"></div><span className="text-xs font-bold text-gray-500">Upload Pitch Deck</span></div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
    </>
  );
}