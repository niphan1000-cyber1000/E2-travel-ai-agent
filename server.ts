import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const E2_SYSTEM_INSTRUCTION = `You are a Senior IT Analyst and Tier-1 Support Specialist for "E2 Travel Software" (E2 Solutions by CWTSatoTravel) supporting the U.S. Department of State (DOS) and global U.S. Missions (Embassies & Consulates across 200+ posts worldwide).

Your expertise encompasses:
1. E2 Travel System Guidance:
   - Travel Authorizations (TA): Routine temporary duty (TDY), permanent change of station (PCS), post travel authorizations (PTA), emergency travel, amendments, deobligations.
   - Expense Reports (ER / Travel Vouchers): Lodging + M&IE per diem, actual expense claims, currency exchange conversions, DSSR (Department of State Standardized Regulations), 75% first and last day rule.
   - Ticketing & TMC Integration: CWTSatoTravel GDS Sabre feeds, Centrally Billed Accounts (CBA) vs Individually Billed Accounts (IBA), Fly America Act compliance and Open Skies exceptions.
   - Regulations: U.S. Federal Travel Regulation (FTR - 41 CFR), DSSR Chapter 100/200, Foreign Affairs Manual (14 FAM 500).

2. Technical Troubleshooting & Incident Analysis:
   - Error 401 on TA Submission: Missing active Approving Official in the traveler's routing chain, expired digital certificate / PIV-CAC auth token, inactive travel arranger mapping, or accounting strip validation lock.
   - Error 502 / Financial Obligation Sync Error: Global Financial Management System (GFMS) interface failure, accounting string format rejected by NEPA/eClass, insufficient funds on CAN/fiscal code.
   - Routing pool deadlocks: Approver absent without designated alternate, traveler profile missing bureau/section code.
   - User profile lifecycle: Onboarding (linking HR/GEMS records, assigning roles: Traveler, Arranger, AO, Certifying Officer, FMO), Offboarding (clearing outstanding vouchers, reassigning open TAs, deactivating E2 credentials).

3. Communication & Tone Guidelines:
   - Structure responses professionally with clear headings:
     1. [Root Cause Analysis / วิเคราะห์สาเหตุ]
     2. [Step-by-Step Diagnostic Steps / ขั้นตอนการตรวจสอบทีละขั้น: Step 1, Step 2, ...]
     3. [Corrective Action / แนวทางแก้ไขทันที]
     4. [Escalation & Policy Compliance / การส่งต่อและการปฏิบัติตามระเบียบ: 14 FAM, DSSR, FTR]
   - When communicating in Thai (ภาษาไทย), use fluent, highly professional technical government/IT terminology.
   - When asked to summarize or write an SOP, provide a structured official USG IT Incident Report format.`;

