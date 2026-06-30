# NeoTravel

## 🎯 Présentation du projet

NeoTravel est une plateforme intermédiaire mettant en relation des autocaristes avec des groupes de personnes (entreprises, particuliers...). Ce projet automatise l'intégralité de la chaîne commerciale : qualification du lead, calcul de devis, génération du PDF, envoi par email, et relances ; via un agent conversationnel IA intégré à un chatbot front-end.

**Objectif métier** : Les équipes commerciales de NeoTravel traitaient jusqu'ici environ 60 leads par jour manuellement, ce qui plafonnait la croissance à la capacité humaine plutôt qu'à la demande réelle du marché. Ce projet supprime ce goulot d'étranglement.

**Groupe 40 - MSc Digital, Epitech**
Aymen Feniniche · Selena Fersaoui · Yasmine Gheddab · Mariam Sylla · Kalil Medfai

**Calendrier du projet**
- 24/06 — Dossier de cadrage (L1)
- 30/06 — Prototype + documentation de passation (L2 + L3)
- 02/07 — Soutenance

---

## 🏗️ Architecture technique (Option A)

| Composant | Technologie |
|---|---|
| Front-end | Next.js (React) |
| Orchestration / Automatisation | n8n |
| LLM (qualification conversationnelle) | Mistral AI, via Vercel AI Gateway |
| CRM / Base de données | Airtable |
| Génération de devis PDF | Nœud HTML to PDF (n8n) |
| Envoi d'emails | Gmail (n8n) |
| Relances automatiques | Schedule Trigger (n8n) |

### Schéma de flux simplifié

```
Front-end (chat) 
    → Webhook n8n 
    → Agent IA (Mistral) — qualification de la demande
    → Tool calculer_devis() — calcul déterministe (JS)
    → Génération PDF du devis
    → Envoi email + stockage Airtable (Leads, Demandes, Devis)
    → Schedule Trigger — relance automatique si pas de réponse (J+3)
```

---

## Règle d'or — Pricing déterministe

**Le LLM ne calcule jamais de prix.** Le calcul du devis repose exclusivement sur 'calculer_devis()', une fonction JavaScript pure, déterministe et testée. L'agent IA se contente de collecter les informations, vérifier qu'elles sont complètes, et appeler cet outil. Cette séparation garantit l'auditabilité et la fiabilité de chaque devis émis.

Le moteur de calcul couvre cinq matrices de coefficients :
- **Distance** (forfait pour les trajets ≤180km, tarif kilométrique au-delà)
- **Saisonnalité** (Très haute saison, haute saison, saison normale et basse saison)
- **Urgence** (seuils à 14, 30 et 90 jours avant le départ)
- **Capacité** (nombre de passagers)
- **Options** (accompagnateur, nuit chauffeur, péages inclus)

Plus une marge commerciale de 15% et une TVA de 10% appliquées systématiquement

---

## 🚀 Installation et lancement

### Prérequis
- Node.js
- Un compte n8n (cloud ou self-hosted)
- Un compte Airtable
- Un compte Vercel AI Gateway (ou accès direct à l'API Mistral)
- Un compte Gmail pour l'envoi d'emails (OAuth2)

### Front-end

```bash
cd front
npm install
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

### Variables d'environnement (`.env.local`)

```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://aymenfeniniche.app.n8n.cloud/workflow/UqBl0L2cyztHLgzj
```

### Configuration n8n

1. Dans l'instance n8n
2. Configurer les credentials :
   - Vercel AI Gateway (clé API)
   - Airtable (Personal Access Token)
   - Gmail (OAuth2)
3. Vérifier que chaque nœud Tool (Airtable, Code, HTML to PDF, Send Email) est bien connecté à l'AI Agent
4. Publier le workflow (statut "Active")
5. Copier l'URL de production du nœud Webhook et la renseigner dans `.env.local` du front


---

## 🧠 Agent IA — Fonctionnement

L'agent conversationnel (Mistral AI) a pour unique rôle de **qualifier la demande** du prospect, pas de calculer un prix. Il collecte successivement :

**Champs obligatoires**
- Nom et prénom
- Adresse email
- Ville de départ
- Ville d'arrivée
- Date de départ
- Nombre de passagers

**Champs optionnels** (jamais imposés)
- Téléphone
- Date de retour
- Type de client (particulier, association, entreprise, collectivité)
- Options (accompagnateur, nuit chauffeur, péages)

Une fois la demande complète, l'agent appelle le tool `calculer_devis()`, présente le résultat au prospect, puis propose l'envoi du devis par email.

Le prompt système complet est disponible dans `docs/prompt-systeme-agent.md`.

---

## 🔁 Relances automatiques

Un nœud Schedule Trigger s'exécute quotidiennement et vérifie dans Airtable les devis envoyés sans réponse depuis 3 jours. Une relance automatique est alors déclenchée par email.

---

## 🛡️ Sécurité, fiabilité et RGPD

- **Pricing déterministe et auditable** — jamais de calcul par le LLM
- **Human-in-the-loop (HITL)** — escalade automatique vers un commercial humain pour les demandes complexes (plus de 85 passagers, trajets internationaux, cas atypiques)
- **Protection contre l'injection de prompt** — séparation stricte entre les instructions système et le contenu fourni par l'utilisateur ; l'agent ignore toute instruction du prospect qui contredirait ses règles
- **RGPD** — collecte de données minimale, strictement nécessaire à la finalité commerciale (établissement d'un devis)

---

## 📚 Documentation complémentaire

| Document | Contenu |
|---|---|
| `docs/procedure-repreneur.md` | Guide technique : relancer l'application, modifier la grille tarifaire, ajuster le prompt, diagnostiquer une panne |
| `docs/procedure-equipes.md` | Guide non-technique pour les équipes NeoTravel : utilisation d'Airtable, gestion des cas complexes, FAQ |
| `docs/airtable-schema.md` | Schéma détaillé des 4 tables (Leads, Demandes, Devis, Relances) |
| `docs/prompt-systeme-agent.md` | Prompt système complet de l'agent IA |

---

## ✅ État d'avancement

- [x] Moteur de pricing déterministe
- [x] Agent conversationnel IA (Mistral)
- [x] Interface chatbot Next.js
- [x] Intégration Airtable (CRM : Leads, Demandes, Devis)
- [x] Génération automatique du PDF de devis
- [x] Envoi du devis par email
- [x] Relances automatiques (J+3)
- [x] Documentation de passation technique et non-technique

---

## 👥 Contact

Projet réalisé dans le cadre du MSc Digital — Epitech — Groupe 40.
