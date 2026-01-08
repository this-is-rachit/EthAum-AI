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
  const [votedIds, setVotedIds] = useState(new Set());

  // --- 1. FETCH REAL DATA ---
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // FIX: Fetch actual count of votes from the join table to avoid double-counting bugs
      const { data: startupData, error } = await supabase
        .from('startups')
        .select(`
            *,
            startup_upvotes (count)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Map the accurate count (Supabase returns { count: N } inside the array)
      const cleanedData = (startupData || []).map(s => ({
          ...s,
          // If startup_upvotes exists and has count, use it. Fallback to existing column if needed.
          upvotes_count: s.startup_upvotes ? s.startup_upvotes[0]?.count : s.upvotes_count
      }));

      setLaunches(cleanedData);

      // B. Fetch User Votes
      if (user) {
        const { data: votes, error: voteError } = await supabase
          .from('startup_upvotes')
          .select('startup_id')
          .eq('user_id', user.id);
        
        if (!voteError && votes) {
          const ids = new Set(votes.map(v => v.startup_id));
          setVotedIds(ids);
        }
      } else {
        setVotedIds(new Set());
      }

    } catch (error) {
      console.error("Error fetching trending:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE UPVOTE ---
  const handleUpvote = async (e, startupId, currentCount) => {
    e.stopPropagation();

    if (!user) {
      if (window.confirm("Sign in to upvote?")) navigate("/auth?type=buyer&mode=login");
      return;
    }

    if (user.user_metadata?.role === 'founder') {
        alert("Founders cannot upvote launches.");
        return;
    }

    if (votedIds.has(startupId)) return;

    // Optimistic Update
    setLaunches(prev => prev.map(item => 
      item.id === startupId ? { ...item, upvotes_count: (item.upvotes_count || 0) + 1 } : item
    ));
    setVotedIds(prev => new Set(prev).add(startupId));

    try {
      // FIX: Only Insert. We rely on the DB (Trigger or Count Aggregation) for the number.
      // Removed the RPC call to prevent double counting.
      const { error: voteError } = await supabase
        .from('startup_upvotes')
        .insert({ startup_id: startupId, user_id: user.id });

      if (voteError && voteError.code !== '23505') throw voteError;

    } catch (err) {
      console.error("Upvote failed:", err);
      // Revert
      setLaunches(prev => prev.map(item => 
        item.id === startupId ? { ...item, upvotes_count: currentCount } : item
      ));
      setVotedIds(prev => { const s = new Set(prev); s.delete(startupId); return s; });
      alert("Vote failed. Please try again.");
    }
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "?";
  const getBadge = (index) => ["Daily Top 1", "Enterprise Choice", "High Velocity"][index] || "Rising";

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
                    launches.map((item, index) => {
                        const isVoted = votedIds.has(item.id);
                        return (
                        <div key={item.id} onClick={() => navigate(`/startup/${item.id}`)} className="group flex items-center justify-between p-4 md:p-5 rounded-2xl border border-white/5 bg-black/40 hover:border-ethaum-green transition-all duration-300 cursor-pointer">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-bold text-white bg-black">
                                    {getInitials(item.name)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-ethaum-green transition-colors">{item.name}</h3>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded text-ethaum-green border border-ethaum-green/20">{getBadge(index)}</span>
                                        <span className="text-[10px] font-bold uppercase text-gray-500">{item.stage}</span>
                                        <span className="text-[10px] font-bold uppercase text-gray-500">{item.arr_range}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={(e) => handleUpvote(e, item.id, item.upvotes_count)} disabled={isVoted} className={`flex flex-col items-center justify-center w-12 h-12 border rounded-xl transition-all z-10 ${isVoted ? "bg-ethaum-green border-ethaum-green text-black cursor-default" : "bg-black border-white/10 hover:border-ethaum-green group-hover:text-ethaum-green active:scale-95"}`}>
                                <ChevronUp size={20} />
                                <span className="text-[10px] font-bold">{item.upvotes_count || 0}</span>
                            </button>
                        </div>
                    )})
                )}
            </div>
        </div>
    </StackedSection>
  );
}