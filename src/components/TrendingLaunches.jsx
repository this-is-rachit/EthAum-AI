import StackedSection from "./StackedSection";
import { ChevronUp, MessageSquare } from "lucide-react";

export default function TrendingLaunches() {
  const launches = [
    { id: "I", name: "Ironyun", desc: "AI Vision for Safer Cities", tags: ["AI", "Security"], upvotes: 452, comments: 32 },
    { id: "V", name: "Velotix", desc: "Data Security & Governance", tags: ["Data", "Gov"], upvotes: 389, comments: 18 },
    { id: "C", name: "Cloudworx", desc: "No-Code Digital Twins", tags: ["IoT", "3D"], upvotes: 210, comments: 45 },
  ];

  return (
    <StackedSection title="Trending Launches" index={2} id="launches">
        <div className="w-full h-full p-8 md:p-12 bg-transparent flex flex-col">
            <div className="flex justify-between items-end mb-8 md:mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-ethaum-green shadow-[0_0_10px_#ccff00]"></span>
                            <p className="text-ethaum-green text-[10px] font-bold uppercase tracking-widest">Live Now</p>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-light text-white mb-1">Top Deep Tech Products</h2>
                    <p className="text-gray-500 text-xs md:text-sm">Launching today on the accelerator network.</p>
                </div>
                <button className="text-xs font-bold text-white hover:text-ethaum-green transition-colors border-b border-transparent hover:border-ethaum-green pb-1 hidden md:block">View all launches</button>
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-center">
                {launches.map((item) => (
                    <div key={item.name} className="group flex items-center justify-between p-4 md:p-5 rounded-2xl border border-white/5 bg-black/40 hover:border-ethaum-green transition-all duration-300 hover:bg-black/60">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-bold text-white bg-black group-hover:scale-105 transition-transform duration-300">
                                {item.id}
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-ethaum-green transition-colors">{item.name}</h3>
                                <p className="text-gray-400 text-xs mb-2">{item.desc}</p>
                                <div className="flex gap-2">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-white/10 rounded-full text-gray-500 group-hover:border-ethaum-green/30 group-hover:text-ethaum-green transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                             <div className="flex gap-2 text-gray-500">
                                 <div className="flex items-center gap-1 text-[10px]"><MessageSquare size={12}/> {item.comments}</div>
                             </div>
                             <button className="flex flex-col items-center justify-center w-12 h-12 border border-white/10 rounded-xl bg-black hover:bg-[#111] transition-colors group-hover:border-ethaum-green group-hover:text-ethaum-green group-hover:shadow-[0_0_15px_rgba(204,255,0,0.15)]">
                                <ChevronUp size={20} />
                                <span className="text-[10px] font-bold mt-[-2px]">{item.upvotes}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </StackedSection>
  );
}