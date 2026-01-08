import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 md:px-12 bg-transparent backdrop-blur-sm">
      {/* Logo Area */}
      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#222] rounded-full px-2 py-1 pr-4 shadow-lg">
        <div className="w-8 h-8 bg-ethaum-green rounded-full flex items-center justify-center text-black font-bold text-lg">
          E
        </div>
        <span className="text-white font-medium tracking-tight">EthAum<span className="text-ethaum-green">.ai</span></span>
      </div>

      {/* Production-Ready Links */}
      <div className="hidden md:flex gap-8 text-xs font-semibold tracking-widest text-gray-400 uppercase">
        <a href="#" className="hover:text-ethaum-green transition-colors">Accelerator</a>
        <a href="#" className="hover:text-ethaum-green transition-colors">Intelligence</a>
        <a href="#" className="hover:text-ethaum-green transition-colors">Enterprise</a>
        <a href="#" className="hover:text-ethaum-green transition-colors">Resources</a>
      </div>

      {/* Login / CTA */}
      <div className="flex gap-4">
        <button className="hidden md:block text-sm font-medium text-white hover:text-ethaum-green transition-colors">
          Sign In
        </button>
        <button className="flex items-center gap-2 bg-white text-black border border-white px-5 py-2 rounded-full text-sm font-bold hover:bg-ethaum-green hover:border-ethaum-green transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Apply Now
          <ArrowRight size={16} />
        </button>
      </div>
    </nav>
  );
}