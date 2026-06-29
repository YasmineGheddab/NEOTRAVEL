import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

const TABLES = {
  leads: process.env.AIRTABLE_LEADS_TABLE || "Leads",
  demandes: process.env.AIRTABLE_DEMANDES_TABLE || "Demandes",
  devis: process.env.AIRTABLE_DEVIS_TABLE || "Devis",
  relances: process.env.AIRTABLE_RELANCES_TABLE || "Relances",
};

async function getRecords(tableName: string) {
  let records: any[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`
    );

    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    records = [...records, ...(data.records || [])];
    offset = data.offset;
  } while (offset);

  return records;
}

function field(record: any, names: string[]) {
  for (const name of names) {
    if (record.fields?.[name] !== undefined) return record.fields[name];
  }
  return null;
}

function money(value: any) {
  if (!value) return 0;
  return Number(String(value).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
}

function normalizeStatus(value: any) {
  return String(value || "Non renseigné").trim();
}

export async function GET() {
  try {
    const [leads, demandes, devis, relances] = await Promise.all([
      getRecords(TABLES.leads),
      getRecords(TABLES.demandes),
      getRecords(TABLES.devis),
      getRecords(TABLES.relances),
    ]);

    const devisAcceptes = devis.filter((d) =>
      normalizeStatus(field(d, ["Statut_devis", "Statut devis"]))
        .toLowerCase()
        .includes("accept")
    );

    const devisRefuses = devis.filter((d) =>
      normalizeStatus(field(d, ["Statut_devis", "Statut devis"]))
        .toLowerCase()
        .includes("refus")
    );

    const caPotentiel = devis.reduce(
      (sum, d) => sum + money(field(d, ["Montant_TTC", "Montant TTC"])),
      0
    );

    const caSigne = devisAcceptes.reduce(
      (sum, d) => sum + money(field(d, ["Montant_TTC", "Montant TTC"])),
      0
    );

    const tauxConversion =
      devis.length > 0 ? Math.round((devisAcceptes.length / devis.length) * 100) : 0;

    const panierMoyen =
      devis.length > 0 ? Math.round(caPotentiel / devis.length) : 0;

    const statusMap: Record<string, number> = {};
    leads.forEach((l) => {
      const status = normalizeStatus(field(l, ["Statut", "Statut lead"]));
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const statutsLeads = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));

    const relanceMap: Record<string, number> = {};
    relances.forEach((r) => {
      const status = normalizeStatus(field(r, ["Statut_relance", "Statut relance"]));
      relanceMap[status] = (relanceMap[status] || 0) + 1;
    });

    const statutsRelances = Object.entries(relanceMap).map(([name, value]) => ({
      name,
      value,
    }));

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const leadsParJour = last7Days.map((date) => {
      const label = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });

      const count = leads.filter((l) => {
        const rawDate = field(l, ["Date_lead", "Date création", "Date demande"]);
        if (!rawDate) return false;
        const leadDate = new Date(rawDate);
        return leadDate.toDateString() === date.toDateString();
      }).length;

      return { date: label, leads: count };
    });

    const derniersLeads = leads
      .slice()
      .reverse()
      .slice(0, 8)
      .map((l) => ({
        id: l.id,
        nom: field(l, ["Nom"]) || "-",
        prenom: field(l, ["Prénom", "Prenom"]) || "",
        email: field(l, ["Email", "Mail"]) || "-",
        telephone: field(l, ["Téléphone", "Telephone", "Numéro"]) || "-",
        statut: field(l, ["Statut", "Statut lead"]) || "Nouveau",
        date: field(l, ["Date_lead", "Date création"]) || null,
      }));

    return NextResponse.json({
      kpis: {
        totalLeads: leads.length,
        totalDemandes: demandes.length,
        totalDevis: devis.length,
        totalRelances: relances.length,
        devisAcceptes: devisAcceptes.length,
        devisRefuses: devisRefuses.length,
        tauxConversion,
        caPotentiel,
        caSigne,
        panierMoyen,
      },
      charts: {
        leadsParJour,
        statutsLeads,
        statutsRelances,
      },
      derniersLeads,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur dashboard" },
      { status: 500 }
    );
  }
}