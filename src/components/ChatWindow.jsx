import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { X, Send, User, Loader2, ShieldCheck, Terminal } from "lucide-react";

export default function ChatWindow({ request, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Determine role for display
  const isFounder = currentUser.id !== request.buyer_id;
  const otherPartyName = isFounder 
    ? (request.buyer?.full_name || "Enterprise Buyer") 
    : (request.startups?.name || "Founder");

  // --- 1. FETCH & SUBSCRIBE ---
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat:${request.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pilot_messages', filter: `request_id=eq.${request.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [request.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('pilot_messages')
        .select('*')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error("Chat Error:", err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- 2. SEND MESSAGE ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage(""); // Optimistic Clear

    try {
      const { error } = await supabase.from('pilot_messages').insert({
        request_id: request.id,
        sender_id: currentUser.id,
        content: content,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send message.");
    }
  };

  return (
    // Z-INDEX 9999 ensures it sits on top of everything
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      
      {/* WINDOW CONTAINER */}
      <div className="w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col h-[650px] overflow-hidden relative">
        
        {/* HEADER */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0A0A0A] relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-ethaum-green shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                {isFounder ? <User size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {otherPartyName}
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ethaum-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-ethaum-green"></span>
                    </span>
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
                    SECURE_UPLINK :: {request.id.slice(0, 8)}
                </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="group p-2 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
          >
            <X size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050505] relative">
          {/* Background Texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="animate-spin text-ethaum-green" />
                <span className="text-[10px] font-mono text-ethaum-green animate-pulse">DECRYPTING FEED...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                <div className="p-4 border border-dashed border-white/20 rounded-full">
                    <Terminal size={32} className="text-gray-500" />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-gray-500">Channel Initialized</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                    isMe 
                    ? 'bg-ethaum-green text-black font-bold rounded-tr-sm' 
                    : 'bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* INPUT AREA */}
        <form onSubmit={handleSend} className="p-4 bg-[#0A0A0A] border-t border-white/10 relative z-10">
          <div className="flex gap-3">
            <input
              autoFocus
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter secure message..."
              className="flex-1 bg-[#111] border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder-gray-600 focus:border-ethaum-green/50 focus:bg-white/5 outline-none transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-ethaum-green text-black rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(204,255,0,0.2)] active:scale-95"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}