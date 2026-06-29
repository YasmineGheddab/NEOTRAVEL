import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = cookies().get("neotravel_session");

  if (!session || session.value !== "direction") {
    redirect("/login");
  }

  return (
    <main style={{ padding: 32, fontFamily: "sans-serif", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1>Dashboard Direction NeoTravel</h1>
      <p>Accès protégé direction.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
        <Card title="Leads" value="--" />
        <Card title="Devis envoyés" value="--" />
        <Card title="Relances" value="--" />
        <Card title="Taux conversion" value="--" />
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: "white", padding: 24, borderRadius: 14 }}>
      <p style={{ color: "#666" }}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}