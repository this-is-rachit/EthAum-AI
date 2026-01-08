import { ArrowRight, Github, Twitter, Linkedin, Disc } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // Relative positioning ensures it naturally follows the last card
    <footer className="relative w-full bg-[#020202] border-t border-white/10 pt-24 pb-12 px-6 md:px-20 overflow-hidden z-50">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
        </div>

        {/* 1. TOP CTA */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 relative z-10">
            <div>
                <h2 className="text-5xl md:text-[7rem] font-bold tracking-tighter text-white leading-[0.9] mb-8">
                    Ready to <br />
                    <span className="text-ethaum-green">Scale?</span>
                </h2>
                <button 
                    aria-label="Apply for Cohort 2026"
                    className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-ethaum-green transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    Apply for Cohort 2026
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            
            <div className="w-full md:w-96 mt-12 md:mt-0">
                <p className="text-gray-400 text-sm mb-4 font-medium">Get the weekly deep tech memo.</p>
                <div className="flex gap-2">
                    <input 
                        type="email" 
                        placeholder="founder@startup.com" 
                        aria-label="Email Address for Newsletter"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-ethaum-green transition-colors" 
                    />
                    <button 
                        aria-label="Subscribe"
                        className="bg-white/10 border border-white/10 rounded-lg px-4 hover:bg-white hover:text-black transition-colors"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>

        <div className="h-px w-full bg-white/10 mb-16"></div>

        {/* 2. LINKS - Changed h4 to h3 for semantic hierarchy */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-20 mb-20 relative z-10">
            <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold mb-2 text-sm">Platform</h3>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">Launchpad</a>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">Intelligence</a>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">Deal Flow</a>
            </div>
            <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold mb-2 text-sm">Resources</h3>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">Manifesto</a>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">Deck Template</a>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">API Docs</a>
            </div>
            <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold mb-2 text-sm">Company</h3>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">About</a>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">Careers</a>
                <a href="#" className="text-gray-500 hover:text-ethaum-green text-sm">Contact</a>
            </div>
             <div className="flex flex-col gap-4">
                <h3 className="text-white font-bold mb-2 text-sm">Connect</h3>
                <div className="flex gap-4">
                    <SocialIcon icon={<Twitter size={18} />} label="Twitter" />
                    <SocialIcon icon={<Linkedin size={18} />} label="LinkedIn" />
                    <SocialIcon icon={<Github size={18} />} label="GitHub" />
                    <SocialIcon icon={<Disc size={18} />} label="Discord" />
                </div>
            </div>
        </div>

        {/* 3. BOTTOM */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-gray-600 relative z-10">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="w-2 h-2 rounded-full bg-ethaum-green animate-pulse shadow-[0_0_8px_#ccff00]"></div>
                <span className="font-mono uppercase tracking-widest text-ethaum-green">System Operational</span>
            </div>
            <div className="flex gap-8">
                <span>© 2026 EthAum Inc.</span>
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
            </div>
            <button 
                onClick={scrollToTop}
                aria-label="Back to top"
                className="mt-4 md:mt-0 font-mono text-gray-500 cursor-pointer hover:text-white bg-transparent border-none"
            >
                [ Back to Top ]
            </button>
        </div>
    </footer>
  );
}

function SocialIcon({ icon, label }) {
    return (
        <a 
            href="#" 
            aria-label={label}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
        >
            {icon}
        </a>
    );
}