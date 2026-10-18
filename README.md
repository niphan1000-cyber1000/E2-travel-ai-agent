# E2 Travel Solutions: Tier-1 Support Specialist & Mission Operations Console

[![CI Pipeline](https://github.com/niphan1000-cyber1000/E2-travel-ai-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/niphan1000-cyber1000/E2-travel-ai-agent/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Environment](https://img.shields.io/badge/environment-Simulated%20Advisory%20Sandbox-amber.svg)](#transparency--simulation-disclaimer)

An expert Tier-1 AI Support Specialist and Incident Diagnostics Console for the **E2 Travel Software** (E2 Solutions by CWTSatoTravel) utilized across the U.S. Department of State (DOS) and global U.S. Missions (over 200 posts worldwide).

---

## ⚠️ Transparency & Simulation Disclaimer

> **IMPORTANT NOTICE:**  
> This application is an **advisory simulation sandbox and training environment**. It provides technical troubleshooting frameworks, workflow automation, and procedural checklists based on publicly accessible government travel regulations (**14 FAM 500**, **41 CFR Federal Travel Regulation**, and **DSSR Chapter 040**).  
> - **NOT A PRODUCTION SYSTEM:** It is **NOT** connected to live, classified, or production Department of State networks, live GFMS ledgers, or internal embassy databases.  
> - **DEMO DATA:** All uptime metrics, latency pings, ticket queues, and user identifiers are simulated baselines for demonstration and training.  
> - **OFFICIAL VERIFICATION REQUIRED:** Official travel orders and voucher reimbursements must always be verified within the official E2 Solutions console and authorized by certified Post Financial Management Officers (FMO).

---

## System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Client SPA)                           │
│   React 19 • TypeScript • Tailwind CSS 4 • Lucide Icons • Motion       │
│                                                                        │
│  [AI Specialist Chat]  [Uptime Telemetry]  [Service Desk Ticket Queue] │
│  [Diagnostic Wizard]   [SOP Repository]    [DSSR Per Diem Calculator]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON (Restricted to 100kb)
                                    │ Rate-Limited (40 req/min per IP)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend (Express API)                           │
│   server.ts • Node.js (>=18) • tsx • Vite Middlewares (Dev Mode)       │
│                                                                        │
│   • Strict Request Schema Validation (max length, message roles)       │
│   • Request ID Tracking (X-Request-Id UUID headers)                   │
│   • Sanitized Safe Error Handling (No stack traces exposed)            │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    (Live API Key)  ▼                (Offline / Fallback) ▼
┌─────────────────────────────────────┐  ┌───────────────────────────────┐
│       Google GenAI SDK (Node)       │  │  E2 Knowledge Base Engine     │
│   Model: gemini-3.8-flash           │  │  Offline Reference Guidance   │
│   System Instruction: 14 FAM & DSSR │  │  Structured RCA Checklists    │
└─────────────────────────────────────┘  └───────────────────────────────┘
```

---

## Key Features

1. **AI Support Specialist & Scenario Terminal**
   - Powered by `@google/genai` with model `gemini-3.8-flash` (or offline fallback).
   - Pre-loaded interactive scenarios:
     - Error 401 Submitting Travel Authorization (TA).
     - Standard User Onboarding & Offboarding SOP for Administrators.
     - GFMS Financial Obligation Mismatch (Error 502).
     - Fly America Act & Open Skies Waiver Verification.
     - DSSR Foreign Per Diem Lodging Cap & Actual Expense Allowance (AEA).
   - Automatic Incident Resolution Report & SOP Generator (`.md` export).

2. **Subsystem Uptime & Telemetry Dashboard**
   - Tracks 6 critical travel subsystems: E2 Solutions Core, GFMS Financial Interface, CWTSato Sabre GDS Bridge, DSSR Per Diem Sync, ADFS SSO, and NEPA/eClass Accounting Validator.
   - Global Mission Post health map representing 200+ diplomatic posts.

3. **Global Service Desk Ticket Queue**
   - Active ticket triage with real-time SLA countdowns.
   - Filter by Priority (P1-Critical to P3-Normal), Category, and Post.
   - One-click **"Analyze with AI Specialist"** integration.

4. **Interactive Diagnostic Wizard & SOP Library**
   - Interactive checklist verification workflow (Step 1 -> Step 2 -> Step 3).
   - Copyable resolution logs and official Standard Operating Procedures.

5. **DSSR Foreign Per Diem Calculator**
   - Calculates official Lodging Cap and Meals & Incidentals (M&IE) per diem.
   - Incorporates the FTR 75% proration rule for first and last travel days.
   - Automatic Actual Expense Allowance (AEA) warning thresholds (150% and 300%).

6. **Multilingual Support for Global Posts**
   - Instant 4-language toggle: English, Thai (ภาษาไทย), Spanish (Español), and French (Français).

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20+` or `v22+` recommended).
- **Package Manager**: `npm` (v9+), `yarn`, or `bun`.
- **Gemini API Key**: (Optional for local testing; without it, the app operates in offline reference knowledge base mode).

---

## Quick Start Installation

### 1. Clone Repository

```bash
git clone https://github.com/niphan1000-cyber1000/E2-travel-ai-agent.git
cd E2-travel-ai-agent
```

### 2. Configure Environment Variables

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and insert your Gemini API Key:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-3.8-flash"
PORT=3000
NODE_ENV="development"
```

> *Note: If no API key is provided, the server seamlessly serves structured procedural guidance from the built-in offline E2 Knowledge Base.*

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open your browser at: **`http://localhost:3000`**

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `tsx server.ts` | Runs the full-stack development server with Vite middleware on port 3000 |
| `npm run build` | `vite build` | Compiles the production React bundle into `/dist` |
| `npm start` | `NODE_ENV=production tsx server.ts` | Runs the production Express server serving the static build |
| `npm run lint` | `tsc --noEmit` | Runs TypeScript compiler checks without emitting files |
| `npm test` | `tsx --test tests/**/*.test.ts` | Runs native Node.js unit tests for API validation, rate limiting, and per diem math |
| `npm run clean` | `node -e "..."` | Cross-platform clean script to safely delete the `/dist` directory |

---

## API Endpoints & Security Specifications

### 1. Chat Completion (`POST /api/chat`)

- **Payload Limit:** `100kb`
- **Rate Limit:** 40 requests/minute per client IP
- **Request Headers:**
  - `Content-Type: application/json`
  - `X-Request-Id: <uuid>` (optional; auto-generated if omitted)
- **Request Body Schema:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "User cannot submit TA in E2, getting Error 401."
    }
  ],
  "postContext": "U.S. Embassy Bangkok [BKK]",
  "language": "th"
}
```

- **Validation Rules:**
  - `messages`: Array of 1 to 20 items.
  - `role`: Strictly `"user"` or `"model"`.
  - `content`: Non-empty string, maximum 4,000 characters.
  - `language`: Strictly `"th"`, `"en"`, `"es"`, or `"fr"`.

- **Response Body:**

```json
{
  "reply": "### 📋 Diagnostic Guidance: Error 401...",
  "metadata": {
    "source": "ai_live",
    "model": "gemini-3.8-flash",
    "isVerified": false,
    "isSimulated": true,
    "confidence": "high",
    "disclaimer": "Generated by AI advisory assistant based on 14 FAM & DSSR regulations.",
    "policyReferences": ["14 FAM 560", "DSSR Chapter 040", "FTR §301-70"],
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-10-17T21:30:00.000Z"
  }
}
```

### 2. Auto SOP Generator (`POST /api/generate-sop-report`)

- **Request Body:**

```json
{
  "topic": "Error 401 Routing Deadlock",
  "details": "Approver ID_38192 marked inactive",
  "ticketId": "TKT-9042",
  "post": "U.S. Embassy Bangkok",
  "language": "en"
}
```

- **Validation Rules:**
  - `topic`: String, max 200 characters.
  - `details`: String, max 4,000 characters.
  - `ticketId`: Alphanumeric + hyphens only, max 30 characters.

---

## Security Hardening Details

- **Strict Payload Limiting:** Express body parser configured with a strict `100kb` ceiling to prevent payload inflation or denial-of-service memory exhaustion.
- **In-Memory Rate Limiting:** Sliding-window rate limiter preventing API abuse (returns `HTTP 429` with `Retry-After` headers).
- **Request Tracking:** Every HTTP request is assigned a `UUID` v4 (`X-Request-Id`) returned in response headers for audit tracing.
- **Sanitized Error Responses:** Internal error messages and stack traces are suppressed; clients receive standardized JSON `{ error: '...', code: '...', requestId: '...' }`.
- **Security Headers:** Enforces `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN`.

---

## Regulatory References

- **Foreign Affairs Manual (14 FAM 500):** Official Department of State travel policy, travel authorizations, and voucher rules.
- **Department of State Standardized Regulations (DSSR):** Chapter 040 foreign per diem rates, lodging allowances, and M&IE splits ([aoprals.state.gov](https://aoprals.state.gov)).
- **41 CFR 301 (Federal Travel Regulation):** General Services Administration (GSA) guidelines, Fly America Act (§301-10.131), and 75% first/last day proration (§301-11.101).

---

## License

This project is licensed under the Apache License 2.0.
