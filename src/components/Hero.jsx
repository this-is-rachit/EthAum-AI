import ThreeCurrencyStack from "./ThreeCurrencyStack";
import { InfiniteMarquee } from "./UIEffects";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="h-screen w-full flex items-center relative px-6 md:px-20 pt-20 pb-32 z-0 bg-transparent">
        <div className="z-10 w-full md:w-[55%]">
            <div className="flex items-center gap-3 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-ethaum-green shadow-[0_0_10px_#ccff00]"></span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">The Series A–D Intelligence Layer</span>
            </div>
            
            <h1 className="text-6xl md:text-[6rem] leading-[0.9] tracking-tighter mb-8 text-white mix-blend-overlay">
                Market <br /> <span className="text-gray-400 font-light">Dominance.</span>
            </h1>
            
            <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-10 font-light">
              The first AI-native ecosystem where $1M+ ARR startups secure enterprise pilots, verified ROI scores, and Gartner-style validation.
            </p>
            
            <div className="flex gap-6">
                <button onClick={() => navigate("/auth?type=founder")} className="flex items-center gap-3 bg-ethaum-green text-black px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                  Launch Product <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate("/auth?type=buyer")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Find Pilots
                </button>
            </div>
        </div>

        <div className="absolute right-[2%] top-1/2 -translate-y-1/2 w-[50%] h-[90%] hidden md:flex items-center justify-center z-0">
            <ThreeCurrencyStack />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full"><InfiniteMarquee /></div>
    </section>
  );
}