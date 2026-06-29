"use client";

import { useState } from "react";

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("direction@neotravel.fr");
  const [password, setPassword] = useState("neotravel2026");
  const [error, setError] = useState("");

  const login = async () => {
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Identifiants invalides.");
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f5f5f5" }}>
      <div style={{ width: 380, background: "white", padding: 32, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <h1 style={{ marginBottom: 8 }}>NeoTravel</h1>
        <p style={{ marginBottom: 24, color: "#666" }}>Connexion direction</p>

        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" type="password" style={inputStyle} />

        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}

        <button onClick={login} style={{ width: "100%", padding: 14, background: "#C8E000", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
          Se connecter
        </button>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  border: "1px solid #ddd",
  borderRadius: 8,
  color: "#111",
};