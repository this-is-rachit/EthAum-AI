import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StackedSection({ children, title, index, id }) {
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;

    // 1. ENTRANCE (Pop In)
    // Only plays when the card first enters from the bottom of the screen
    gsap.fromTo(card, 
      { scale: 0.9, opacity: 0, y: 50 },
      { 
        scale: 1, opacity: 1, y: 0, ease: "power2.out", duration: 0.8,
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "center center",
          scrub: 1, 
        }
      }
    );

    // 2. EXIT (The Gradual Fade - Works BOTH ways)
    // - Scroll DOWN: Card becomes transparent & blurry
    // - Scroll UP: Card becomes opaque & sharp
    gsap.to(card, {
      opacity: 0,            // Go to invisible
      filter: "blur(20px)",  // Go to blurry
      scale: 0.95,           // Go to slightly smaller
      ease: "none",          // Linear (Smooth gradual change)
      scrollTrigger: {
        trigger: container,
        start: "top top",      // Start fading exactly when pinned
        end: "bottom top",     // Finish fading exactly when the next card covers it
        scrub: true,           // Hard-link animation to scrollbar (Instant response)
        immediateRender: false // Critical: Prevents conflicts with Entrance animation
      }
    });

    // 3. TITLE ANIMATION
    gsap.to(titleRef.current, {
        opacity: 0, y: -50,
        scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "center top",
            scrub: true
        }
    });
  }, []);

  return (
    <div 
      ref={containerRef} id={id}
      className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: index * 10 }} 
    >
        {/* Section Title */}
        <div ref={titleRef} className="absolute top-12 left-6 md:top-24 md:left-24 z-10 w-full pointer-events-none mix-blend-difference">
            <h2 className="text-[8rem] md:text-[14rem] font-bold tracking-tighter text-[#1a1a1a] leading-none absolute -top-16 -left-8 select-none -z-10">0{index}</h2>
            <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tighter relative z-10 font-sans">
                {title}<span className="text-ethaum-green text-5xl">.</span>
            </h3>
        </div>
        
        {/* THE CARD - Solid Background to prevent text overlap */}
        <div 
            ref={cardRef} 
            className="w-[95%] md:w-[90%] h-[75vh] mt-24 relative z-20 bg-[#080808] border border-white/10 rounded-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            {/* Inner Content */}
            <div className="w-full h-full relative">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-ethaum-green/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    </div>
  );
}