"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour 👋 Je suis l'assistant de Neotravel. Pouvez-vous m'expliquer votre besoin de transport ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const historyText = newMessages
        .map(m => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.content}`)
        .join("\n");

      const fullPrompt = `[Historique de la conversation]\n${historyText}\n\n[Nouveau message]\n${input}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: fullPrompt })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.output || "Désolé, je n'ai pas pu traiter votre demande. Pouvez-vous réessayer ?" }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Une erreur est survenue. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "'Inter', -apple-system, sans-serif",
      background: "#FAFAF8"
    }}>

      {/* En-tête */}
      <header style={{
        padding: "20px 32px",
        borderBottom: "1px solid #E5E5E0",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "#1A1A1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C8E000",
          fontWeight: 900,
          fontSize: "18px"
        }} aria-hidden="true">N</div>
        <div>
          <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", margin: 0 }}>
            Neotravel
          </h1>
          <p style={{ fontSize: "13px", color: "#6B6B68", margin: 0 }}>
            Assistant transport de groupe
          </p>
        </div>
      </header>

      {/* Zone de conversation */}
      <main
        role="log"
        aria-live="polite"
        aria-label="Conversation avec l'assistant Neotravel"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto"
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: "10px"
            }}
          >
            {msg.role === "assistant" && (
              <div
                aria-hidden="true"
                style={{
                  background: "#1A1A1A",
                  color: "#C8E000",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "14px",
                  flexShrink: 0
                }}
              >
                N
              </div>
            )}
            <div
              style={{
                background: msg.role === "user" ? "#C8E000" : "#FFFFFF",
                color: "#1A1A1A",
                border: msg.role === "assistant" ? "1px solid #E5E5E0" : "none",
                borderRadius: "16px",
                borderTopLeftRadius: msg.role === "assistant" ? "4px" : "16px",
                borderTopRightRadius: msg.role === "user" ? "4px" : "16px",
                padding: "14px 18px",
                maxWidth: "min(560px, 80%)",
                fontSize: "15px",
                lineHeight: "1.6"
              }}
            >
              {(msg.content || "").split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            {msg.role === "user" && (
              <div
                aria-hidden="true"
                style={{
                  background: "#1A1A1A",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "13px",
                  flexShrink: 0
                }}
              >
                Vous
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }} aria-label="L'assistant rédige une réponse">
            <div
              aria-hidden="true"
              style={{
                background: "#1A1A1A",
                color: "#C8E000",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "14px"
              }}
            >
              N
            </div>
            <div style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E0",
              borderRadius: "16px",
              borderTopLeftRadius: "4px",
              padding: "14px 18px",
              fontSize: "15px",
              color: "#6B6B68"
            }}>
              En train d'écrire…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Zone de saisie */}
      <footer style={{
        padding: "20px 24px 28px",
        background: "#FFFFFF",
        borderTop: "1px solid #E5E5E0"
      }}>
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            gap: "12px"
          }}
        >
          <label htmlFor="chat-input" style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)"
          }}>
            Votre message
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Décrivez votre besoin de transport…"
            disabled={loading}
            style={{
              flex: 1,
              border: "1px solid #D9D9D4",
              borderRadius: "10px",
              padding: "14px 16px",
              fontSize: "15px",
              outline: "none",
              background: loading ? "#F5F5F2" : "#FFFFFF"
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Envoyer le message"
            style={{
              background: loading || !input.trim() ? "#E5E5E0" : "#C8E000",
              color: "#1A1A1A",
              border: "none",
              borderRadius: "10px",
              padding: "0 22px",
              cursor: loading || !input.trim() ? "default" : "pointer",
              fontWeight: 700,
              fontSize: "15px"
            }}
          >
            Envoyer
          </button>
        </form>
      </footer>
    </div>
  );
}
