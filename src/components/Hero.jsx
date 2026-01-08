import ThreeCurrencyStack from "./ThreeCurrencyStack";
import { InfiniteMarquee } from "./UIEffects";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    // Changed pt-10 to pt-32 to prevent Navbar overlap
    <section className="h-screen w-full flex items-center relative px-6 md:px-20 pt-32 z-0 bg-transparent">
        <div className="z-10 w-full md:w-1/2">
        <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-ethaum-green shadow-[0_0_10px_#ccff00]"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Deep Tech Accelerator</span>
        </div>
        <h1 className="text-6xl md:text-[6rem] leading-[0.9] tracking-tighter mb-8 text-white mix-blend-overlay">
            The AI-Native <br /> <span className="text-gray-400 font-light">Growth Engine.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-10 font-light">Validate, launch, and scale your Series A startup with autonomous AI agents.</p>
        <div className="flex gap-6">
            <button className="flex items-center gap-3 bg-ethaum-green text-black px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(204,255,0,0.3)]">Start Accelerator <ArrowRight size={16} /></button>
            <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">View Manifesto</button>
        </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[60%] h-[90%] hidden md:flex items-center justify-center z-0">
            <ThreeCurrencyStack />
        </div>
        <div className="absolute bottom-0 left-0 w-full"><InfiniteMarquee /></div>
    </section>
  );
}