"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardClient() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-10">
        Chargement...
      </main>
    );
  }

  const { kpis, charts, derniersLeads } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-lime-300 font-semibold">NeoTravel</p>
          <h1 className="text-4xl font-black">Dashboard Direction</h1>
          <p className="text-slate-400 mt-2">
            Pilotage commercial en temps réel depuis Airtable
          </p>
        </div>

        <a
          href="/api/logout"
          className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          Déconnexion
        </a>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Kpi title="Leads reçus" value={kpis.totalLeads} />
        <Kpi title="Devis générés" value={kpis.totalDevis} />
        <Kpi title="Taux conversion" value={`${kpis.tauxConversion}%`} />
        <Kpi
          title="CA potentiel"
          value={`${kpis.caPotentiel.toLocaleString("fr-FR")} €`}
        />
        <Kpi title="CA signé" value={`${kpis.caSigne.toLocaleString("fr-FR")} €`} />
        <Kpi
          title="Panier moyen"
          value={`${kpis.panierMoyen.toLocaleString("fr-FR")} €`}
        />
        <Kpi title="Relances" value={kpis.totalRelances} />
        <Kpi title="Devis acceptés" value={kpis.devisAcceptes} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <Panel title="Leads sur les 7 derniers jours" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts.leadsParJour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#c8e000"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <Legend items={[{ label: "Leads reçus", color: "#c8e000" }]} />
        </Panel>

        <Panel title="Répartition des statuts leads">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts.statutsLeads}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
              >
                {charts.statutsLeads.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <Legend
            items={charts.statutsLeads.map((item: any, index: number) => ({
              label: item.name,
              color: COLORS[index % COLORS.length],
            }))}
          />
        </Panel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel title="Statuts des relances">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.statutsRelances}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#c8e000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <Legend items={[{ label: "Nombre de relances", color: "#c8e000" }]} />
        </Panel>

        <Panel title="Derniers leads" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-3">Client</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Téléphone</th>
                  <th className="text-left py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {derniersLeads.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-white/5">
                    <td className="py-3 font-medium">
                      {lead.prenom} {lead.nom}
                    </td>
                    <td className="py-3 text-slate-300">{lead.email}</td>
                    <td className="py-3 text-slate-300">{lead.telephone}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-lime-300/10 text-lime-300 px-3 py-1 text-xs">
                        {lead.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-5 shadow-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="text-3xl font-black mt-2">{value}</h2>
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl bg-white/10 border border-white/10 p-6 ${className}`}
    >
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </section>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 text-sm text-slate-300"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

const COLORS = [
  "#c8e000",
  "#38bdf8",
  "#a78bfa",
  "#fb7185",
  "#fbbf24",
  "#34d399",
];