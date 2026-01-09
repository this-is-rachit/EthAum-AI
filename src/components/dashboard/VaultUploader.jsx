import React from "react";
import { FileText, CheckCircle, Shield, UploadCloud } from "lucide-react";

export default function VaultUploader({ files, setFiles, uploading, stage, onLaunch }) {
  const fields = [
      { id: 'pitch_deck_url', label: 'Pitch Deck' },
      { id: 'technical_docs_url', label: 'Tech Documentation' },
      { id: 'financials_url', label: 'Financial Model' },
      { id: 'compliance_url', label: 'Compliance Log' }
  ];

  return (
    <div className="max-w-2xl mx-auto mt-10 animate-in zoom-in-95 duration-500">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ethaum-green to-transparent opacity-50"></div>

        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-ethaum-green shadow-[0_0_30px_rgba(204,255,0,0.15)]">
            <Shield size={28} />
        </div>

        <h2 className="text-3xl font-light text-white mb-2 tracking-tight">Secure <span className="font-bold">Vault.</span></h2>
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-10">Encrypt assets for Series {stage.split(" ")[1]} Diligence</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          {fields.map(({ id, label }) => (
            <div key={id} className={`relative border p-4 rounded-xl transition-all group ${files[id] ? 'bg-ethaum-green/5 border-ethaum-green/30' : 'bg-[#050505] border-white/5 hover:border-white/20'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-gray-400">
                    <FileText size={14}/>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                </div>
                {files[id] && <CheckCircle size={14} className="text-ethaum-green"/>}
              </div>
              
              <label className="cursor-pointer block w-full">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFiles(f => ({...f, [id]: e.target.files[0]}))} 
                    className="hidden"
                  />
                  <div className={`text-[10px] py-2 px-3 rounded border border-dashed text-center transition-colors ${files[id] ? 'border-ethaum-green/30 text-ethaum-green' : 'border-white/10 text-gray-600 hover:text-white hover:border-white/30'}`}>
                      {files[id] ? files[id].name : "Select PDF"}
                  </div>
              </label>
            </div>
          ))}
        </div>
        
        <button 
          onClick={onLaunch} 
          disabled={uploading} 
          className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-ethaum-green transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {uploading ? (
              <><UploadCloud className="animate-bounce" size={16}/> Encrypting & Uploading...</>
          ) : (
              "Activate Launch Command Center"
          )}
        </button>
      </div>
    </div>
  );
}