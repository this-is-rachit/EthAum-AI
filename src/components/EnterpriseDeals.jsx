import { useEffect, useRef } from "react";
import StackedSection from "./StackedSection";
import { Zap, Handshake, Lock, CheckCircle2 } from "lucide-react";

export default function EnterpriseDeals() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = cardsRef.current;
      cards.forEach((card) => {
        if(!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
  };

  const deals = [
    { name: "Ironyun", offer: "City-Scale Vision Pilot", credit: "$50k POC Credit", match: "98%", logo: "I" },
    { name: "Velotix", offer: "Data Governance Sandbox", credit: "Free 3-Mo Pilot", match: "95%", logo: "V" },
    { name: "Cloudworx", offer: "Digital Twin Prototype", credit: "70% Off License", match: "92%", logo: "C" },
    { name: "Qubits", offer: "Quantum Encryption Beta", credit: "Early Access", match: "89%", logo: "Q" },
  ];

  return (
    <StackedSection title="Enterprise Deals" index={4} id="deals">
        <div ref={containerRef} className="w-full h-full p-8 md:p-16 bg-transparent flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                     <div className="flex items-center gap-3 mb-2">
                        <Zap size={14} className="text-ethaum-green fill-ethaum-green" />
                        <p className="text-ethaum-green text-xs font-bold uppercase tracking-widest">Active Deal Flow</p>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-light text-white mb-2">
                        Commercial <span className="font-bold text-white">Pilots.</span>
                    </h2>
                    <p className="text-gray-500 max-w-lg">
                        Pre-negotiated POCs and pilots for enterprise buyers. Unlock exclusive access to Series A technology stacks.
                    </p>
                </div>
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div>
                        <div className="text-2xl font-mono text-white font-bold">$4.2M</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pipeline Value</div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10"></div>
                    <div>
                        <div className="text-2xl font-mono text-ethaum-green font-bold">12</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Deals closing 24h</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {deals.map((deal) => (
                    <div 
                        key={deal.name}
                        ref={addToRefs}
                        className="group relative rounded-2xl bg-black/40 border border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                    >
                        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(204, 255, 0, 0.15), transparent 40%)` }} />
                        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(204, 255, 0, 0.4), transparent 40%)`, maskImage: 'linear-gradient(black, black)', WebkitMaskImage: 'linear-gradient(black, black)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1px' }} />

                        <div className="relative h-full p-6 md:p-8 flex flex-col justify-between z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white group-hover:bg-ethaum-green group-hover:text-black transition-colors duration-300">{deal.logo}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-ethaum-green transition-colors">{deal.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">Series A</span>
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">SaaS</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">AI Match</div>
                                    <div className="text-xl font-mono font-bold text-ethaum-green">{deal.match}</div>
                                </div>
                            </div>
                            <div className="mb-8 p-4 rounded-xl bg-black/40 border border-white/5 group-hover:border-ethaum-green/20 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pilot Offer</span>
                                    <Handshake size={14} className="text-gray-500" />
                                </div>
                                <div className="text-lg text-white font-medium">{deal.offer}</div>
                                <div className="text-sm text-ethaum-green font-bold mt-1">{deal.credit}</div>
                            </div>
                            <div className="flex justify-between items-center mt-auto">
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-ethaum-green"/> SOC2 Ready</span>
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-ethaum-green"/> Escrow</span>
                                </div>
                                <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 text-white text-xs font-bold hover:bg-white hover:text-black transition-all group-hover:border-white">Unlock Deal <Lock size={12} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </StackedSection>
  );
}