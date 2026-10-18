import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Security: Restrict JSON payload size to 100kb to prevent payload inflation & memory exhaustion
app.use(express.json({ limit: '100kb' }));

// Security: Attach unique Request ID & tracking header
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  (req as any).id = reqId;
  res.setHeader('X-Request-Id', reqId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Security: In-Memory Sliding Window Rate Limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function createRateLimiter(windowMs: number = 60000, maxRequests: number = 40) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again shortly.',
        code: 'RATE_LIMIT_EXCEEDED',
        requestId: (req as any).id,
      });
    }

    record.count += 1;
    next();
  };
}

// Apply rate limiter to API routes (40 requests per minute)
app.use('/api', createRateLimiter(60000, 40));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const E2_SYSTEM_INSTRUCTION = `You are a Senior IT Operations Support Specialist for "E2 Travel Software" (E2 Solutions by CWTSatoTravel) supporting the U.S. Department of State (DOS) and global U.S. Missions (over 200 posts worldwide).

CRITICAL COMPLIANCE & TRANSPARENCY GUIDELINES:
1. Role & Identity: Provide structured, authoritative technical and procedural guidance for IT analysts, travel administrators, and embassy personnel.
2. Factuality & Anti-Hallucination:
   - When diagnosing issues, clearly distinguish between "Hypothesized Root Causes" (สาเหตุที่พบบ่อยตามประวัติระบบ) and "Confirmed Evidence" (ข้อเท็จจริงที่ต้องตรวจในระบบ).
   - Never claim to have queried a live classified or production government database (such as live GFMS, ADFS, or post travel records) since you are an AI advisory assistant.
   - Always state that administrative actions must be verified within the official E2 Solutions console and authorized by Post FMO or Certifying Officers.
3. Domain Knowledge Base:
   - Travel Authorizations (TA): Routine TDY, PCS, Post Travel Authorizations (PTA), amendments, deobligations.
   - Expense Reports (ER / Travel Vouchers): Lodging + M&IE per diem, DSSR Section 040 rates, 75% first and last day rule.
   - Ticketing & TMC Integration: CWTSatoTravel GDS Sabre feeds, Centrally Billed Accounts (CBA) vs Individually Billed Accounts (IBA), Fly America Act compliance and Open Skies exceptions.
   - Financial System: GFMS accounting strips, CAN numbers, NEPA/eClass validation.
   - Regulations: U.S. Federal Travel Regulation (FTR - 41 CFR), DSSR Chapter 100/200, Foreign Affairs Manual (14 FAM 500).
4. Response Format:
   - Section 1: [Incident Assessment & Hypothesized Root Causes]
   - Section 2: [Step-by-Step Diagnostic Verification Checklist (Step 1, Step 2, ...)]
   - Section 3: [Remediation & Administrative Actions]
   - Section 4: [Regulatory Compliance & Policy Standards (14 FAM, DSSR, FTR)]
   - Section 5: [Verification Warning & Post Escalation Path]
5. Multilingual Support:
   - When queried in Thai (ภาษาไทย), respond in fluent, highly professional technical government/IT terminology.`;

