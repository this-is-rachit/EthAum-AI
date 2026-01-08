import StackedSection from "./StackedSection";
import { Activity, Globe, Clock, ShieldCheck } from "lucide-react";

export default function EnterpriseDeals() {
  const deals = [
    { company: "Pfizer", startup: "BioFold AI", value: "$250k Pilot", status: "Active", time: "2m ago" },
    { company: "BMW Group", startup: "SolidState", value: "$150k POC", status: "Scaling", time: "14m ago" },
    { company: "JPMorgan", startup: "FinGuard", value: "Signed", status: "Just Now", time: "Now" },
    { company: "Shell", startup: "CarbonFix", value: "$500k Deal", status: "Active", time: "1h ago" },
    { company: "NVIDIA", startup: "RenderFlow", value: "Partner", status: "In Talks", time: "2h ago" },
    { company: "Walmart", startup: "LogiTech", value: "$100k Pilot", status: "Active", time: "4h ago" },
  ];

  // Duplicate list to create seamless infinite scroll
  const scrollDeals = [...deals, ...deals];

  return (
    <StackedSection title="Active Pilots" index={3} id="deals">
      {/* Custom Styles for Smooth Scrolling 
         We move -50% because the list is doubled. 
         'linear' is crucial for smoothness (no ticking).
      */}
      <style>{`
        @keyframes infiniteScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-smooth-scroll {
          animation: infiniteScroll 40s linear infinite;
        }
        .animate-smooth-scroll:hover {
          animation-play-state: paused;
        }
        /* Gradient Mask to fade top/bottom entries */
        .fade-mask {
          mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
        }
      `}</style>

      <div className="w-full h-full p-8 md:p-12 flex flex-col justify-center">
        
        <div className="flex items-center gap-3 mb-8">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Real-Time Deal Flow</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center h-full">
            
            {/* --- LEFT: HEADING --- */}
            <div className="z-10 relative">
                <h2 className="text-5xl md:text-7xl font-light text-white mb-6 leading-[0.9] tracking-tighter">
                    Scale with <br/><span className="font-bold text-blue-500">Giants.</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md border-l-2 border-white/10 pl-6">
                    Startups on EthAum secure pilots with Fortune 500s <span className="text-white font-bold">4x faster</span>.
                </p>
                
                <div className="mt-10 flex gap-4">
                    <a href="/auth?type=buyer" className="group px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]">
                        Enter Deal Room <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </a>
                </div>

                <div className="mt-12 flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Trusted By</div>
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-[#222] border border-white/10 flex items-center justify-center text-[9px] text-gray-400 font-bold">F{500-i}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT: SMOOTH SCROLLING TICKER --- */}
            {/* Height restricted to ~350px to show exactly 3 items at a time */}
            <div className="relative h-[350px] w-full overflow-hidden fade-mask">
                
                <div className="animate-smooth-scroll flex flex-col gap-4">
                    {scrollDeals.map((deal, i) => (
                        <div 
                            key={i} 
                            className="group flex items-center justify-between p-5 bg-[#0A0A0A] border border-white/10 rounded-2xl hover:bg-[#111] hover:border-blue-500/50 transition-all cursor-default"
                        >
                            {/* Left: Logos & Names */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm border border-white/5 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                                        {deal.company.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                        {deal.company} <span className="text-gray-600 text-[10px]">✕</span> {deal.startup}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                        <Globe size={10} /> Enterprise Match
                                    </div>
                                </div>
                            </div>

                            {/* Right: Value & Time */}
                            <div className="text-right">
                                <div className="text-sm font-bold text-ethaum-green flex items-center justify-end gap-1 mb-0.5">
                                    <Activity size={12} /> {deal.value}
                                </div>
                                <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-gray-500">
                                    <span className="group-hover:text-white transition-colors">{deal.status}</span>
                                    <span className="flex items-center gap-1 opacity-50"><Clock size={8} /> {deal.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </StackedSection>
  );
}