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
      background: "radial-gradient(circle at 12% 12%, rgba(216, 231, 98, 0.12), rgba(0, 0, 0, 0) 22%), radial-gradient(circle at 88% 55%, rgba(95, 170, 255, 0.16), rgba(0, 0, 0, 0) 20%), linear-gradient(rgb(8, 17, 31), rgb(11, 19, 38) 36%, rgb(9, 16, 29))"
    }}>

      {/* En-tête */}
      <header style={{
        padding: "20px 32px",
        borderBottom: "1px solid #2a3a55",
        background: "#1a2645",
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
          <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
            Neotravel
          </h1>
          <p style={{ fontSize: "13px", color: "#A0A8B8", margin: 0 }}>
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
                background: msg.role === "user" ? "#C8E000" : "#2a3a55",
                color: msg.role === "user" ? "#1A1A1A" : "#E0E0E0",
                border: msg.role === "assistant" ? "1px solid #3a4a65" : "none",
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
              background: "#2a3a55",
              border: "1px solid #3a4a65",
              borderRadius: "16px",
              borderTopLeftRadius: "4px",
              padding: "14px 18px",
              fontSize: "15px",
              color: "#E0E0E0"
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
        background: "#1a2645",
        borderTop: "1px solid #2a3a55"
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
              border: "1px solid #3a4a65",
              borderRadius: "10px",
              padding: "14px 16px",
              fontSize: "15px",
              outline: "none",
              background: loading ? "#232e42" : "#2a3a55",
              color: "#E0E0E0",
              transition: "background-color 0.2s ease"
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Envoyer le message"
            style={{
              background: loading || !input.trim() ? "#3a4a65" : "#C8E000",
              color: loading || !input.trim() ? "#A0A8B8" : "#1A1A1A",
              border: "none",
              borderRadius: "10px",
              padding: "0 22px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "15px",
              transition: "all 0.2s ease"
            }}
          >
            Envoyer
          </button>
        </form>
      </footer>
    </div>
  );
}