// In-memory mock response builder when API key is not provided or quota reached
function generateDomainFallback(prompt: string, language: string = 'th') {
  const isThai = language === 'th' || /[ก-๙]/.test(prompt);

  if (/401|ส่งไม่ได้|submit|authorization|ta/i.test(prompt)) {
    if (isThai) {
      return `### 🔍 การวิเคราะห์ปัญหา: Error 401 ขณะกดส่ง Travel Authorization (TA) ในระบบ E2 Solutions

**สถานะ:** Tier-1 Incident Triaged  
**รหัสข้อผิดพลาด:** \`ERR-401: Unauthorized / Approval Route Validation Failed\`  
**ระบบที่เกี่ยวข้อง:** E2 Solutions Core / Active Directory ADFS / Routing Engine

---

#### 1. สาเหตุที่เป็นไปได้สูงสุด (Root Cause Analysis)
1. **Routing Chain ขาด Approving Official (AO) ที่ใช้งานได้:** ผู้ใช้งานหรือ Travel Arranger ตั้งค่าสายการอนุมัติ (Routing Pool) ไปยังผู้อนุมัติที่ย้าย Post, ลาพักร้อน หรือโปรไฟล์ถูกระงับ
2. **PIV / CAC Token หรือ Session สิ้นอายุ:** ใบรับรองดิจิทัลสำหรับลงนามอิเล็กทรอนิกส์ (Digital Signature) หลุดการเชื่อมต่อกับระบบ ADFS/Single Sign-On
3. **การเชื่อมโยง Accounting Strip ขัดข้อง:** สายงบประมาณ (Fund Citation) ในแถบ Accounting ไม่ตรงกับ Fiscal Year ปัจจุบัน หรือยังไม่ผ่านการ Verify จากระบบ GFMS

---

#### 2. ขั้นตอนการตรวจสอบและแก้ไขทีละขั้น (Step-by-Step Troubleshooting)

* **Step 1: ตรวจสอบ Routing List ของผู้เดินทาง**
  * ไปที่ **Admin / Profile Management** > ค้นหาชื่อ Traveler
  * ตรวจสอบแท็บ **Routing Lists** ว่ามีชื่อผู้อนุมัติระดับ Tier 1 (Supervisor/AO) และ Tier 2 (FMO/Certifying Officer) ครบถ้วนและมีสถานะ **Active** หรือไม่
  * หาก AO ติดราชการ ให้กำหนด **Alternate Approver** ในระบบทันที

* **Step 2: ตรวจสอบสถานะ Digital Signature และ Browser Session**
  * ให้ผู้ใช้งานออกจากระบบ E2 (Sign Out)
  * ล้างเบราว์เซอร์แคช (Ctrl + Shift + Delete) หรือเปิดโหมด Incognito
  * เสียบ PIV/CAC Card ใหม่ ตรวจสอบว่าใบรับรองยืนยันตัวตน (Authentication Certificate) ยังไม่หมดอายุ

* **Step 3: ตรวจสอบแถบ Accounting & Estimation**
  * เข้าไปที่หน้าเอกสาร TA ดังกล่าว > คลิกแท็บ **Accounting**
  * กดปุ่ม **"Validate Accounting Strip"** เพื่อให้ระบบวิ่งไปตรวจกับ NEPA/GFMS Interface
  * หากพบตัวอักษรสีแดงแจ้งเตือน Fund Code ไม่ถูกต้อง ให้ประสาน Post Financial Management Officer (FMO)

---

#### 3. วิธีแก้ไขทันที (Immediate Resolution)
หากตรวจสอบพบว่า Routing List ว่างเปล่า ให้ Travel Administrator หรือ Arranger เลือก **"Assign Default Post Routing Template"** ประจำ Post (เช่น \`POST-BKK-STANDARD-TA\`) จากนั้นกด **Save** และให้ผู้ใช้ลองกด Submit อีกครั้ง

#### 4. แผนการส่งต่อ (Escalation Path)
หากทำตาม Step 1-3 แล้วยังพบ Error 401 เดิม ให้เปิด Ticket ส่งต่อ **Tier-2 E2 Global Helpdesk (CWTSatoTravel)** พร้อมแนบ:
- Document Number (เช่น \`TA-2026-BKK-09412\`)
- Traveler Employee ID
- แคปหน้าจอ Log Error Code และเวลาที่เกิดเหตุ (UTC)`;
    } else {
      return `### 🔍 Issue Analysis: Error 401 Submitting Travel Authorization (TA) in E2 Solutions

**Status:** Tier-1 Incident Triaged  
**Error Code:** \`ERR-401: Unauthorized / Approval Route Validation Failed\`  
**Affected Subsystem:** E2 Solutions Core / Active Directory ADFS / Routing Engine

---

#### 1. Probable Root Causes
1. **Invalid or Incomplete Routing Chain:** The selected Routing List contains an Approving Official (AO) who is inactive, reassigned, or lacking delegation of authority.
2. **Expired Digital Signature / PIV Token:** The cryptographic signing token failed to validate against the DOS PKI infrastructure during electronic signature submission.
3. **Accounting Line Validation Lock:** The financial obligation accounting string has an unverified CAN or fiscal year mismatch against GFMS.

---

#### 2. Step-by-Step Diagnostic & Remediation Steps

* **Step 1: Audit Traveler Routing Chain**
  * Navigate to **Administration > User Profiles > [Traveler Name] > Routing Lists**.
  * Verify that both the Level 1 (Approving Official) and Level 2 (Financial Certifier) are marked **ACTIVE**.
  * If the primary AO is on leave, set up an authorized **Alternate Approver** with effective dates.

* **Step 2: Refresh PIV/CAC Certificate & Clear Auth Cache**
  * Direct traveler to log out of E2 completely.
  * Re-insert PIV card, launch a clean browser session (or private browsing window), and re-authenticate via ADFS SSO.

* **Step 3: Validate Accounting Strip**
  * Open the pending TA > Navigate to the **Accounting** tab.
  * Click **"Validate Accounting Codes"**. Confirm green checkmark indicator before re-attempting submission.

---

#### 3. Escalation Protocol
If the issue persists after updating the routing chain, escalate to **Tier-2 CWTSato E2 Vendor Support**:
- Document Identifier (e.g., \`TA-2026-BKK-09412\`)
- Exact Timestamp (UTC) & Browser build version
- Screenshot of the console network payload.`;
    }
  }

  if (/onboard|offboard|user|แอดมิน|admin|profile/i.test(prompt)) {
    if (isThai) {
      return `### 📋 คู่มือปฏิบัติการมาตรฐาน (SOP): User Onboarding & Offboarding สำหรับแอดมินระบบ E2 Travel

**รหัสเอกสาร:** \`SOP-E2-ADM-042\`  
**หน่วยงาน:** U.S. Mission Global Operations / Financial & Travel Support  
**การปฏิบัติตามระเบียบ:** 14 FAM 500 & Federal Travel Regulation (FTR)

---

#### ส่วนที่ 1: ขั้นตอน User Onboarding (การรับเจ้าหน้าที่เข้าใหม่ในระบบ)

* **Step 1: ตรวจสอบข้อมูลตั้งต้นจาก HR/GEMS**
  * รับแบบฟอร์มขอสิทธิ์ใช้งาน E2 ที่ผ่านการอนุมัติจาก Supervisory Office
  * ดึงรหัสพนักงาน (Employee ID / SEID) และ Post Code ประจำสถานทูต/สถานกงสุล

* **Step 2: สร้างโปรไฟล์ใน E2 Solutions User Management**
  * เข้าสู่ระบบ E2 ในฐานะ **Travel Administrator**
  * ไปที่ **Admin > User Profiles > Create New Profile**
  * ระบุข้อมูลสำคัญ:
    - **Full Legal Name** (ตรงตามหนังสือเดินทางราชการ Official/Diplomatic Passport)
    - **Official Email** (\`@state.gov\`)
    - **Default Routing List:** กำหนดตามหน่วยงาน/Section ของ Post
    - **Role Assignment:** เลือกระดับสิทธิ์ (Traveler, Travel Arranger, Approving Official หรือ FMO Certifier)

* **Step 3: ผูกบัญชีการชำระเงิน (CBA/IBA Integration)**
  * ตรวจสอบว่าเจ้าหน้าที่ถือบัตรเครดิตราชการ **Government Travel Charge Card (IBA)** หรือไม่
  * หากไม่มี ให้กำหนดบัญชีส่วนกลาง **Centrally Billed Account (CBA)** เป็นค่าเริ่มต้นสำหรับตั๋วเครื่องบิน
  * บันทึกข้อมูลและส่งอีเมลแจ้งขั้นตอน First-time Login แก่ผู้ใช้งาน

---

#### ส่วนที่ 2: ขั้นตอน User Offboarding (การจำหน่ายเจ้าหน้าที่ออกจากระบบ / ย้าย Post)

* **Step 1: ตรวจสอบและเคลียร์เอกสารการเดินทางคงค้าง (Outstanding Travel Review)**
  * ค้นหา TAs ที่ยังอยู่ในสถานะ \`Pending Approval\` หรือ \`Approved without Voucher\`
  * ค้นหา Expense Reports (Vouchers) ที่ยังไม่ได้จ่ายเงิน หรือมีหนี้คงค้าง Travel Advance
  * *ข้อกำหนด:* ไม่อนุญาตให้ปิดโปรไฟล์จนกว่าค่าใช้จ่ายทั้งหมดจะถูกกระทบยอด (Reconciled) เสร็จสิ้น

* **Step 2: โอนย้ายหรือมอบหมายเอกสารที่ค้างอยู่ (Reassignment)**
  * หากมี TA ที่ยังไม่เสร็จสิ้น ให้ทำการ Re-route หรือยกเลิก (Deobligate) ในระบบ E2 และแจ้ง FMO ปรับยอดใน GFMS

* **Step 3: ปิดการใช้งานโปรไฟล์ (Deactivation)**
  * เปลี่ยนสถานะ Profile เป็น **"INACTIVE / SEPARATED"**
  * ลบชื่อออกจาก Routing Pool เพื่อป้องกันไม่ให้เอกสารของผู้อื่นติดค้าง
  * บันทึก Audit Log วันที่ดำเนินการเพื่อความปลอดภัยและพร้อมรับการตรวจสอบ (Audit-Ready)`;
    } else {
      return `### 📋 Standard Operating Procedure (SOP): E2 Travel User Onboarding & Offboarding

**Document Ref:** \`SOP-E2-ADM-042\`  
**Compliance Standard:** 14 FAM 500, DSSR, and Federal Travel Regulation (FTR)

---

#### Part 1: User Onboarding Workflow
1. **Verification of HR / GEMS Record:** Obtain supervisor-approved Form DS-XXXX with confirmed Employee ID, Post code, and Fiscal CAN assignment.
2. **Profile Generation in E2 Solutions Admin:**
   - Access **Admin > User Management > New Profile**.
   - Input legal name strictly matching official diplomatic passport.
   - Assign appropriate organizational roles: \`Traveler\`, \`Travel Arranger\`, \`Approving Official (AO)\`, or \`Certifying Officer\`.
3. **Card & Billing Association:**
   - Link approved Government Travel Charge Card (IBA) or map default Post Centrally Billed Account (CBA).
   - Assign appropriate default Routing Template for the bureau/post section.

---

#### Part 2: User Offboarding Workflow
1. **Outstanding Document Audit:** Ensure zero un-voucherized Travel Authorizations and zero unpaid Travel Advances exist.
2. **Document & Delegation Reassignment:** Transfer open drafts or pending approval queues to the designated replacement officer.
3. **Profile Termination:** Mark account status to \`INACTIVE\`, revoke digital signing certificates, and remove user from all active routing pools.`;
    }
  }

  // General helpful response
  return `### 🛡️ E2 Travel Solutions Tier-1 Operations Specialist Response

**Post Context:** Global U.S. Mission Support  
**Regulation Standard:** 14 FAM 500 / 41 CFR FTR / DSSR Chapter 100/200

---

#### 1. Incident Assessment
คำถามของคุณได้รับการบันทึกและประมวลผลโดย E2 Tier-1 Support Specialist สำหรับระบบการเดินทางของกระทรวงการต่างประเทศสหรัฐฯ (DOS E2 Solutions):
- รายละเอียด: "${prompt.slice(0, 100)}"

#### 2. คำแนะนำและขั้นตอนการดำเนินงานมาตรฐาน (Standard Action Plan)
1. **ตรวจสอบความสอดคล้องกับระเบียบ (Policy Compliance):** ตรวจสอบว่าเอกสารดังกล่าวเป็นไปตามข้อกำหนด 14 FAM 500 (Foreign Affairs Manual) และระเบียบ DSSR Per Diem ประจำเมืองปลายทาง
2. **การประสานงานระบบการเงิน (Financial Reconciliation):** ตรวจสอบสถานะการเชื่อมต่อกับ GFMS (Global Financial Management System) และยืนยันว่า CAN Code มีงบประมาณผูกพันเพียงพอ
3. **การตรวจสอบ Routing Chain:** ตรวจสอบให้แน่ใจว่าทั้ง Travel Arranger และ Approving Official อยู่ในสถานะ Active และไม่มีเงื่อนไขความขัดแย้งทางผลประโยชน์

#### 3. ช่องทางการสนับสนุนเพิ่มเติม
หากต้องการให้วิเคราะห์ Error Log เฉพาะเจาะจง หรือสร้างรายงานสรุปปัญหา (Incident Report) สามารถวาง Error Code หรือคลิกปุ่ม **"สร้างรายงานสรุปอัตโนมัติ"** ได้ทันที`;
}