// Transparent Fallback Engine (Explicitly tagged as reference guidance, not confirmed live telemetry)
export function generateDomainFallback(prompt: string, language: string = 'th', postContext: string = 'U.S. Embassy Bangkok') {
  const isThai = language === 'th' || /[ก-๙]/.test(prompt);

  if (/401|ส่งไม่ได้|submit|authorization|ta/i.test(prompt)) {
    if (isThai) {
      return `### 📋 แนวทางวิเคราะห์ข้อผิดพลาด: Error 401 ขณะกดส่ง Travel Authorization (TA)

> **⚠️ ประกาศความโปร่งใส (Transparency Notice):** ข้อมูลนี้เป็น **แนวทางมาตรฐานจากฐานความรู้ E2 Solutions (Simulated Reference)** ระบบยังไม่ได้เชื่อมต่อกับฐานข้อมูลสดของ Post ณ ขณะนี้ ผู้ดูแลระบบต้องนำขั้นตอนด้านล่างไปตรวจสอบในคอนโซล E2 จริง

---

#### 1. สาเหตุที่เป็นไปได้ตามสถิติของระบบ (Hypothesized Root Causes)
1. **Routing Chain ขาด Approving Official (AO) ที่พร้อมใช้งาน:** สายการอนุมัติของผู้เดินทางอาจมีผู้อนุมัติที่ย้าย Post, ลาพักผ่อน, หรือสิทธิ์การอนุมัติในระบบสิ้นอายุ
2. **Session หรือ PIV/CAC Certificate สิ้นอายุ:** โทเค็นการยืนยันตัวตนดิจิทัลสำหรับลงนามอิเล็กทรอนิกส์ (Digital Signature) หลุดการเชื่อมโยงกับระบบ ADFS/Single Sign-On
3. **Accounting Line ยังไม่ผ่านการตรวจสอบ:** รหัสงบประมาณ (Fund Citation) ในแท็บ Accounting ยังไม่ได้รับการตรวจสอบความถูกต้อง (Validate) กับตารางงบประมาณประจำปีงบประมาณปัจจุบัน

---

#### 2. ขั้นตอนการตรวจสอบทีละขั้น (Step-by-Step Diagnostic Verification)
* **Step 1: ตรวจสอบสายการอนุมัติ (Routing List)**
  * เข้าไปที่ **Admin > User Profiles > ค้นหาชื่อผู้เดินทาง > แท็บ Routing Lists**
  * ตรวจสอบว่าผู้อนุมัติระดับ Tier 1 (Supervisor/AO) และ Tier 2 (FMO/Certifying Officer) มีสถานะเป็น **Active** และมีการกำหนดสิทธิ์สำหรับ Post ปัจจุบัน
  * หาก AO ตัวจริงไม่อยู่ ให้กำหนด **Alternate Approver** ที่มีอำนาจลงนามแทน

* **Step 2: รีเฟรช Browser Session และ Digital Signature**
  * ให้ผู้ใช้งานออกจากระบบ E2 (Sign Out)
  * เคลียร์ SSL State/Browser Cache หรือเปิดหน้าต่างเบราว์เซอร์ใหม่
  * ใส่บัตร PIV/CAC เพื่อยืนยันตัวตนใหม่ก่อนกดลงนามและส่งเอกสาร

* **Step 3: ตรวจสอบแถบ Accounting Strip**
  * เปิดเอกสาร TA ที่ติดปัญหา > ไปที่แท็บ **Accounting**
  * กดปุ่ม **"Validate Accounting Codes"** เพื่อทดสอบการเชื่อมโยงกับฐานงบประมาณ
  * หากมีแจ้งเตือนสีแดงเกี่ยวกับ CAN Code ให้ประสานเจ้าหน้าที่การเงินประจำ Post (Post FMO)

---

#### 3. การอ้างอิงระเบียบและการส่งต่อ (Policy Reference & Escalation)
- **มาตรฐานระเบียบ:** 14 FAM 560 (Travel Authorizations) และ Federal Travel Regulation (FTR) §301-70
- **หากตรวจสอบทั้ง 3 ขั้นตอนแล้วยังพบปัญหา:** ให้เปิด Ticket ส่งต่อไปยัง **CWTSato Global Helpdesk (Tier-2)** พร้อมแนบ TA Document ID, Traveler SEID และเวลาที่เกิดข้อผิดพลาด`;
    } else {
      return `### 📋 Diagnostic Guidance: Error 401 Submitting Travel Authorization (TA)

> **⚠️ Transparency Notice:** This response is generated from the **E2 Solutions Reference Knowledge Base (Simulated)**. Live embassy user records or production financial databases were not queried. Administrative verification is required before making changes.

---

#### 1. Hypothesized Root Causes
1. **Invalid or Inactive Approving Official (AO):** The traveler's designated routing chain references a supervisor who has departed Post, is on leave, or lacks active signature delegation.
2. **Expired PIV/CAC Session Token:** The digital signing session failed PKI certificate validation with the agency federated authentication provider (ADFS).
3. **Unvalidated Accounting Line:** The fiscal year funding string has not been validated against the chart of accounts.

---

#### 2. Step-by-Step Verification Checklist
* **Step 1: Audit Routing Chain Assignment**
  * In E2 Admin, navigate to **User Profiles > [Traveler Name] > Routing Lists**.
  * Confirm that both Level 1 (Approving Official) and Level 2 (Certifying Officer) show **ACTIVE** status.
  * If the primary approver is unavailable, assign a designated **Alternate Approver** with effective dates.

* **Step 2: Refresh Authentication State**
  * Direct traveler to log out of E2, clear browser SSL cache, re-insert PIV card, and initiate a fresh authenticated session.

* **Step 3: Validate Accounting Strip**
  * Open the pending TA > Navigate to the **Accounting** tab > Click **"Validate Accounting Codes"**.
  * Ensure all CAN codes and fiscal year allocations clear validation.

---

#### 3. Regulatory Standards & Escalation
- **Compliance Standard:** 14 FAM 560 & FTR §301-70
- **Escalation Protocol:** If unresolvable locally, escalate to Tier-2 CWTSato Vendor Helpdesk with the TA Document Number and timestamp.`;
    }
  }

  if (/onboard|offboard|user|แอดมิน|admin|profile/i.test(prompt)) {
    if (isThai) {
      return `### 📋 แนวทางปฏิบัติมาตรฐาน (Reference SOP): User Onboarding & Offboarding ในระบบ E2 Travel

> **⚠️ ประกาศความโปร่งใส:** เอกสารนี้จัดทำขึ้นตามแนวทาง 14 FAM 510 และมาตรฐานคู่มือ E2 Administrator เพื่อใช้เป็นแบบร่างอ้างอิงการปฏิบัติงานประจำ Post

---

#### ส่วนที่ 1: ขั้นตอน User Onboarding (การรับเจ้าหน้าที่เข้าใหม่ในระบบ)
1. **ตรวจสอบเอกสารและสิทธิ์ (HR / Authorization Verification):**
   - ตรวจสอบแบบฟอร์มขอสิทธิ์ใช้งานที่ลงนามโดยหัวหน้าหน่วยงาน (Section Head)
   - ยืนยันรหัสประจำตัวพนักงาน (SEID/Employee ID) และ Post Code ประจำสถานทูต
2. **สร้างโปรไฟล์ในระบบ E2 Administrator:**
   - เข้า **Admin > User Profiles > Create New Profile**
   - กรอกชื่อ-นามสกุลตามหนังสือเดินทางราชการ (Diplomatic/Official Passport) อย่างเคร่งครัด
   - กำหนด Official Email (\`@state.gov\`)
   - เลือก Role ตามหน้าที่: \`Traveler\`, \`Travel Arranger\`, \`Approving Official (AO)\`, หรือ \`Certifying Officer\`
3. **ผูกบัญชีการชำระเงินและ Routing Template:**
   - ผูกบัตรเครดิตราชการส่วนบุคคล (IBA) หรือกำหนดให้ใช้บัญชีส่วนกลาง (CBA) สำหรับตั๋วเครื่องบิน
   - กำหนด Default Routing Chain ประจำหน่วยงาน

---

#### ส่วนที่ 2: ขั้นตอน User Offboarding (การจำหน่ายเจ้าหน้าที่ออกจากระบบ / ย้าย Post)
1. **ตรวจสอบภาระผูกพันคงค้าง (Outstanding Travel Audit):**
   - ตรวจสอบว่าไม่มี Travel Authorizations (TA) ที่ค้างการอนุมัติหรือยังไม่ได้ทำ Voucher
   - ยืนยันว่าไม่มีเงินทดรองจ่าย (Travel Advance) คงค้าง ยอดเงินต้องเป็น **$0.00**
2. **โอนย้ายเอกสารและสายการอนุมัติ (Reassignment of Pending Workflows):**
   - ปรับสายการอนุมัติให้เอกสารของผู้เดินทางท่านอื่นไม่ติดค้างอยู่ที่เจ้าหน้าที่ที่กำลังจะย้าย Post
3. **ปรับสถานะโปรไฟล์ (Profile Deactivation):**
   - เปลี่ยนสถานะโปรไฟล์เป็น **"INACTIVE / SEPARATED"**
   - ถอนสิทธิ์ Digital Signature และเก็บ Audit Record สำหรับการตรวจสอบย้อนหลัง`;
    } else {
      return `### 📋 Reference Operating Procedure: User Onboarding & Offboarding Lifecycle

> **⚠️ Transparency Notice:** This procedural guideline is based on 14 FAM 510 and E2 Solutions standard administration manuals for mission operational reference.

---

#### Part 1: User Onboarding Workflow
1. **Authorization Verification:** Obtain supervisor-approved access request form with verified Employee ID (SEID) and Post bureau assignment.
2. **Profile Generation:**
   - Access **Admin > User Profiles > Create Profile**.
   - Input legal name matching official passport.
   - Assign appropriate roles: \`Traveler\`, \`Travel Arranger\`, \`Approving Official\`, or \`Certifying Officer\`.
3. **Card & Billing Configuration:**
   - Map Government Travel Charge Card (IBA) or configure Centrally Billed Account (CBA) default.
   - Assign Post default routing template.

---

#### Part 2: User Offboarding Workflow
1. **Outstanding Account Audit:** Verify that all Travel Authorizations are voucherized and all Travel Advances show a reconciled $0.00 balance.
2. **Workflow Reassignment:** Remove user from active routing pools and reassign any pending document queues.
3. **Account Deactivation:** Set status to \`INACTIVE\`, revoke digital signature privileges, and log audit trail.`;
    }
  }

  // General helpful domain fallback
  return `### 🛡️ E2 Travel Solutions Support Specialist Response

> **⚠️ Operational Notice:** Operating in **Procedural Reference Mode**. Guidance is formulated based on Department of State travel regulations (14 FAM 500, DSSR 040, and 41 CFR FTR). Live agency databases were not queried.

---

#### 1. Incident Assessment
- **Post Context:** ${postContext}
- **Inquiry Focus:** ${prompt.slice(0, 120)}...

#### 2. Recommended Action Plan
1. **Compliance Check (14 FAM 500):** Verify whether the document complies with standard mission travel policies, including appropriate per diem caps and advance authorization requirements.
2. **Financial Coordination (GFMS):** Coordinate with the Post Financial Management Officer (FMO) if accounting strip validation fails.
3. **Administrative Routing Check:** Verify that both the Arranger and Approving Official are active in the traveler's routing pool.

#### 3. Next Steps
To generate an official summary for escalation or local record, click the **"Auto-Generate Incident Resolution Report"** button above.`;
}

