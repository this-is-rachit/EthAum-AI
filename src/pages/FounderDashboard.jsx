import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { generateLaunchAssets } from "../lib/openai"; 
import { Loader2 } from "lucide-react"; // IMPORT SPINNER ICON

// Components
import Navbar from "../components/NavBar"; 
// REMOVED: import Loader from "../components/Loader"; 
import ChatWindow from "../components/ChatWindow";
import EditStartupModal from "../components/EditStartupModal";
import FounderOnboarding from "../components/dashboard/FounderOnboarding";
import VaultUploader from "../components/dashboard/VaultUploader";
import FounderMainView from "../components/dashboard/FounderMainView";

export default function FounderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [startup, setStartup] = useState(null);
  const [requests, setRequests] = useState([]);
  
  // UI State
  const [step, setStep] = useState(0); 
  const [activeTab, setActiveTab] = useState("listed"); 
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form & AI State
  const [formData, setFormData] = useState({
    name: "", website_url: "", tagline: "", description: "", stage: "Series A", arr_range: "$1M-$5M", deal_offer: ""
  });
  const [files, setFiles] = useState({
    pitch_deck_url: null, technical_docs_url: null, financials_url: null, compliance_url: null
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleAiFill = async () => {
    if (!formData.description || formData.description.length < 5) {
        alert("Please provide at least a rough description or URL for the Neural Net.");
        return;
    }
    setAiLoading(true); setAiError(null);
    try {
      const assets = await generateLaunchAssets(formData.description, formData.website_url);
      setFormData(prev => ({ ...prev, tagline: assets.tagline || prev.tagline, deal_offer: assets.offer || prev.deal_offer, description: assets.elaborated_description || prev.description }));
    } catch (error) {
      console.error(error); setAiError("Neural Uplink Failed. Check API Quota.");
    } finally { setAiLoading(false); }
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

  const handleRequestStatus = async (requestId, newStatus) => {
    const { error } = await supabase.from('pilot_requests').update({ status: newStatus }).eq('id', requestId);
    if (!error) setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
  };

  // --- REPLACED LOADER WITH SIMPLE SPINNER ---
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-ethaum-green" size={40} />
    </div>
  );

  return (
    <>
      <Navbar />
      {activeChatRequest && <ChatWindow request={activeChatRequest} currentUser={user} onClose={() => setActiveChatRequest(null)} />}
      
      <EditStartupModal 
        isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        formData={formData} setFormData={setFormData}
        handleAiFill={handleAiFill} aiLoading={aiLoading}
        uploading={uploading} onSave={handleUpdateStartup} setFiles={setFiles}
      />

      <div className="min-h-screen bg-black pt-24 pb-12 px-4 md:px-8 text-white font-sans selection:bg-ethaum-green selection:text-black">
        {step === 0 && (
          <FounderOnboarding 
            formData={formData} setFormData={setFormData} 
            handleAiFill={handleAiFill} aiLoading={aiLoading} aiError={aiError}
            onSave={async () => {
               if (!formData.name || !formData.description) return alert("Terminal requires Name and Description.");
               const { data } = await supabase.from('startups').upsert({
                 founder_id: user.id, ...formData, is_onboarded: true
               }).select().single();
               setStartup(data); setStep(1);
            }}
          />
        )}

        {step === 1 && (
          <VaultUploader 
            files={files} setFiles={setFiles} uploading={uploading} stage={formData.stage}
            onLaunch={async () => {
               setUploading(true);
               const updates = { vault_ready: true };
               for (const key in files) if (files[key]) updates[key] = await uploadToStorage(files[key], key);
               await supabase.from('startups').update(updates).eq('founder_id', user.id);
               setUploading(false);
               fetchInitialData();
            }}
          />
        )}

        {step === 2 && (
          <FounderMainView 
            startup={startup} requests={requests}
            activeTab={activeTab} setActiveTab={setActiveTab}
            setIsEditModalOpen={setIsEditModalOpen}
            handleRequestStatus={handleRequestStatus}
            setActiveChatRequest={setActiveChatRequest}
          />
        )}
      </div>
    </>
  );
}