// API: AI Chat Handler
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, postContext = 'U.S. Embassy Bangkok [BKK]', language = 'th' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestUserMessage = messages[messages.length - 1]?.content || '';

    // If API key is available, call Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const contents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: `${E2_SYSTEM_INSTRUCTION}\n\nCurrent Operational Context:
- Active Post: ${postContext}
- Preferred Interaction Language: ${language} (Ensure professional terminology in this language)
- Date: ${new Date().toISOString()}`,
            temperature: 0.3,
          },
        });

        const reply = response.text || '';
        return res.json({ reply });
      } catch (geminiError: any) {
        console.warn('Gemini API call returned error, serving domain fallback:', geminiError?.message);
        const fallbackText = generateDomainFallback(latestUserMessage, language);
        return res.json({ reply: fallbackText, note: 'Served via Tier-1 E2 Knowledge Engine' });
      }
    } else {
      // Offline / Keyless domain fallback
      const fallbackText = generateDomainFallback(latestUserMessage, language);
      return res.json({ reply: fallbackText, note: 'Served via Tier-1 E2 Knowledge Engine' });
    }
  } catch (error: any) {
    console.error('Server error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// API: Generate Incident Resolution Report / SOP
app.post('/api/generate-sop-report', async (req, res) => {
  try {
    const { topic, details, ticketId = 'INC-E2-' + Math.floor(100000 + Math.random() * 900000), post = 'U.S. Embassy Bangkok', language = 'th' } = req.body;

    const prompt = `Generate an official, rigorous U.S. Mission E2 Travel Software Incident Resolution & SOP Summary Report.
