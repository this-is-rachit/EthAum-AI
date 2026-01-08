import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom"; 
import StackedSection from "./StackedSection";
import { ChevronUp, Award, Loader2 } from "lucide-react";

export default function TrendingLaunches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH REAL DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setLaunches(data || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE UPVOTE ---
  const handleUpvote = async (e, startupId, currentCount) => {
    e.stopPropagation(); // CRITICAL: Prevents clicking the card (navigation) when just trying to vote

    // A. Auth Check
    if (!user) {
      const shouldLogin = window.confirm("You need to be logged in as an individual to upvote launches. Would you like to sign in now?");
      if (shouldLogin) {
        navigate("/auth?type=buyer&mode=login");
      }
      return;
    }

    // B. Optimistic UI Update
    setLaunches(prev => prev.map(item => 
      item.id === startupId 
        ? { ...item, upvotes_count: (item.upvotes_count || 0) + 1 } 
        : item
    ));

    try {
      // C. DB Update: Track vote
      const { error: voteError } = await supabase
        .from('startup_upvotes')
        .insert({ startup_id: startupId, user_id: user.id });

      if (voteError) {
        if (voteError.code === '23505') { // Unique violation (Already voted)
           alert("You have already upvoted this startup!");
           // Revert UI
           setLaunches(prev => prev.map(item => 
             item.id === startupId 
               ? { ...item, upvotes_count: currentCount } 
               : item
           ));
        } else {
          throw voteError;
        }
      } else {
        // D. Increment total counter via RPC
        await supabase.rpc('increment_upvote', { row_id: startupId });
      }
    } catch (err) {
      console.error("Upvote failed:", err);
    }
  };

  // Helper: Get first letter
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "?";

  // Helper: Fake Badges for layout
  const getBadge = (index) => {
    if (index === 0) return "Daily Top 1";
    if (index === 1) return "Enterprise Choice";
    return "High Velocity";
  };

  return (
    <StackedSection title="Trending Launches" index={1} id="launches">
        <div className="w-full h-full p-8 md:p-12 bg-transparent flex flex-col">
            <div className="flex justify-between items-end mb-8 md:mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="text-ethaum-green" size={16} />
                        <p className="text-ethaum-green text-[10px] font-bold uppercase tracking-widest">Active Buzz Cycle</p>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-light text-white mb-1">Launch Intelligence</h2>
                    <p className="text-gray-500 text-xs md:text-sm">Top-voted Series A–D products by verified enterprise buyers.</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-center">
                {loading ? (
                    <div className="flex justify-center text-ethaum-green"><Loader2 className="animate-spin" /></div>
                ) : (
                    launches.map((item, index) => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate(`/startup/${item.id}`)} // Navigate on card click
                            className="group flex items-center justify-between p-4 md:p-5 rounded-2xl border border-white/5 bg-black/40 hover:border-ethaum-green transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                {/* Initial Icon */}
                                <div className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-bold text-white bg-black">
                                    {getInitials(item.name)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-ethaum-green transition-colors">
                                        {item.name}
                                    </h3>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded text-ethaum-green border border-ethaum-green/20">
                                            {getBadge(index)}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-gray-500">{item.stage}</span>
                                        <span className="text-[10px] font-bold uppercase text-gray-500">{item.arr_range}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Upvote Button */}
                            <button 
                                onClick={(e) => handleUpvote(e, item.id, item.upvotes_count)}
                                className="flex flex-col items-center justify-center w-12 h-12 border border-white/10 rounded-xl bg-black hover:border-ethaum-green group-hover:text-ethaum-green active:scale-95 transition-transform z-10"
                            >
                                <ChevronUp size={20} />
                                <span className="text-[10px] font-bold">{item.upvotes_count || 0}</span>
                            </button>
                        </div>
                    ))
                )}
                
                {!loading && launches.length === 0 && (
                     <div className="text-center text-gray-500 text-sm py-10 border border-white/5 rounded-2xl bg-black/20">
                        No active launches found. <br/>
                        <span onClick={() => navigate('/auth?type=founder')} className="text-ethaum-green font-bold cursor-pointer hover:underline">
                            Launch your product
                        </span>
                     </div>
                )}
            </div>
        </div>
    </StackedSection>
  );
}