// Input Validation Helper for Chat
export function validateChatInput(body: any): { valid: boolean; error?: string; data?: { messages: any[]; postContext: string; language: string } } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  const { messages, postContext = 'U.S. Embassy Bangkok [BKK]', language = 'th' } = body;

  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'Field "messages" must be an array' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'Field "messages" cannot be empty' };
  }

  if (messages.length > 20) {
    return { valid: false, error: 'Conversation history exceeds maximum allowed limit (20 messages)' };
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `Message at index ${i} must be an object` };
    }

    if (msg.role !== 'user' && msg.role !== 'model') {
      return { valid: false, error: `Invalid role "${msg.role}" at message ${i}. Must be "user" or "model"` };
    }

    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      return { valid: false, error: `Message content at index ${i} must be a non-empty string` };
    }

    if (msg.content.length > 4000) {
      return { valid: false, error: `Message content at index ${i} exceeds maximum allowed length of 4000 characters` };
    }
  }

  const validLangs = ['th', 'en', 'es', 'fr'];
  const sanitizedLang = validLangs.includes(String(language).toLowerCase()) ? String(language).toLowerCase() : 'th';
  const sanitizedPostContext = String(postContext).slice(0, 100).replace(/[^\w\s\-\.\[\],]/gi, '');

  return {
    valid: true,
    data: {
      messages,
      postContext: sanitizedPostContext,
      language: sanitizedLang,
    },
  };
}