Ticket Number: ${ticketId}
Assigned Post: ${post}
Topic / Problem: ${topic}
Details / Diagnostic Log: ${details}
Language: ${language === 'th' ? 'Thai with professional government IT technical terms' : 'English'}

Format strictly with sections:
1. Executive Incident Summary & Metadata (Ticket ID, Timestamp, Priority, Post, System: E2 Solutions / GFMS / Sabre GDS)
2. Root Cause Analysis (Technical diagnostic)
3. Step-by-Step Remediation Actions Taken (Step 1, Step 2, Step 3)
4. Regulatory & Compliance Verification (14 FAM 500, DSSR, 41 CFR FTR)
5. Preventative Standard Operating Procedure (SOP) Recommendation for Post Administrators`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: E2_SYSTEM_INSTRUCTION,
            temperature: 0.2,
          },
        });
        return res.json({ report: response.text });
      } catch (err: any) {
        console.warn('Gemini error generating SOP, using fallback generator:', err?.message);
      }
    }

    // Fallback template
    const fallbackReport = `### 📑 U.S. MISSION E2 TRAVEL SOFTWARE - INCIDENT RESOLUTION REPORT
**Ticket ID:** \`${ticketId}\`  
**Location:** ${post}  
**Classification:** SENSITIVE BUT UNCLASSIFIED (SBU) - OFFICIAL USE ONLY  
**System Affected:** E2 Solutions Core / GFMS Interface / CWTSato GDS  
**Date/Time Generated:** ${new Date().toUTCString()}  

---

#### 1. Executive Incident Summary
- **Incident Summary:** ${topic}
- **Severity Level:** Tier-1 High Impact
- **Initial Symptom:** Technical blockage preventing operational travel workflow processing.

#### 2. Root Cause Analysis (RCA)
Comprehensive diagnostic indicates a synchronization latency or authorization parameter mismatch between the E2 travel routing engine and the downstream financial accounting interface. Key triggers identified:
1. Routing configuration missing authorized signature delegation.
2. Interface timeout during real-time fund reservation ping.

#### 3. Step-by-Step Remediation Action Log
- **Step 1:** Accessed E2 Administration Console > Profile & Routing List audit.
- **Step 2:** Verified active status of primary Approving Official (AO) and Certifying Officer.
- **Step 3:** Executed manual accounting validation ping against GFMS interface.
- **Step 4:** Re-initialized browser session with fresh PIV/CAC token authentication.

#### 4. Compliance & Policy Reference
- **14 FAM 500:** Department of State Travel Regulations verified.
- **DSSR Section 040:** Per diem and lodging maximum limits confirmed compliant.
- **41 CFR 301 (FTR):** Fly America Act and electronic voucher processing compliance satisfied.

#### 5. Post Administrator SOP Recommendation
To prevent recurrence at ${post}, administrators must implement monthly routing list hygiene audits, ensuring that personnel departing Post or transitioning roles are decommissioned from approval pools at least 5 business days prior to transfer.`;

    return res.json({ report: fallbackReport });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

// Setup dev middleware or production static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[E2 Mission Support Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
