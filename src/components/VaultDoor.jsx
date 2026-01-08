import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";

export default function VaultDoor({ children, className = "" }) {
  const vaultRef = useRef(null);
  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);
  const lockRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 }); 

      // 1. SCANNER
      tl.to(".scanner-line", { top: "100%", duration: 1.2, ease: "power1.inOut", repeat: 1, yoyo: true });
      
      // 2. UNLOCK
      tl.to(lockRef.current, { scale: 1.1, color: "#ccff00", duration: 0.2 });
      tl.to(lockRef.current, { rotation: 360, duration: 0.6, ease: "back.in(1.5)" });
      tl.to(lockRef.current, { scale: 0, opacity: 0, duration: 0.3 });

      // 3. OPEN DOORS
      tl.to(leftDoorRef.current, { xPercent: -100, duration: 1.2, ease: "power4.inOut" }, "-=0.2");
      tl.to(rightDoorRef.current, { xPercent: 100, duration: 1.2, ease: "power4.inOut" }, "<");

      // 4. REVEAL CONTENT
      tl.fromTo(contentRef.current, 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }, 
        "-=0.8"
      );
      
      // Remove doors from flow to allow clicks
      tl.set([leftDoorRef.current, rightDoorRef.current], { display: "none" });

    }, vaultRef);

    return () => ctx.revert();
  }, []);

  return (
    // UPDATED BG to bg-[#0A0A0A] to match other cards exactly
    <div ref={vaultRef} className={`relative w-full overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/10 group ${className} flex flex-col`}>
      
      {/* Content Container - flex-1 ensures it fills height */}
      <div ref={contentRef} className="relative z-10 opacity-0 flex-1 flex flex-col">
        {children}
      </div>

      {/* --- LEFT DOOR (Matches BG) --- */}
      <div ref={leftDoorRef} className="absolute inset-y-0 left-0 w-1/2 bg-[#0A0A0A] border-r border-white/10 z-30 flex items-center justify-end pr-8">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="w-1 h-16 bg-white/5 rounded-full"></div>
      </div>

      {/* --- RIGHT DOOR (Matches BG) --- */}
      <div ref={rightDoorRef} className="absolute inset-y-0 right-0 w-1/2 bg-[#0A0A0A] border-l border-white/10 z-30 flex items-center justify-start pl-8">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="w-1 h-16 bg-white/5 rounded-full"></div>
      </div>

      {/* --- LOCK --- */}
      <div ref={lockRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-[#050505] shadow-[0_0_60px_black]">
           <div className="scanner-line absolute top-0 left-0 w-full h-[1px] bg-ethaum-green/80 shadow-[0_0_10px_#ccff00]"></div>
           <Lock size={32} className="text-gray-300" />
        </div>
        <div className="mt-4 text-[9px] font-bold text-gray-600 uppercase tracking-widest animate-pulse">Decrypting...</div>
      </div>
      
    </div>
  );
}