// Input Validation Helper for SOP Report
export function validateSopInput(body: any): { valid: boolean; error?: string; data?: { topic: string; details: string; ticketId: string; post: string; language: string } } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { topic, details, ticketId, post, language = 'th' } = body;

  if (typeof topic !== 'string' || topic.trim().length === 0) {
    return { valid: false, error: 'Field "topic" is required and must be a non-empty string' };
  }
  if (topic.length > 200) {
    return { valid: false, error: 'Field "topic" cannot exceed 200 characters' };
  }

  if (typeof details !== 'string' || details.trim().length === 0) {
    return { valid: false, error: 'Field "details" is required and must be a non-empty string' };
  }
  if (details.length > 4000) {
    return { valid: false, error: 'Field "details" cannot exceed 4000 characters' };
  }

  const sanitizedTicketId = ticketId && typeof ticketId === 'string'
    ? ticketId.slice(0, 30).replace(/[^a-zA-Z0-9\-_]/g, '')
    : 'INC-E2-' + Math.floor(100000 + Math.random() * 900000);

  const sanitizedPost = post && typeof post === 'string'
    ? post.slice(0, 100).replace(/[^\w\s\-\.,]/g, '')
    : 'U.S. Embassy Bangkok';

  const validLangs = ['th', 'en', 'es', 'fr'];
  const sanitizedLang = validLangs.includes(String(language).toLowerCase()) ? String(language).toLowerCase() : 'th';

  return {
    valid: true,
    data: {
      topic: topic.trim().slice(0, 200),
      details: details.trim().slice(0, 4000),
      ticketId: sanitizedTicketId,
      post: sanitizedPost,
      language: sanitizedLang,
    },
  };
}

