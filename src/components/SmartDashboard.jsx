import StackedSection from "./StackedSection";
import { BarChart3, Users, Box, Settings, Plus, ArrowUpRight, Search } from "lucide-react";

export default function SmartDashboard() {
  return (
    <StackedSection title="Smart Dashboard" index={1} id="dashboard">
        {/* bg-transparent ensures the glass effect from parent shows */}
        <div className="w-full h-full flex flex-col md:flex-row bg-transparent">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r border-white/5 p-8 flex flex-col gap-2 bg-black/40">
                <div className="flex items-center gap-3 mb-12">
                <div className="w-6 h-6 rounded bg-ethaum-green flex items-center justify-center text-black font-bold text-xs">E</div>
                <span className="font-bold text-sm tracking-wide text-white">EthAum.ai</span>
                </div>
                <button className="flex items-center gap-3 w-full p-3 bg-ethaum-green text-black rounded-lg font-bold text-xs shadow-[0_0_15px_rgba(204,255,0,0.4)]"><BarChart3 size={16} /> Overview</button>
                <button className="flex items-center gap-3 w-full p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all text-xs font-medium"><Users size={16} /> Leads</button>
                <button className="flex items-center gap-3 w-full p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all text-xs font-medium"><Box size={16} /> Products</button>
                <div className="mt-auto"><button className="flex items-center gap-3 w-full p-3 text-gray-500 hover:text-white text-xs font-medium"><Settings size={16} /> Settings</button></div>
            </div>
            {/* Content */}
            <div className="flex-1 p-8 md:p-12 bg-transparent">
                <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-light text-white mb-1">Overview</h2>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Real-time Accelerator Metrics</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/search:text-white transition-colors" size={14} />
                        <input type="text" placeholder="Search..." className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:border-ethaum-green focus:outline-none transition-colors w-40 focus:w-56 transition-all duration-300" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-ethaum-green transition-colors shadow-lg"><Plus size={14} /> New Launch</button>
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-ethaum-green/30 transition-all duration-300 group/card">
                    <div className="flex justify-between items-start mb-8"><span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Revenue</span><ArrowUpRight size={16} className="text-gray-600 group-hover/card:text-ethaum-green transition-colors" /></div>
                    <div className="text-4xl font-mono text-white tracking-tighter mb-2">$128,500</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-ethaum-green transition-all duration-300 relative overflow-hidden group/card shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-ethaum-green shadow-[0_0_15px_#ccff00]"></div>
                    <div className="flex justify-between items-start mb-8"><span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Active Pilots</span><span className="flex h-1.5 w-1.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ethaum-green opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ethaum-green"></span></span></div>
                    <div className="flex items-baseline gap-2 mb-2"><div className="text-4xl font-mono text-white tracking-tighter">42</div><span className="text-ethaum-green text-lg font-bold">↗</span></div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-ethaum-green/30 transition-all duration-300 group/card">
                    <div className="flex justify-between items-start mb-8"><span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Avg. Deal Size</span><div className="h-4 w-4 rounded-full border border-gray-700 flex items-center justify-center text-[8px] text-gray-500">i</div></div>
                    <div className="text-4xl font-mono text-white tracking-tighter mb-2">$15,200</div>
                </div>
                </div>
            </div>
        </div>
    </StackedSection>
  );
}