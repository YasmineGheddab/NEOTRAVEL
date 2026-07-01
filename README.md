# NeoTravel — Automatisation de la chaîne commerciale

## 🎯 Présentation du projet

NeoTravel est une plateforme d'intermédiation spécialisée dans le transport de personnes en groupe (associations, entreprises, collectivités, particuliers). Ce projet automatise l'intégralité de la chaîne commerciale : qualification du lead via un chatbot IA, calcul déterministe du devis, génération du PDF, envoi par email, stockage CRM et relances automatiques.

**Objectif métier** : Supprimer le goulot d'étranglement du traitement manuel des demandes (environ 60 leads/jour) en automatisant l'ensemble du processus commercial, de la prise de contact jusqu'à la relance post-devis.

**Groupe 40 — MSc Digital, Epitech**
Aymen Feniniche · Selena Fersaoui · Yasmine Gheddab · Mariam Sylla · Kalil Medfai

---

## 🏗️ Architecture technique

| Composant | Technologie |
|---|---|
| Front-end (chatbot) | Next.js 13 (React) |
| Orchestration / Automatisation | n8n (cloud) |
| LLM (qualification conversationnelle) | Mistral AI via Vercel AI Gateway |
| Calcul de distance | OpenRouteService API (gratuit) |
| Calcul du devis | Code JavaScript déterministe (n8n) |
| Génération PDF | pdfmunk (n8n) |
| CRM / Base de données | Airtable (4 tables) |
| Envoi d'emails | Gmail (n8n) |
| Relances automatiques | Schedule Trigger (n8n) |

### Schéma de flux

```
Front-end (chatbot React)
    → Webhook n8n
    → AI Agent Mistral (qualification conversationnelle)
    → Code JS (extraction et validation des données)
    → If (demande complète ?)
        → false : Respond to Webhook (continue la conversation)
        → true :
            → HTTP Request OpenRouteService (géocodage départ)
            → HTTP Request OpenRouteService (géocodage arrivée)
            → HTTP Request OpenRouteService (calcul distance)
            → Airtable Search (récupération règles Matrices Pricing)
            → Code JS REGLE (application des règles tarifaires)
            → Code JS CALCULER DEVIS (calcul déterministe)
            → Code JS HTML (génération template)
            → Convert HTML to PDF
            → Send Email (devis PDF en pièce jointe)
            → Upsert Airtable (stockage lead + demande + devis)

Workflow relance (séparé) :
    → Schedule Trigger (quotidien 9h)
    → Airtable Search (devis envoyés sans réponse depuis 3 jours)
    → Airtable Get (récupération email depuis table Leads)
    → If (email trouvé ?)
        → true : Send Email (relance)
        → false : Stop
```

---

## 🔑 Règle d'or — Pricing déterministe

**Le LLM ne calcule jamais de prix.** Le calcul du devis repose exclusivement sur une fonction JavaScript pure, déterministe et auditable. L'agent IA collecte uniquement les informations, vérifie qu'elles sont complètes, puis déclenche le calcul.

Le moteur de calcul applique 5 matrices de coefficients stockées dans Airtable (table **Matrices Pricing**) :
- **Distance** — forfait kilométrique (base 3,5€/km, minimum 650€)
- **Saisonnalité** — coefficient selon le mois de départ
- **Urgence** — coefficient selon le délai avant départ (< 14j, < 30j, < 90j)
- **Capacité** — selon le nombre de passagers
- **Options** — guide/accompagnateur (80€/jour), nuit chauffeur (120€/nuit)

Plus une marge commerciale de 15% et une TVA de 10% appliquées systématiquement.

---

## 📂 Structure du repository

```
NEOTRAVEL/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts              # Proxy vers webhook n8n
│   │   ├── dashboard/
│   │   │   └── route.ts              # API dashboard
│   │   ├── login/
│   │   │   └── route.ts              # API authentification
│   │   └── logout/
│   │       └── route.ts              # API déconnexion
│   ├── chat/
│   │   └── page.tsx                  # Interface chatbot NeoTravel
│   ├── dashboard/
│   │   ├── DashboardClient.tsx       # Composant client dashboard
│   │   └── page.tsx                  # Page dashboard
│   ├── login/
│   │   └── page.tsx                  # Page de connexion
│   ├── favicon.ico
│   ├── globals.css                   # Styles globaux
│   ├── layout.tsx                    # Layout principal
│   └── page.tsx                      # Page d'accueil
├── public/                           # Assets statiques
├── front.jsx                         # Composant front alternatif
├── index.html
├── .gitignore
├── .eslintrc.json
├── next.config.js
├── next-env.d.ts
├── package.json
└── README.md
```