// API: AI Chat Handler
app.post('/api/chat', async (req: Request, res: Response) => {
  const reqId = (req as any).id;

  const validation = validateChatInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({
      error: validation.error || 'Invalid request payload',
      code: 'VALIDATION_ERROR',
      requestId: reqId,
    });
  }

  const { messages, postContext, language } = validation.data;
  const latestUserMessage = messages[messages.length - 1]?.content || '';

  // If API key is available, call Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const contents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: `${E2_SYSTEM_INSTRUCTION}\n\nCurrent Operational Context:
- Active Mission Post: ${postContext}
- Preferred Interaction Language: ${language}
- Timestamp: ${new Date().toISOString()}`,
          temperature: 0.25,
        },
      });

      const reply = response.text || '';
      return res.json({
        reply,
        metadata: {
          source: 'ai_live',
          model: GEMINI_MODEL,
          isVerified: false,
          isSimulated: true,
          confidence: 'advisory',
          disclaimer: 'Generated by AI advisory assistant based on 14 FAM & DSSR regulations. Administrative actions require verification in production E2 Solutions.',
          policyReferences: ['14 FAM 500', 'DSSR Chapter 040', '41 CFR 301 (FTR)'],
          requestId: reqId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (geminiError: any) {
      console.warn(`[${reqId}] Gemini API call returned error, serving domain fallback:`, geminiError?.message || geminiError);
      const fallbackText = generateDomainFallback(latestUserMessage, language, postContext);
      return res.json({
        reply: fallbackText,
        metadata: {
          source: 'knowledge_base_fallback',
          model: 'e2-reference-engine-offline',
          isVerified: false,
          isSimulated: true,
          confidence: 'simulated',
          disclaimer: 'Served from offline reference knowledge repository due to live API latency. Please review steps in the official E2 Administration Console.',
          policyReferences: ['14 FAM 560', 'DSSR Chapter 040', 'FTR §301-70'],
          requestId: reqId,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } else {
    // Keyless reference knowledge engine fallback
    const fallbackText = generateDomainFallback(latestUserMessage, language, postContext);
    return res.json({
      reply: fallbackText,
      metadata: {
        source: 'knowledge_base_fallback',
        model: 'e2-reference-engine-offline',
        isVerified: false,
        isSimulated: true,
        confidence: 'simulated',
        disclaimer: 'Served from offline reference knowledge repository (No API key attached). Please review steps in the official E2 Administration Console.',
        policyReferences: ['14 FAM 560', 'DSSR Chapter 040', 'FTR §301-70'],
        requestId: reqId,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// API: Generate Incident Resolution Report / SOP
app.post('/api/generate-sop-report', async (req: Request, res: Response) => {
  const reqId = (req as any).id;

  const validation = validateSopInput(req.body);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({
      error: validation.error || 'Invalid request payload',
      code: 'VALIDATION_ERROR',
      requestId: reqId,
    });
  }

  const { topic, details, ticketId, post, language } = validation.data;

  const prompt = `Generate an official U.S. Mission E2 Travel Software Incident Resolution & SOP Summary Report.
Ticket Number: ${ticketId}
Assigned Post: ${post}
Topic / Incident: ${topic}
Diagnostic Log / Notes: ${details}
Language: ${language === 'th' ? 'Thai with professional government IT technical terms' : 'English'}

Format strictly with sections:
1. Executive Incident Summary & Metadata (Ticket ID, Timestamp, Priority, Post, System: E2 Solutions / GFMS / Sabre GDS)
2. Hypothesized Root Cause Analysis (Technical diagnostic)
3. Step-by-Step Remediation Actions Recommended (Step 1, Step 2, Step 3)
4. Regulatory & Compliance Verification (14 FAM 500, DSSR, 41 CFR FTR)
5. Preventative Standard Operating Procedure (SOP) Recommendation for Post Administrators
6. Verification Disclaimer (Emphasizing that changes must be approved by authorized FMO/AO personnel)`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: E2_SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
      });

      return res.json({
        report: response.text,
        metadata: {
          source: 'ai_live',
          model: GEMINI_MODEL,
          requestId: reqId,
        },
      });
    } catch (err: any) {
      console.warn(`[${reqId}] Gemini error generating SOP, using fallback generator:`, err?.message || err);
    }
  }

  // Standardized Reference Template Fallback
  const fallbackReport = `### 📑 U.S. MISSION E2 TRAVEL SOFTWARE - INCIDENT RESOLUTION REPORT (REFERENCE)
**Ticket ID:** \`${ticketId}\`  
**Location:** ${post}  
**Classification:** UNCLASSIFIED // SIMULATION SANDBOX  
**System Affected:** E2 Solutions Core / GFMS Interface / CWTSato GDS  
**Date/Time Generated:** ${new Date().toUTCString()}  
**Notice:** [DEMO / SIMULATED DATA] Generated from procedural reference repository. Official determinations require manual verification by Post FMO.

---

#### 1. Executive Incident Summary
- **Incident Summary:** ${topic}
- **Severity Level:** Tier-1 High Impact
- **Initial Symptom:** Technical blockage preventing operational travel workflow processing.

#### 2. Root Cause Analysis (RCA)
Diagnostic assessment indicates a synchronization or authorization parameter mismatch between the E2 travel routing engine and the downstream financial accounting interface. Key triggers identified:
1. Routing configuration missing authorized signature delegation.
2. Interface timeout during fund reservation validation ping.

#### 3. Step-by-Step Remediation Action Checklist
- **Step 1:** Access E2 Administration Console > User Profile & Routing List audit.
- **Step 2:** Verify active status of primary Approving Official (AO) and Certifying Officer.
- **Step 3:** Execute manual accounting validation ping against GFMS interface.
- **Step 4:** Re-initialize browser session with fresh PIV/CAC token authentication.

#### 4. Compliance & Policy Reference
- **14 FAM 500:** [SIMULATED] Department of State Travel Regulations reference guidelines apply.
- **DSSR Section 040:** [SIMULATED] Per diem and lodging maximum limits pending official FMO verification.
- **41 CFR 301 (FTR):** [SIMULATED] Fly America Act and electronic voucher processing general principles.

#### 5. Post Administrator SOP Recommendation
To prevent recurrence at ${post}, administrators must implement monthly routing list hygiene audits, ensuring that personnel departing Post or transitioning roles are decommissioned from approval pools at least 5 business days prior to transfer.`;

  return res.json({
    report: fallbackReport,
    metadata: {
      source: 'knowledge_base_fallback',
      model: 'e2-reference-engine-offline',
      requestId: reqId,
    },
  });
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

    if (!process.env.GEMINI_API_KEY) {
    console.warn('[WARNING] GEMINI_API_KEY not found. Running in OFFLINE Knowledge Base mode.');
  } else {
    console.log('[INFO] Gemini AI connected successfully.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[E2 Mission Support Server] listening on http://0.0.0.0:${PORT} (Model: ${GEMINI_MODEL})`);
  });
}

// Only start the server when run directly (not during unit tests)
const isTestRunner = process.env.NODE_ENV === 'test' || process.argv.some((arg) => arg.includes('test'));
if (!isTestRunner) {
  startServer();
}



