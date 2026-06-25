export default function Home(): JSX.Element {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600') center/cover no-repeat",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontFamily: "sans-serif",
      padding: "20px"
    }}>
      <h1 style={{ color: "#C8E000", fontSize: "3rem", fontWeight: "900", marginBottom: "8px" }}>
        Neotravel
      </h1>

      <div style={{
        border: "1px solid white",
        borderRadius: "20px",
        padding: "6px 16px",
        color: "white",
        fontSize: "0.75rem",
        letterSpacing: "2px",
        marginBottom: "32px"
      }}>
        ● TRANSPORT PREMIUM AVEC CHAUFFEUR
      </div>

      <h2 style={{ color: "white", fontSize: "3.5rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "16px" }}>
        Location d'autocar,<br />minibus & berline<br />
        <span style={{ fontStyle: "italic" }}>sur mesure</span>
      </h2>

      <p style={{ color: "white", fontSize: "1rem", maxWidth: "500px", marginBottom: "40px", opacity: 0.9 }}>
        Voyagez sereinement en groupe avec nos véhicules premium et nos chauffeurs professionnels.
        Devis gratuit, automatique et rappel commercial rapide.
      </p>

      <a href="/chat" style={{
        background: "#6B7A00",
        color: "white",
        padding: "16px 32px",
        borderRadius: "8px",
        fontWeight: "700",
        letterSpacing: "1px",
        fontSize: "0.9rem",
        textDecoration: "none",
        cursor: "pointer"
      }}>
        OBTENIR UN DEVIS MAINTENANT
      </a>
    </main>
  )
}