---

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+
- Un compte n8n cloud (ou self-hosted)
- Un compte Airtable avec Personal Access Token
- Un compte Vercel AI Gateway avec clé API Mistral
- Un compte OpenRouteService (gratuit, 2000 req/jour)
- Un compte Gmail configuré en OAuth2 dans n8n
- Un compte pdfmunk pour la génération PDF

### Configuration de l'environnement

Avant de lancer le projet, créez un fichier `.env.local` à la racine du projet avec les variables d'environnement suivantes :
```bash
AIRTABLE_API_KEY="Ta_clé_API"
AIRTABLE_BASE_ID="Ta_base_ID"
AIRTABLE_USERS_TABLE=Utilisateurs
AIRTABLE_LEADS_TABLE=Leads
AIRTABLE_DEVIS_TABLE=Devis
AIRTABLE_RELANCES_TABLE=Relances
```

### Front-end

```bash
npm install
npm run dev
```

Accessible sur `http://localhost:3000`

### Variables d'environnement

Crée un fichier `.env.local` à la racine :

```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://aymenfeniniche.app.n8n.cloud/workflow/KDDLOqt9X0Fq2N57
```

### Configuration n8n

1. Importer `Workflow Agent commercial.json` dans n8n
2. Importer `Workflow relance.json` dans n8n
3. Configurer les credentials :
   - **Vercel AI Gateway** : clé API Mistral
   - **Airtable** : Personal Access Token
   - **Gmail** : OAuth2
   - **OpenRouteService** : clé API (dans l'URL des nœuds HTTP Request)
   - **pdfmunk** : clé API
4. Publier les deux workflows (statut "Active")
5. Copier l'URL de production du Webhook dans `.env.local`

---

## 🧠 Agent IA — Fonctionnement

L'agent collecte les informations dans un ordre strict, en posant au maximum 3 questions à la fois :

**Étape 1 — Identité**
type_client → prénom → nom → email → téléphone (→ société si entreprise)

**Étape 2 — Trajet**
type_trajet → adresse départ → adresse arrivée → date départ → heure départ → nb_passagers

**Étape 3 — Si aller-retour**
date_retour → heure_retour

**Étape 4 — Options**
guide → nuit_chauffeur

L'agent retourne à chaque tour un JSON structuré avec `is_complete`, `lead`, `demande`, `assistant_message` et `missing_fields`. Le Code JS valide ce JSON et déclenche le calcul uniquement quand tous les champs obligatoires sont présents.

Le prompt système complet est disponible dans le fichier `prompt-systeme-agent.txt`.

---

## 📊 Structure Airtable (4 tables)

| Table | Rôle |
|---|---|
| **Leads** | Informations client (nom, email, téléphone, type_client, société) |
| **Demandes** | Détails du trajet (villes, dates, passagers, options, distance) |
| **Devis** | Devis générés (montants HT/TTC/TVA, statut, date validité) |
| **Matrices Pricing** | Règles tarifaires (coefficients saison, urgence, options) |

---

## 🛡️ Sécurité et RGPD

- **Pricing déterministe et auditable** — jamais de calcul par le LLM
- **Human-in-the-loop (HITL)** — escalade automatique pour les demandes complexes (>85 passagers, trajets atypiques)
- **Anti prompt-injection** — séparation stricte entre instructions système et contenu utilisateur
- **RGPD** — collecte minimale des données, strictement nécessaire à la finalité commerciale

---

## ✅ État d'avancement

- [x] Interface chatbot Next.js (accessible, sans sidebar)
- [x] Agent conversationnel IA (Mistral via Vercel AI Gateway)
- [x] Extraction et validation des données (Code JS déterministe)
- [x] Calcul de distance réelle (OpenRouteService API)
- [x] Récupération des règles tarifaires (Airtable Matrices Pricing)
- [x] Moteur de pricing déterministe (Code JS)
- [x] Génération automatique du PDF de devis
- [x] Envoi du devis par email (Gmail)
- [x] Stockage CRM (Airtable : Leads, Demandes, Devis)
- [ ] Relances automatiques J+3
- [x] Documentation de passation technique et non-technique

---

## 📚 Documentation complémentaire

| Document | Contenu |
|---|---|
| `prompt-systeme-agent.txt` | Prompt système complet de l'agent IA |
| `Livrable 3_Documentation de passation_Grp40-5.pdf` | Document de passation avec tous les documents nécessaires|

---

## 👥 Équipe

Projet réalisé dans le cadre du **MSc Digital — Epitech — Groupe 40**

Aymen Feniniche · Selena Fersaoui · Yasmine Gheddab · Mariam Sylla · Kalil Medfai
