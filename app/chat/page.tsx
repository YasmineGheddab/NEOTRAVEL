"use client";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour 👋 Je suis l'assistant de Neotravel. Pouvez-vous m'expliquer votre besoin ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Réponse fictive pour l'instant — on branchera n8n après
    setTimeout(() => {
      const botMsg: Message = { role: "assistant", content: "Je traite votre demande, un instant..." };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#f5f5f5" }}>

      {/* Sidebar */}
      <div style={{ width: "300px", background: "white", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", padding: "20px" }}>
        <h2 style={{ color: "#C8E000", fontWeight: "900", fontSize: "1.5rem", marginBottom: "16px" }}>Neotravel</h2>
        <button style={{ background: "black", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" }}>
          + Nouvelle conversation
        </button>
        <input placeholder="Rechercher..." style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "10px", marginBottom: "24px" }} />
        <p style={{ fontWeight: "700", fontSize: "0.85rem", marginBottom: "8px" }}>Mes conversations</p>
        <div style={{ background: "#f0f0f0", borderRadius: "8px", padding: "10px", fontSize: "0.8rem", color: "#333" }}>
          Bonjour 👋 Je suis l'assistant Neotravel...
        </div>
        <p style={{ fontSize: "0.7rem", color: "#999", marginTop: "auto" }}>Les conversations sont sauvegardées 30 jours.</p>
      </div>

      {/* Zone chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e0e0e0", background: "white", fontSize: "0.9rem", color: "#333" }}>
          Bonjour 👋 Je suis l'assistant de Neotravel. Je vais vous aider à préparer votre demande de transport.
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: "10px" }}>
              {msg.role === "assistant" && (
                <div style={{ background: "#C8E000", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "0.85rem", flexShrink: 0 }}>N</div>
              )}
              <div style={{
                background: msg.role === "user" ? "#C8E000" : "white",
                border: msg.role === "assistant" ? "1px solid #e0e0e0" : "none",
                borderRadius: "12px",
                padding: "12px 16px",
                maxWidth: "60%",
                fontSize: "0.9rem",
                lineHeight: "1.5"
              }}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div style={{ background: "#333", color: "white", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem", flexShrink: 0 }}>U</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#C8E000", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "0.85rem" }}>N</div>
              <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "12px 16px", fontSize: "0.9rem" }}>...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "16px 24px", background: "white", borderTop: "1px solid #e0e0e0", display: "flex", gap: "12px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Poser une question..."
            style={{ flex: 1, border: "1px solid #e0e0e0", borderRadius: "8px", padding: "12px 16px", fontSize: "0.9rem", outline: "none" }}
          />
          <button
            onClick={sendMessage}
            style={{ background: "#C8E000", border: "none", borderRadius: "8px", padding: "12px 16px", cursor: "pointer", fontWeight: "700" }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}