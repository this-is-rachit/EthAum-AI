import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function Loader({ onComplete }) {
  const containerRef = useRef(null);
  const scanLineRef = useRef(null);
  const whiteTextRef = useRef(null);
  const greenTextRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: "power4.inOut",
            onComplete: onComplete
          });
        }
      });

      // 1. INITIAL STATE
      gsap.set([whiteTextRef.current, greenTextRef.current], { 
        clipPath: "inset(0 100% 0 0)" // Hidden (clipped from right)
      });
      gsap.set(scanLineRef.current, { scaleY: 0, opacity: 0 });

      // 2. THE ELEGANT SCAN
      tl.to(scanLineRef.current, { 
        scaleY: 1, 
        opacity: 1,
        duration: 0.5, 
        ease: "power2.out" 
      })
      
      // Reveal Text (Slow & Smooth)
      .to([whiteTextRef.current, greenTextRef.current], {
        clipPath: "inset(0 0% 0 0)",
        duration: 2,
        ease: "power2.inOut",
      }, "<")
      
      // Move Laser
      .fromTo(scanLineRef.current, 
        { left: "0%" }, 
        { left: "100%", duration: 2, ease: "power2.inOut" }, 
        "<"
      )

      // 3. RETRACT LASER
      .to(scanLineRef.current, { 
        scaleY: 0, 
        opacity: 0,
        duration: 0.3,
        ease: "power2.in" 
      })

      // 4. SUBTLE UPLINK PULSE (The .ai glows)
      .to(greenTextRef.current, {
        textShadow: "0 0 20px rgba(204, 255, 0, 0.6)",
        duration: 0.8,
        yoyo: true,
        repeat: 1
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[10000] bg-[#000000] flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* === BACKGROUND GRADIENTS === */}
      {/* 1. Top Right: Subtle Ethaum Green Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-ethaum-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* 2. Bottom Left: Deep Graphite Glow (for depth) */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* 3. Micro Grid (Barely visible texture) */}
      <div className="absolute inset-0 opacity-[0.07]" 
           style={{ 
             backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, 
             backgroundSize: '60px 60px' 
           }}>
      </div>


      {/* === THE LOGO === */}
      <div className="relative w-auto h-auto flex flex-col items-center z-10">
        
        {/* TYPOGRAPHY: Classic, Thin, Big */}
        <div className="relative text-6xl md:text-9xl font-light tracking-[0.15em] leading-none select-none">
            
            {/* LAYER 1: BASE (Ghost/Inactive) - Very dark grey */}
            <div className="text-[#1a1a1a] opacity-100">
                ETHAUM<span className="text-[#1a1a1a] tracking-normal font-normal text-4xl md:text-6xl ml-2">.AI</span>
            </div>

            {/* LAYER 2: ACTIVE REVEAL (White + Green) */}
            
            {/* 2a. The "ETHAUM" part (Pure White) */}
            <div ref={whiteTextRef} className="absolute top-0 left-0 text-white">
                ETHAUM<span className="opacity-0 tracking-normal font-normal text-4xl md:text-6xl ml-2">.AI</span>
            </div>

            {/* 2b. The ".AI" part (Ethaum Green) */}
            <div ref={greenTextRef} className="absolute top-0 left-0 text-transparent">
                <span className="opacity-0">ETHAUM</span><span className="text-ethaum-green tracking-normal font-normal text-4xl md:text-6xl ml-2">.AI</span>
            </div>

            {/* THE LASER LINE (Thinner now: w-[1px]) */}
            <div ref={scanLineRef} className="absolute top-0 bottom-0 w-[1px] bg-ethaum-green shadow-[0_0_25px_#ccff00] z-20 block origin-bottom"></div>
        </div>

        {/* LOADING SUBTEXT */}
        <div className="mt-12 flex items-center gap-4 opacity-50">
             <div className="font-mono text-[10px] text-ethaum-green tracking-[0.4em] uppercase">
                Initializing Neural Uplink
             </div>
        </div>

      </div>
    </div>
  );
}