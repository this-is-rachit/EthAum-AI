import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/NavBar";
// REMOVED: import Loader from "../components/Loader";
import VaultDoor from "../components/VaultDoor";
import { 
  ArrowLeft, Globe, ShieldCheck, Zap, Layers, 
  Lock, FileText, ArrowUpRight, 
  Cpu, Star, Clock, AlertCircle, Loader2 // ADDED Loader2
} from "lucide-react";
import gsap from "gsap";

export default function StartupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth(); 
  
  const [startup, setStartup] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [requestStatus, setRequestStatus] = useState(null); 
  const [showLoader, setShowLoader] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));
      const dataPromise = (async () => {
          const { data: sData, error: sError } = await supabase.from('startups').select('*').eq('id', id).single();
          if (sError) throw sError;
          
          if (user && sData.founder_id === user.id) {
             navigate("/founder/dashboard");
             return null;
          }

          if (user && role === 'buyer') {
            const { data: rStatus } = await supabase.from('pilot_requests').select('status').eq('startup_id', id).eq('buyer_id', user.id).maybeSingle();
            if (rStatus) setRequestStatus(rStatus.status);
          }

          const { data: rData } = await supabase.from('reviews').select('*').eq('startup_id', id);
          let enrichedReviews = [];
          if (rData?.length > 0) {
              const userIds = [...new Set(rData.map(r => r.reviewer_id))];
              const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').in('id', userIds);
              enrichedReviews = rData.map(r => ({
                  ...r,
                  reviewer: profiles?.find(p => p.id === r.reviewer_id) || { full_name: "Anonymous" }
              }));
          }
          return { startup: sData, reviews: enrichedReviews };
      })();

      try {
        const [_, result] = await Promise.all([minLoadTime, dataPromise]);
        if (result) {
            setStartup(result.startup);
            setReviews(result.reviews);
        }
      } catch (error) { 
          if (!window.location.pathname.includes('founder/dashboard')) navigate("/"); 
      } finally {
          setShowLoader(false);
      }
    };
    loadData();
  }, [id, navigate, user, role]);

  useEffect(() => {
    if (!showLoader && startup) {
      gsap.fromTo(".fade-in", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 });
    }
  }, [showLoader, startup]);

  const handleRequestPilot = async () => {
    if (!user) { navigate("/auth?type=buyer&mode=login"); return; }
    
    if (role === 'founder') {
        alert("Restricted: Founder accounts cannot request pilots.");
        return;
    }

    try {
        const { error } = await supabase.from('pilot_requests').insert({ startup_id: startup.id, buyer_id: user.id, status: 'pending' });
        if (error) {
            if (error.code === '23505') alert("Signal already active.");
            else throw error;
        } else { setRequestStatus('pending'); }
    } catch (err) { alert("Failed to send request."); }
  };

  // --- REPLACED LOADER WITH SIMPLE SPINNER ---
  if (showLoader) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-ethaum-green" size={40} />
    </div>
  );
  
  if (!startup) return null;

  return (
    <>
      <Navbar />
      <div ref={containerRef} className="min-h-screen w-full pt-20 pb-12 px-6 md:px-12 lg:px-20 bg-black text-white font-sans selection:bg-ethaum-green selection:text-black">
        
        <div className="flex items-center justify-between mb-6 fade-in border-b border-white/10 pb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-all">
              <ArrowLeft size={12} /> Return
            </button>
            <div className="font-mono text-[10px] text-gray-500 uppercase">
              NODE_ID: {startup.id.split('-')[0]}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch fade-in">
            <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-xl flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center text-lg font-bold mb-4">
                        {startup.name.charAt(0)}
                      </div>
                      <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">{startup.name}</h1>
                      <p className="text-gray-500 text-xs leading-normal mb-6 uppercase tracking-tight">{startup.tagline}</p>
                    </div>
                    
                    <div className="space-y-2">
                        {role === 'founder' ? (
                            <div className="w-full bg-white/5 border border-white/10 text-gray-500 font-bold text-[10px] uppercase tracking-widest py-3 rounded flex items-center justify-center gap-2 cursor-not-allowed">
                                <AlertCircle size={12} /> Founder View Only
                            </div>
                        ) : !requestStatus ? (
                          <button onClick={handleRequestPilot} className="w-full bg-white text-black font-bold text-[10px] uppercase tracking-widest py-3 rounded hover:bg-ethaum-green transition-all flex items-center justify-center gap-2">
                            <Zap size={12} fill="currentColor" /> Request Access
                          </button>
                        ) : (
                          <div className={`w-full bg-white/5 border border-white/10 font-bold text-[10px] uppercase tracking-widest py-3 rounded flex items-center justify-center gap-2 ${
                            requestStatus === 'approved' ? 'text-ethaum-green border-ethaum-green/20' : 'text-yellow-500'
                          }`}>
                             {requestStatus === 'pending' ? 'Signal Pending' : requestStatus === 'approved' ? 'Vault Unlocked' : 'Access Restricted'}
                          </div>
                        )}
                        
                        {startup.website_url && (
                          <a href={startup.website_url} target="_blank" rel="noreferrer" className="w-full border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                            <Globe size={12} /> Terminal
                          </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded-xl">
                      <div className="text-[9px] text-gray-600 font-bold uppercase mb-1 tracking-widest">Stage</div>
                      <div className="text-sm font-black uppercase tracking-tight">{startup.stage || "Seed"}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded-xl">
                      <div className="text-[9px] text-gray-600 font-bold uppercase mb-1 tracking-widest">Capital</div>
                      <div className="text-sm font-black uppercase tracking-tight">{startup.arr_range || "N/A"}</div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-xl flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <Cpu size={14} className="text-ethaum-green" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Technology Briefing</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed font-medium">
                      {startup.description}
                    </p>
                </div>

                <div className="min-h-[280px] flex-1">
                    <VaultDoor isUnlocked={requestStatus === 'approved'} className="h-full rounded-xl">
                        {requestStatus === 'approved' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
                              <h2 className="text-xs font-bold text-ethaum-green uppercase tracking-[0.3em] mb-6">Secured Artifacts Unlocked</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                  {[
                                      { name: 'Pitch_Deck.pdf', url: startup.pitch_deck_url },
                                      { name: 'Technical_Docs', url: startup.technical_docs_url },
                                      { name: 'Financial_Model', url: startup.financials_url },
                                      { name: 'Compliance_Log', url: startup.compliance_url }
                                  ].map(doc => doc.url && (
                                    <a key={doc.name} href={doc.url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 border border-white/10 rounded flex items-center justify-between hover:bg-ethaum-green hover:text-black transition-all group">
                                        <div className="flex items-center gap-3">
                                          <FileText size={14}/>
                                          <span className="text-[9px] font-bold uppercase tracking-widest">{doc.name}</span>
                                        </div>
                                        <ArrowUpRight size={12} />
                                    </a>
                                  ))}
                              </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                              <Lock size={20} className="text-gray-800 mb-4" />
                              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">Vault Encrypted</h3>
                              <p className="text-gray-700 text-[9px] max-w-[200px] uppercase">Verify credentials to decrypt intelligence.</p>
                          </div>
                        )}
                    </VaultDoor>
                </div>
            </div>
        </div>

        <div className="w-full fade-in">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Market Validation</h3>
                    <div className="text-[9px] font-mono text-gray-600 uppercase">{reviews.length} Logs Detected</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/5 border border-white/10 rounded flex items-center justify-center text-[10px] font-bold text-ethaum-green">
                                      {review.reviewer?.full_name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold uppercase">{review.reviewer?.full_name}</div>
                                      <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">{review.reviewer?.role}</div>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 text-ethaum-green/50">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed font-medium tracking-tight italic">"{review.content}"</p>
                        </div>
                    )) : (
                      <div className="col-span-2 py-12 text-center opacity-30">
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em]">No validated logs found</span>
                      </div>
                    )}
                </div>
            </div>
        </div>

        {startup.deal_offer && (
            <div className="mt-4 bg-[#0A0A0A] border border-ethaum-green/30 px-6 py-4 rounded-xl flex items-center justify-between fade-in">
                <div className="flex items-center gap-4">
                    <div className="text-ethaum-green text-[10px] font-bold uppercase tracking-widest">Enterprise Offer:</div>
                    <div className="text-sm font-black uppercase tracking-tight">{startup.deal_offer}</div>
                </div>
                <ShieldCheck className="text-ethaum-green opacity-40" size={18} />
            </div>
        )}
      </div>
    </>
  );
}