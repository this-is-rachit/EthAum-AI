import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] w-full h-full overflow-hidden pointer-events-none bg-[#050505]">
      
      {/* 1. VISIBLE GREY CHEQUERED GRID */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.15]"
      ></div>

      {/* 2. CENTERED GREEN BEACON (PERMANENT) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-ethaum-green/60 rounded-full blur-[180px] animate-pulse-slow"></div>
      
      {/* 3. WHITE CORE (Brightness) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25vw] h-[25vw] bg-white/20 rounded-full blur-[100px]"></div>

      {/* 4. NOISE TEXTURE */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
    </div>
  );
}

export function InfiniteMarquee() {
  return (
    <div className="w-full bg-black/40 backdrop-blur-md text-white py-4 overflow-hidden flex whitespace-nowrap border-y border-white/10 relative z-10">
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>

      <div className="animate-marquee flex gap-16 font-mono font-medium uppercase tracking-[0.2em] text-xs items-center opacity-80 transform-gpu will-change-transform">
        {Array(20).fill("Launch · Validate · Pilot · Scale").map((item, i) => (
          <span key={i} className="flex items-center gap-16">
            {item} 
            <span className="w-1.5 h-1.5 border border-ethaum-green rounded-full"></span>
          </span>
        ))}
      </div>
    </div>
  );
}