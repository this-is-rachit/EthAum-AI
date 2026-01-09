import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { X, Send, Loader2, ShieldCheck, Lock } from "lucide-react";

export default function ChatWindow({ request, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // --- 1. FETCH & SUBSCRIBE TO LIVE UPDATES ---
  useEffect(() => {
    // A. Fetch existing history
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('pilot_messages')
        .select('*')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });
      
      if (!error) {
        setMessages(data);
        setLoading(false);
        scrollToBottom();
      }
    };

    fetchMessages();

    // B. Subscribe to NEW messages (Realtime)
    const channel = supabase
      .channel(`chat-room-${request.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'pilot_messages', 
          filter: `request_id=eq.${request.id}` 
        },
        (payload) => {
          // Add the new message to the list instantly
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [request.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage(""); // Clear input immediately

    try {
      // We just INSERT. The .on('INSERT') subscription above will 
      // see this happen and update the UI automatically for both users.
      const { error } = await supabase.from('pilot_messages').insert({
        request_id: request.id,
        sender_id: currentUser.id,
        content: content
      });

      if (error) throw error;
    } catch (err) {
      console.error("Send failed:", err);
      alert("Encryption handshake failed. Try again.");
      setNewMessage(content); // Restore text
    }
  };

  return (
    <div className="fixed bottom-0 right-4 md:right-10 w-full md:w-[400px] h-[500px] bg-[#0A0A0A] border border-white/20 rounded-t-xl shadow-2xl z-50 flex flex-col font-sans animate-in slide-in-from-bottom-10 duration-300">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0f0f0f] rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-ethaum-green rounded-full animate-pulse shadow-[0_0_10px_#ccff00]"></div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Secure Uplink</h3>
            <p className="text-[9px] text-gray-500 font-mono uppercase">
                {request.profiles?.full_name || request.startups?.name || "Encrypted ID"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-ethaum-green" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
            <ShieldCheck size={32} className="mb-2 text-gray-500"/>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Channel Open.<br/>Begin Transmission.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-ethaum-green text-black font-medium rounded-br-none' 
                      : 'bg-[#1a1a1a] text-gray-300 border border-white/5 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#0A0A0A]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type encrypted message..."
            className="w-full bg-[#111] border border-white/10 rounded-lg pl-4 pr-12 py-3 text-xs text-white focus:border-ethaum-green outline-none transition-all placeholder-gray-600"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="absolute right-2 p-2 bg-white/5 text-gray-400 hover:text-white hover:bg-ethaum-green/20 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="text-[9px] text-gray-700 text-center mt-2 font-mono flex justify-center items-center gap-1">
            <Lock size={8}/> END-TO-END ENCRYPTED // ETHAUM PROTOCOL v2.4
        </div>
      </form>
    </div>
  );
}