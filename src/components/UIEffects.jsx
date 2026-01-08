import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/* === 1. TIGHTER CURSOR === */
export function CustomCursor() {
  const mainCursor = useRef(null);
  const followerCursor = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      gsap.set(mainCursor.current, { x: e.clientX, y: e.clientY });
      gsap.to(followerCursor.current, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
    };

    const handleLinkHoverEvents = () => {
      const links = document.querySelectorAll("a, button, .clickable, input, textarea");
      links.forEach((link) => {
        link.addEventListener("mouseenter", () => setIsHovering(true));
        link.addEventListener("mouseleave", () => setIsHovering(false));
      });
    };

    window.addEventListener("mousemove", moveCursor);
    handleLinkHoverEvents();
    const observer = new MutationObserver(handleLinkHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isHovering) {
      gsap.to(mainCursor.current, { scale: 0, opacity: 0, duration: 0.1 });
      gsap.to(followerCursor.current, { scale: 3, backgroundColor: "rgba(204, 255, 0, 0.1)", borderColor: "transparent", mixBlendMode: "difference", duration: 0.2 });
    } else {
      gsap.to(mainCursor.current, { scale: 1, opacity: 1, duration: 0.1 });
      gsap.to(followerCursor.current, { scale: 1, backgroundColor: "transparent", borderColor: "rgba(204, 255, 0, 0.6)", mixBlendMode: "normal", duration: 0.2 });
    }
  }, [isHovering]);

  return (
    <>
      <div ref={mainCursor} className="fixed top-0 left-0 w-2 h-2 bg-ethaum-green rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block will-change-transform" />
      <div ref={followerCursor} className="fixed top-0 left-0 w-8 h-8 border border-ethaum-green/60 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block will-change-transform" />
    </>
  );
}

/* === 2. INFINITE MARQUEE === */
export function InfiniteMarquee() {
  const marqueeRef = useRef(null);
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    gsap.to(el, { xPercent: -50, repeat: -1, duration: 30, ease: "linear" });
  }, []);

  return (
    <div className="w-full overflow-hidden border-t border-white/10 py-4 relative z-20 backdrop-blur-md bg-black/40">
      <div ref={marqueeRef} className="flex gap-20 whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-gray-400 w-max">
        <span>Autonomous Intelligence</span> • <span>Market Validation</span> • <span>Enterprise Pilots</span> • <span>Zero Upfront Cost</span> •
        <span>Autonomous Intelligence</span> • <span>Market Validation</span> • <span>Enterprise Pilots</span> • <span>Zero Upfront Cost</span> •
      </div>
    </div>
  );
}

/* === 3. VISIBLE GRID & GRADIENT (THE FIX) === */
export function AmbientBackground() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#020202]">
            
            {/* 1. THE CHEQUERED GRID (Grey Lines) */}
            <div 
                className="absolute inset-0 opacity-[0.2]" 
                style={{
                    backgroundImage: `
                        linear-gradient(#333 1px, transparent 1px), 
                        linear-gradient(90deg, #333 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                }}
            ></div>

            {/* 2. THE GREEN GRADIENT (Pulse) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-ethaum-green/20 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '6s' }} />
            
            {/* 3. Secondary Gradient Corner */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-ethaum-green/10 rounded-full blur-[120px]" />

            {/* 4. Noise Texture for Realism */}
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        </div>
    )
}