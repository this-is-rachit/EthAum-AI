import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import StackedSection from "./StackedSection";
import { Target, Activity, ShieldCheck, Crosshair } from "lucide-react";
import gsap from "gsap";

export default function MarketIntelligence() {
  const [startups, setStartups] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    const { data } = await supabase.from('startups').select('id, name, stage, arr_range, tagline').limit(12); 
    const plottedData = (data || []).map(s => ({
      ...s,
      x: 50 + (Math.random() * 70 - 35), 
      y: 50 + (Math.random() * 70 - 35),
      velocity: Math.floor(Math.random() * 100) + 20 
    }));
    setStartups(plottedData);
  };

  useEffect(() => {
    if (startups.length > 0) {
      const ctx = gsap.context(() => {
        gsap.to(".radar-sweep", { rotation: 360, duration: 8, repeat: -1, ease: "linear", transformOrigin: "bottom left" });
        gsap.to(".data-node-core", { scale: 1.5, opacity: 0.5, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: { amount: 2, from: "random" } });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [startups]);

  // FIX: ID CHANGED TO 'quadrants'
  return (
    <StackedSection title="Market Intelligence" index={2} id="quadrants">
      <div ref={containerRef} className="w-full h-full p-6 md:p-12 flex flex-col justify-center relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 h-full">
            <div className="lg:w-1/3 flex flex-col justify-center relative z-20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-1.5 bg-ethaum-green rounded-full shadow-[0_0_8px_#ccff00]"></div>
                    <span className="text-ethaum-green text-[10px] font-bold uppercase tracking-[0.3em]">Live Quadrant</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-light text-white mb-6 leading-[0.9] tracking-tighter">Validate <br/><span className="font-bold text-white">Execution.</span></h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 border-l-2 border-white/10 pl-6">Our AI continuously maps deep-tech startups based on verified ARR traction, IP depth, and pilot velocity.</p>
                <div className="flex gap-8">
                    <div><div className="text-3xl font-black text-white mb-1">240+</div><div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest font-bold"><Target size={12} /> Data Points</div></div>
                    <div><div className="text-3xl font-black text-white mb-1">12h</div><div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest font-bold"><Activity size={12} /> Refresh Rate</div></div>
                </div>
            </div>
            <div className="lg:w-2/3 w-full flex items-center justify-center relative">
                <div className="relative w-[min(100%,500px)] aspect-square rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center group overflow-hidden">
                    <div className="absolute inset-0 m-[15%] rounded-full border border-white/5"></div>
                    <div className="absolute inset-0 m-[30%] rounded-full border border-white/5"></div>
                    <div className="absolute inset-0 m-[45%] rounded-full border border-white/5 bg-white/[0.01]"></div>
                    <div className="absolute w-full h-[1px] bg-white/5 group-hover:bg-ethaum-green/10 transition-colors"></div>
                    <div className="absolute h-full w-[1px] bg-white/5 group-hover:bg-ethaum-green/10 transition-colors"></div>
                    <span className="absolute top-6 text-[9px] font-bold text-gray-600 uppercase tracking-widest">High Execution</span>
                    <span className="absolute bottom-6 text-[9px] font-bold text-gray-600 uppercase tracking-widest">Emerging</span>
                    <span className="absolute left-6 -rotate-90 text-[9px] font-bold text-gray-600 uppercase tracking-widest">Niche</span>
                    <span className="absolute right-6 rotate-90 text-[9px] font-bold text-gray-600 uppercase tracking-widest">Visionary</span>
                    <div className="radar-sweep absolute top-1/2 left-1/2 w-[50%] h-[50%] bg-gradient-to-t from-ethaum-green/20 to-transparent border-l border-ethaum-green/40 rounded-tr-full origin-bottom-left z-10 pointer-events-none"></div>
                    {startups.map((node) => (
                        <div key={node.id} className="absolute z-30 cursor-pointer group/node" style={{ left: `${node.x}%`, top: `${node.y}%` }} onMouseEnter={() => setHoveredNode(node)} onMouseLeave={() => setHoveredNode(null)}>
                            <div className="relative -translate-x-1/2 -translate-y-1/2">
                                <div className="data-node-core w-1.5 h-1.5 bg-white rounded-full group-hover/node:bg-ethaum-green transition-colors"></div>
                                <div className="absolute inset-0 -m-1.5 border border-white/20 rounded-full scale-0 group-hover/node:scale-100 transition-transform duration-300"></div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute top-10 left-10 w-3 h-3 border-t border-l border-white/20"></div>
                    <div className="absolute top-10 right-10 w-3 h-3 border-t border-r border-white/20"></div>
                    <div className="absolute bottom-10 left-10 w-3 h-3 border-b border-l border-white/20"></div>
                    <div className="absolute bottom-10 right-10 w-3 h-3 border-b border-r border-white/20"></div>
                </div>
                {hoveredNode && (
                    <div className="absolute z-50 pointer-events-none bg-black/90 backdrop-blur-xl border border-ethaum-green/30 rounded-lg p-4 w-56 flex flex-col gap-1 shadow-[0_10px_40px_rgba(0,0,0,0.8)]" style={{ left: '50%', top: '50%', transform: `translate(${hoveredNode.x > 50 ? '-110%' : '10%'}, ${hoveredNode.y > 50 ? '-110%' : '10%'})` }}>
                        <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{hoveredNode.name}</span>
                            <ShieldCheck size={12} className="text-ethaum-green" />
                        </div>
                        <div className="text-[10px] text-gray-300 leading-tight">{hoveredNode.tagline || "High potential deep-tech venture."}</div>
                        <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-gray-500"><span className="bg-white/5 px-1 rounded">{hoveredNode.stage}</span><span className="text-ethaum-green">Velocity: {hoveredNode.velocity}</span></div>
                    </div>
                )}
            </div>
        </div>
        <div className="absolute bottom-6 left-0 w-full flex items-center gap-0 px-6 md:px-12 pointer-events-none">
            <div className="flex items-center gap-2 pr-6 bg-transparent z-10"><Crosshair size={12} className="text-gray-500" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Market Feed</span></div>
            <div className="flex-1 overflow-hidden relative mask-image-gradient">
                <div className="flex gap-12 animate-marquee whitespace-nowrap">
                    {startups.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-gray-600 font-mono"><span className="text-gray-400 font-bold">{s.name}</span> <span>::</span> <span className="text-ethaum-green">VELOCITY_UP</span></div>
                    ))}
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050505] to-transparent"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050505] to-transparent"></div>
            </div>
        </div>
      </div>
    </StackedSection>
  );
}