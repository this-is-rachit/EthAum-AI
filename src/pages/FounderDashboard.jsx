import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/NavBar"; 
import Loader from "../components/Loader"; 
import ChatWindow from "../components/ChatWindow";
import EditStartupModal from "../components/EditStartupModal";
import { 
  MessageCircle, FileText, Zap, Edit3, Globe, ExternalLink, 
  LayoutDashboard, Radio, CheckCircle, XCircle, Sparkles, Loader2 
} from "lucide-react";

export default function FounderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [startup, setStartup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  const [step, setStep] = useState(0); 
  const [activeTab, setActiveTab] = useState("listed"); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", website_url: "", tagline: "", description: "", stage: "Series A", arr_range: "$1M-$5M", deal_offer: ""
  });

  const [files, setFiles] = useState({
    pitch_deck_url: null, technical_docs_url: null, financials_url: null, compliance_url: null
  });

  useEffect(() => { if (user) fetchInitialData(); }, [user]);

  const fetchInitialData = async () => {
    try {
      const { data } = await supabase.from('startups').select('*').eq('founder_id', user.id).maybeSingle();
      if (data) {
        setStartup(data);
        setFormData({
            name: data.name || "", website_url: data.website_url || "", tagline: data.tagline || "",
            description: data.description || "", stage: data.stage || "Series A",
            arr_range: data.arr_range || "$1M-$5M", deal_offer: data.deal_offer || ""
        });
        if (!data.is_onboarded) setStep(0);
        else if (!data.vault_ready) setStep(1);
        else { setStep(2); fetchRequests(data.id); }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchRequests = async (startupId) => {
    const { data } = await supabase.from('pilot_requests').select('*, profiles:buyer_id (full_name, role, email)').eq('startup_id', startupId).order('created_at', { ascending: false });
    setRequests(data || []);
  };

  // --- RESTORED: APPROVE / REJECT LOGIC ---
  const handleRequestStatus = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('pilot_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      
      if (error) throw error;
      // Refresh local state
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const handleAiFill = async () => {
    if (!formData.description) return alert("Enter description first.");
    setAiLoading(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        tagline: `${prev.name} Neural Infrastructure for Enterprise`,
        deal_offer: "Priority API access + 20% discount for first 5 pilot partners.",
        description: prev.description + "\n\n[Optimized for EthAUM Investors]"
      }));
      setAiLoading(false);
    }, 1000);
  };

  const uploadToStorage = async (file, field) => {
    const path = `${user.id}/${field}_${Date.now()}.pdf`;
    await supabase.storage.from('vault-assets').upload(path, file);
    const { data } = supabase.storage.from('vault-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpdateStartup = async () => {
    setUploading(true);
    try {
      const updates = { ...formData };
      for (const key in files) if (files[key]) updates[key] = await uploadToStorage(files[key], key);
      await supabase.from('startups').update(updates).eq('id', startup.id);
      await fetchInitialData();
      setIsEditModalOpen(false);
    } finally { setUploading(false); }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      {activeChatRequest && <ChatWindow request={activeChatRequest} currentUser={user} onClose={() => setActiveChatRequest(null)} />}

      <EditStartupModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        handleAiFill={handleAiFill}
        aiLoading={aiLoading}
        uploading={uploading}
        onSave={handleUpdateStartup}
        setFiles={setFiles}
      />

      <div className="min-h-screen bg-black pt-28 px-6 text-white font-mono">
        {step < 2 ? (
            <div className="max-w-xl mx-auto mt-10">
                {step === 0 ? (
                    <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-xl">
                        <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><Zap className="text-ethaum-green" size={20}/> Initialize Terminal</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <input placeholder="STARTUP NAME" className="bg-black border border-white/10 p-4 text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                           <input placeholder="WEBSITE URL" className="bg-black border border-white/10 p-4 text-xs" value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <select className="bg-black border border-white/10 p-4 text-xs text-white" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                              <option value="Series A">Series A</option><option value="Series B">Series B</option><option value="Series C">Series C</option><option value="Series D">Series D</option>
                           </select>
                           <select className="bg-black border border-white/10 p-4 text-xs text-white" value={formData.arr_range} onChange={e => setFormData({...formData, arr_range: e.target.value})}>
                              <option value="$1M-$5M">$1M-$5M</option><option value="$5M-$20M">$5M-$20M</option><option value="$20M-$50M">$20M-$50M</option><option value="$50M+">$50M+</option>
                           </select>
                        </div>
                        <div className="relative mb-4">
                           <textarea placeholder="CORE DESCRIPTION" className="w-full bg-black border border-white/10 p-4 text-xs" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/>
                           <button onClick={handleAiFill} className="absolute bottom-4 right-4 bg-ethaum-green text-black px-3 py-1 rounded text-[9px] font-black flex items-center gap-1">
                              {aiLoading ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10}/>} AI FILL
                           </button>
                        </div>
                        <input placeholder="TAGLINE" className="w-full bg-black border border-white/10 p-4 mb-4 text-xs" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})}/>
                        <button onClick={async () => {
                             const { data } = await supabase.from('startups').upsert({
                               founder_id: user.id, name: formData.name, website_url: formData.website_url, tagline: formData.tagline,
                               stage: formData.stage, arr_range: formData.arr_range, description: formData.description, is_onboarded: true
                             }).select().single();
                             setStartup(data); setStep(1);
                        }} className="w-full py-4 bg-white text-black font-black text-xs uppercase hover:bg-ethaum-green transition-all">Move to Vault</button>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-xl font-black uppercase mb-8">Upload Vault Documents</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                            {['pitch_deck_url', 'technical_docs_url', 'financials_url', 'compliance_url'].map(id => (
                                <div key={id} className="border border-white/5 p-3 rounded bg-white/[0.02]">
                                    <label className="text-[8px] text-gray-500 uppercase block mb-1">{id.replace('_url', '').replace('_', ' ')}</label>
                                    <input type="file" onChange={(e) => setFiles(f => ({...f, [id]: e.target.files[0]}))} className="text-[10px] w-full"/>
                                </div>
                            ))}
                        </div>
                        <button onClick={async () => {
                             const updates = { vault_ready: true };
                             for (const key in files) if (files[key]) updates[key] = await uploadToStorage(files[key], key);
                             await supabase.from('startups').update(updates).eq('founder_id', user.id);
                             fetchInitialData();
                        }} className="w-full py-4 bg-ethaum-green text-black font-black text-xs uppercase shadow-lg shadow-ethaum-green/20">Launch Dashboard</button>
                    </div>
                )}
            </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end border-b border-white/10 pb-8 mb-10">
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter">{startup.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-ethaum-green text-[10px] font-bold uppercase tracking-[0.3em]">
                  Active // {startup.stage} // {startup.arr_range}
                  {startup.website_url && <a href={startup.website_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white"><Globe size={14}/></a>}
                </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setActiveTab("listed")} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase border transition-all ${activeTab === 'listed' ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500 hover:text-white'}`}>
                    <LayoutDashboard size={14}/> Listed Startup
                 </button>
                 <button onClick={() => setActiveTab("pilots")} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase border transition-all ${activeTab === 'pilots' ? 'bg-ethaum-green text-black border-ethaum-green' : 'border-white/10 text-gray-500 hover:text-white'}`}>
                    <Radio size={14} className={activeTab === 'pilots' ? 'animate-pulse' : ''}/> Signal Log ({requests.length})
                 </button>
              </div>
            </div>

            {activeTab === "listed" ? (
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-2xl relative">
                            <button onClick={() => setIsEditModalOpen(true)} className="absolute top-8 right-8 text-gray-600 hover:text-ethaum-green"><Edit3 size={18}/></button>
                            <h3 className="text-[10px] font-black text-gray-600 uppercase mb-6 tracking-widest">Intelligence Profile</h3>
                            <div className="flex gap-10 mb-8 border-l-2 border-ethaum-green pl-6">
                               <div><p className="text-[8px] text-gray-600 uppercase mb-1">Deal Offer</p><p className="text-sm font-bold text-ethaum-green">{startup.deal_offer || "Negotiable"}</p></div>
                            </div>
                            <h4 className="text-ethaum-green text-lg font-bold uppercase mb-4">{startup.tagline || "No tagline set"}</h4>
                            <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap">{startup.description}</p>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-5">
                        <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl">
                            <h3 className="text-[10px] font-black text-gray-600 uppercase mb-8 tracking-widest text-center">Verified Vault Assets</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {['pitch_deck_url', 'technical_docs_url', 'financials_url', 'compliance_url'].map(key => startup[key] && (
                                    <a key={key} href={startup[key]} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-black border border-white/5 rounded-xl hover:border-ethaum-green group">
                                        <div className="flex items-center gap-4">
                                            <FileText size={18} className="text-gray-600 group-hover:text-ethaum-green" />
                                            <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-white">{key.replace('_url', '').replace('_', ' ')}</span>
                                        </div>
                                        <ExternalLink size={12} className="text-gray-800 group-hover:text-white" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                        {requests.length > 0 ? requests.map(req => (
                            <div key={req.id} className="p-6 flex justify-between items-center hover:bg-white/[0.02]">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-xs font-black border border-white/10 uppercase">{req.profiles?.full_name?.charAt(0) || 'B'}</div>
                                    <div>
                                        <p className="text-sm font-black uppercase">{req.profiles?.full_name || 'Anonymous'}</p>
                                        <p className={`text-[9px] font-bold uppercase mt-1 ${req.status === 'approved' ? 'text-ethaum-green' : req.status === 'rejected' ? 'text-red-500' : 'text-gray-600'}`}>
                                          Status: {req.status} // {req.profiles?.role}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {req.status === 'pending' && (
                                      <>
                                        <button 
                                          onClick={() => handleRequestStatus(req.id, 'approved')}
                                          className="p-2 text-gray-500 hover:text-ethaum-green transition-colors"
                                          title="Approve Request"
                                        >
                                          <CheckCircle size={20} />
                                        </button>
                                        <button 
                                          onClick={() => handleRequestStatus(req.id, 'rejected')}
                                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                          title="Reject Request"
                                        >
                                          <XCircle size={20} />
                                        </button>
                                      </>
                                    )}
                                    <button 
                                      onClick={() => setActiveChatRequest(req)} 
                                      className="flex items-center gap-2 text-[8px] font-black text-gray-500 hover:text-white uppercase ml-4"
                                    >
                                      <MessageCircle size={16} /> Open Channel
                                    </button>
                                </div>
                            </div>
                        )) : (
                          <div className="p-20 text-center text-gray-600 text-xs font-black uppercase tracking-widest">
                            No incoming signals detected
                          </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}