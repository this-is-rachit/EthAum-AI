import React, { useEffect } from "react";
import { X, Zap, Sparkles, Loader2 } from "lucide-react";
import { useLenis } from "@studio-freight/react-lenis";

export default function EditStartupModal({ 
  isOpen, onClose, formData, setFormData, handleAiFill, aiLoading, uploading, onSave, setFiles 
}) {
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = 'unset';
    }
    return () => { lenis?.start(); document.body.style.overflow = 'unset'; };
  }, [isOpen, lenis]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
      data-lenis-prevent
    >
      {/* Width increased to max-w-2xl for better readability */}
      <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col max-h-[85vh] font-mono overflow-hidden">
        
        {/* HEADER: Professional Height */}
        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#080808] shrink-0">
          <div className="flex items-center gap-3">
            <Zap className="text-ethaum-green" size={18}/>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Sync Terminal Intelligence</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded">
            <X size={20}/>
          </button>
        </div>

        {/* SCROLLABLE BODY: Stealth Scroll */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-terminal-scroll">
          <style>{`
            .custom-terminal-scroll::-webkit-scrollbar { display: none; }
            .custom-terminal-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          {/* Top Row Grid */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Company Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded text-xs text-white focus:border-ethaum-green outline-none transition-colors" />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Website URL</label>
                <input value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded text-xs text-white focus:border-ethaum-green outline-none transition-colors" />
             </div>
          </div>

          {/* Mid Row Grid */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Current Stage</label>
                <select className="w-full bg-black border border-white/10 p-3 text-xs text-white focus:border-ethaum-green outline-none cursor-pointer" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                  <option value="Series D">Series D</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Capital Raised</label>
                <select className="w-full bg-black border border-white/10 p-3 text-xs text-white focus:border-ethaum-green outline-none cursor-pointer" value={formData.arr_range} onChange={e => setFormData({...formData, arr_range: e.target.value})}>
                  <option value="$1M-$5M">$1M-$5M</option>
                  <option value="$5M-$20M">$5M-$20M</option>
                  <option value="$20M-$50M">$20M-$50M</option>
                  <option value="$50M+">$50M+</option>
                </select>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Pilot Deal / Offer</label>
            <input value={formData.deal_offer} onChange={e => setFormData({...formData, deal_offer: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded text-xs text-ethaum-green font-bold focus:border-ethaum-green outline-none" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Tagline</label>
              <button onClick={handleAiFill} className="text-ethaum-green text-[9px] font-black flex items-center gap-1.5 hover:brightness-125 transition-all">
                {aiLoading ? "PROCESSING..." : <><Sparkles size={12}/> AI OPTIMIZE</>}
              </button>
            </div>
            <input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded text-xs text-white focus:border-ethaum-green outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Full Intelligence Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 p-3 rounded text-xs text-white outline-none focus:border-ethaum-green resize-none" rows={4}/>
          </div>

          {/* VAULT SECTION: Professional List */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Vault Assets</h3>
            <div className="grid grid-cols-1 gap-3">
              {['pitch_deck_url', 'technical_docs_url', 'financials_url', 'compliance_url'].map(id => (
                 <div key={id} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{id.replace('_url', '').replace(/_/g, ' ')}</span>
                    <input type="file" accept=".pdf" className="text-[10px] text-gray-500 cursor-pointer w-48 file:hidden" onChange={(e) => setFiles(f => ({...f, [id]: e.target.files[0]}))}/>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER: Fixed at bottom */}
        <div className="p-6 border-t border-white/5 bg-[#080808] shrink-0">
          <button 
            onClick={onSave} 
            disabled={uploading}
            className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-ethaum-green transition-all shadow-xl"
          >
            {uploading ? <Loader2 className="animate-spin mx-auto" size={16}/> : "Confirm Synchronization"}
          </button>
        </div>
      </div>
    </div>
  );
}