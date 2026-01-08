import { useEffect, useRef } from "react";
import StackedSection from "./StackedSection";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, BrainCircuit, Globe, Download } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function MarketIntelligence() {
  const containerRef = useRef(null);
  const scoreRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const el = containerRef.current;
    
    const ctx = gsap.context(() => {
      
      gsap.from(scoreRef.current, {
        textContent: 0,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        stagger: 1,
        scrollTrigger: {
            trigger: el,
            start: "top center",
            toggleActions: "play none none reverse"
        }
      });

      barsRef.current.forEach((bar) => {
        const width = bar.dataset.width;
        gsap.fromTo(bar, 
            { width: "0%" },
            { 
                width: width, 
                duration: 1.5, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top center",
                    toggleActions: "play none none reverse"
                }
            }
        );
      });

    }, el);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !barsRef.current.includes(el)) {
      barsRef.current.push(el);
    }
  };

  return (
    <StackedSection title="Market Intelligence" index={3} id="intelligence">
        <div ref={containerRef} className="w-full h-full p-8 md:p-16 bg-transparent flex flex-col md:flex-row gap-12">
            
            <div className="w-full md:w-1/3 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                     <BrainCircuit className="text-ethaum-green" size={20} />
                     <p className="text-ethaum-green text-xs font-bold uppercase tracking-widest">AI Validation Engine</p>
                </div>
                <h2 className="text-4xl md:text-5xl font-light text-white mb-6 leading-tight">
                    Beyond Human<br />
                    <span className="font-bold text-white">Analysis.</span>
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Replace subjective analyst reports with real-time, code-level diligence. Our AI agents analyze GitHub repos, financial traction, and market sentiment to generate an unbiased Credibility Score.
                </p>
                
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="p-2 bg-ethaum-green/10 rounded-lg text-ethaum-green"><ShieldCheck size={20} /></div>
                        <div>
                            <h4 className="text-white text-sm font-bold">Enterprise Grade</h4>
                            <p className="text-gray-500 text-xs">Pre-vetted for SOC2 & GDPR compliance.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-lg bg-black/60 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(#333 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-xl">V</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Velotix AI</h3>
                                <p className="text-gray-500 text-xs">Series A • Data Governance</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-full border border-ethaum-green/30 text-ethaum-green text-[10px] font-bold uppercase tracking-wider bg-ethaum-green/5">
                            Top 1% Global
                        </div>
                    </div>
                    <div className="flex items-center gap-8 mb-10 relative z-10">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                             <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="60" stroke="#222" strokeWidth="8" fill="none" />
                                <circle cx="64" cy="64" r="60" stroke="#CCFF00" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset="20" strokeLinecap="round" />
                             </svg>
                             <div className="text-center">
                                 <span ref={scoreRef} className="text-5xl font-mono font-bold text-white block">94</span>
                                 <span className="text-[10px] text-gray-500 uppercase tracking-wider">EthAum Score</span>
                             </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300">Technical Moat</span>
                                    <span className="text-ethaum-green">98/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                                    <div ref={addToRefs} data-width="98%" className="h-full bg-ethaum-green rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300">Market Velocity</span>
                                    <span className="text-ethaum-green">92/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                                    <div ref={addToRefs} data-width="92%" className="h-full bg-ethaum-green rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <button className="flex-1 py-3 bg-white text-black font-bold text-xs rounded-lg hover:bg-ethaum-green transition-colors flex items-center justify-center gap-2">
                            Request Pilot Access <ArrowUpRight size={14} />
                        </button>
                        <button className="px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-white">
                            <Download size={16} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </StackedSection>
  );
}

function ArrowUpRight({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M7 7h10v10"/>
            <path d="M7 17 17 7"/>
        </svg>
    )
}