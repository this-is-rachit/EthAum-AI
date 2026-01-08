import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/NavBar";
import Loader from "../components/Loader";
import VaultDoor from "../components/VaultDoor";
import { ArrowLeft, Globe, ShieldCheck, Zap, Layers, DollarSign, Lock, FileText, ArrowUpRight, Cpu, Share2 } from "lucide-react";
import gsap from "gsap";

export default function StartupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [startup, setStartup] = useState(null);
  const [showLoader, setShowLoader] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));
      const dataFetch = supabase.from('startups').select('*').eq('id', id).single();

      try {
        const [_, { data, error }] = await Promise.all([minLoadTime, dataFetch]);
        if (error) throw error;
        setStartup(data);
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    loadData();
  }, [id, navigate]);

  useEffect(() => {
    if (!showLoader && startup) {
      gsap.fromTo(".fade-in", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [showLoader, startup]);

  const handleRequestPilot = async () => {
    if (!user) {
        const confirmLogin = window.confirm("You must be logged in to request a pilot. Sign in now?");
        if (confirmLogin) navigate("/auth?type=buyer&mode=login");
        return;
    }

    try {
        // Check if already requested
        const { data: existing } = await supabase
            .from('pilot_requests')
            .select('id')
            .eq('startup_id', startup.id)
            .eq('buyer_id', user.id)
            .single();

        if (existing) {
            alert("Request already active. Check your Dashboard.");
            return;
        }

        const { error } = await supabase
            .from('pilot_requests')
            .insert({
                startup_id: startup.id,
                buyer_id: user.id,
                status: 'pending'
            });

        if (error) throw error;
        alert("Pilot Request Sent! The founder has been notified.");
        
    } catch (err) {
        console.error("Pilot request error:", err);
        alert("Failed to send request. Please try again.");
    }
  };

  if (showLoader) {
    if (startup) return <Loader onComplete={() => setShowLoader(false)} />;
    return <Loader onComplete={() => {}} />;
  }

  if (!startup) return null;

  return (
    <>
      <Navbar />
      
      <div ref={containerRef} className="min-h-screen w-full pt-24 pb-12 px-4 md:px-12 relative z-10 font-sans flex flex-col">
        
        {/* COMPACT HEADER */}
        <div className="flex items-center justify-between mb-6 fade-in border-b border-white/5 pb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Intelligence
            </button>
            <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-gray-400 font-mono">ID: {startup.id.slice(0,8).toUpperCase()}</div>
                <button className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Share2 size={14} /></button>
            </div>
        </div>

        {/* --- MAIN COMMAND CENTER GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 fade-in items-stretch">
            
            {/* === COL 1: IDENTITY & STATS (4 Cols) === */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl relative overflow-hidden flex-1 flex flex-col justify-between group">
                    <div>
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><ShieldCheck size={100} className="text-ethaum-green" /></div>
                        
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-3xl font-black text-white mb-6 shadow-inner">
                            {startup.name.charAt(0)}
                        </div>
                        
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">{startup.name}</h1>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-1.5 h-1.5 bg-ethaum-green rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-ethaum-green uppercase tracking-widest">Verified & Active</span>
                        </div>

                        <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6 border-l-2 border-white/10 pl-4">
                            {startup.tagline}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button 
                            onClick={handleRequestPilot}
                            className="col-span-2 bg-ethaum-green text-black font-bold text-xs uppercase tracking-widest py-4 rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] flex items-center justify-center gap-2"
                        >
                           <Zap size={14} /> Request Pilot
                        </button>
                        <a href={startup.website_url} target="_blank" rel="noreferrer" className="col-span-2 bg-black text-white border border-white/10 font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                           <Globe size={14} /> Website
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 h-32">
                    <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute right-2 top-2 opacity-20"><Layers size={20} className="text-gray-500" /></div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Stage</div>
                        <div className="text-xl font-black text-white">{startup.stage}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute right-2 top-2 opacity-20"><DollarSign size={20} className="text-gray-500" /></div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">ARR</div>
                        <div className="text-xl font-black text-white">{startup.arr_range}</div>
                    </div>
                </div>
            </div>

            {/* === COL 2: INTELLIGENCE & VAULT (8 Cols) === */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-1.5 bg-white/5 rounded text-ethaum-green"><Cpu size={16} /></div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Technology Briefing</h3>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base leading-7 font-light">
                        {startup.description || "Detailed technical breakdown restricted. Contact founder for architecture review."}
                    </p>
                </div>

                <div className="flex-1 min-h-[350px]">
                    <VaultDoor className="h-full">
                        <div className="p-8 h-full flex flex-col justify-center">
                             
                             <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <Lock size={18} className="text-ethaum-green" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Due Diligence Vault</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-ethaum-green animate-pulse"></div>
                                   <div className="text-[9px] text-ethaum-green font-bold uppercase tracking-wider">Secure Connection</div>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                <div className="group flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl hover:border-ethaum-green/50 cursor-pointer transition-all h-full">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-lg text-gray-400 group-hover:text-ethaum-green transition-colors"><FileText size={20} /></div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Pitch_Deck_v4.pdf</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">4.2 MB • Verified Source</div>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-gray-600 group-hover:text-ethaum-green transition-colors" />
                                </div>

                                <div className="group flex items-center justify-between p-4 bg-black border border-white/10 rounded-xl hover:border-ethaum-green/50 cursor-pointer transition-all h-full">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/5 rounded-lg text-gray-400 group-hover:text-ethaum-green transition-colors"><FileText size={20} /></div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Tech_Review.pdf</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">8.1 MB • Validated</div>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-gray-600 group-hover:text-ethaum-green transition-colors" />
                                </div>
                             </div>

                             <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-500 uppercase tracking-widest">
                                <span>Session ID: {startup.id.slice(0,8).toUpperCase()}</span>
                                <span>Access Logged & Monitored</span>
                             </div>
                        </div>
                    </VaultDoor>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}