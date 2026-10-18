import { PostInfo, SystemService, Ticket, DiagnosticIssue, SOPDocument } from '../types';

export const mockPosts: PostInfo[] = [
  { code: 'BKK', name: 'U.S. Embassy Bangkok', country: 'Thailand', region: 'EAP', status: 'operational', tz: 'UTC+7', perDiemLodging: 185, perDiemMIE: 110 },
  { code: 'TYO', name: 'U.S. Embassy Tokyo', country: 'Japan', region: 'EAP', status: 'operational', tz: 'UTC+9', perDiemLodging: 230, perDiemMIE: 135 },
  { code: 'NBO', name: 'U.S. Embassy Nairobi', country: 'Kenya', region: 'AF', status: 'degraded', tz: 'UTC+3', perDiemLodging: 195, perDiemMIE: 98 },
  { code: 'LON', name: 'U.S. Embassy London', country: 'United Kingdom', region: 'EUR', status: 'operational', tz: 'UTC+1', perDiemLodging: 290, perDiemMIE: 165 },
  { code: 'BOG', name: 'U.S. Embassy Bogota', country: 'Colombia', region: 'WHA', status: 'operational', tz: 'UTC-5', perDiemLodging: 145, perDiemMIE: 78 },
  { code: 'FRA', name: 'U.S. Consulate Frankfurt', country: 'Germany', region: 'EUR', status: 'operational', tz: 'UTC+2', perDiemLodging: 198, perDiemMIE: 124 },
  { code: 'MNL', name: 'U.S. Embassy Manila', country: 'Philippines', region: 'EAP', status: 'operational', tz: 'UTC+8', perDiemLodging: 165, perDiemMIE: 92 },
  { code: 'PAR', name: 'U.S. Embassy Paris', country: 'France', region: 'EUR', status: 'operational', tz: 'UTC+2', perDiemLodging: 280, perDiemMIE: 155 },
  { code: 'GVA', name: 'U.S. Mission Geneva', country: 'Switzerland', region: 'EUR', status: 'operational', tz: 'UTC+2', perDiemLodging: 340, perDiemMIE: 190 },
  { code: 'DEL', name: 'U.S. Embassy New Delhi', country: 'India', region: 'SCA', status: 'operational', tz: 'UTC+5:30', perDiemLodging: 175, perDiemMIE: 85 },
  { code: 'CAI', name: 'U.S. Embassy Cairo', country: 'Egypt', region: 'NEA', status: 'operational', tz: 'UTC+3', perDiemLodging: 160, perDiemMIE: 82 },
  { code: 'WAS', name: 'Department of State HST Main State', country: 'United States', region: 'WHA', status: 'operational', tz: 'UTC-4', perDiemLodging: 258, perDiemMIE: 79 },
];

export const mockSystemServices: SystemService[] = [
  {
    id: 'e2-core',
    name: 'E2 Solutions Core Web Engine',
    category: 'Travel Application Core',
    status: 'operational',
    uptime: 99.94,
    latencyMs: 142,
    description: 'Main web portal for Travel Authorizations, Approvals, and Expense Reports.',
  },
  {
    id: 'gfms-sync',
    name: 'GFMS Financial Obligation Interface',
    category: 'Financial Ledger Integration',
    status: 'degraded',
    uptime: 99.81,
    latencyMs: 295,
    lastIncident: 'Periodic timeout on CAN validation pings during peak hours (14:00-16:00 UTC)',
    description: 'Bridges E2 accounting strips with Global Financial Management System (GFMS) ledger.',
  },
  {
    id: 'tmc-sabre',
    name: 'CWTSatoTravel GDS Sabre Bridge',
    category: 'TMC & Ticketing Engine',
    status: 'operational',
    uptime: 99.98,
    latencyMs: 110,
    description: 'Automates PNR generation, airfare reservations, and CBA ticket fulfillment.',
  },
  {
    id: 'dssr-feed',
    name: 'DOS DSSR Per Diem Synchronization Feed',
    category: 'Policy & Rate Tables',
    status: 'operational',
    uptime: 100.0,
    latencyMs: 82,
    description: 'Auto-ingests monthly foreign per diem & lodging rates from DSSR Chapter 040.',
  },
  {
    id: 'adfs-sso',
    name: 'State Dept ADFS / PIV-CAC SSO Engine',
    category: 'Identity & Authentication',
    status: 'operational',
    uptime: 99.95,
    latencyMs: 95,
    description: 'Federated identity provider validating PIV digital signature tokens for submission.',
  },
  {
    id: 'nepa-eclass',
    name: 'NEPA / eClass Accounting Code Validator',
    category: 'Budget Validation',
    status: 'operational',
    uptime: 99.89,
    latencyMs: 198,
    description: 'Validates 26-digit fiscal accounting strings against post budget allocations.',
  },
];

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-9042',
    title: 'Error 401: Authorization submission blocked on TA-2026-BKK-09412',
    description: 'Traveler cannot submit urgent TDY travel authorization to Tokyo. System throws "401 Unauthorized / Approval Route Validation Failed" when clicking Submit.',
    post: 'U.S. Embassy Bangkok',
    category: 'TA Submission',
    priority: 'P1-Critical',
    status: 'In Progress',
    assignee: 'IT Specialist / E2 Tier-1',
    slaMinutesRemaining: 24,
    createdAt: '2026-10-17 19:40:12',
    documentRef: 'TA-2026-BKK-09412',
    errorLog: `[ERR-401] AuthSignatureException: Unable to verify routing step 01 (Approving Official: ID_38192). Status=INACTIVE_POST_TRANSFER. Submission aborted.`,
  },
  {
    id: 'TKT-9038',
    title: 'GFMS Sync Error 502: Obligation failed for CAN 190240',
    description: 'Voucher payment stuck in "Pending Financial Interface". GFMS rejected the accounting line with error 502 due to fiscal year code mismatch.',
    post: 'U.S. Embassy Nairobi',
    category: 'GFMS Financial Sync',
    priority: 'P1-Critical',
    status: 'Vendor Escalated',
    assignee: 'CWTSato / Post FMO',
    slaMinutesRemaining: 48,
    createdAt: '2026-10-17 18:15:00',
    documentRef: 'ER-2026-NBO-04198',
    errorLog: `[GFMS-SYNC-502] AccountingInterfaceError: CAN 190240 invalid fiscal strip format for FY26. Expected format: 19-X-1113-190240-2110.`,
  },
  {
    id: 'TKT-9031',
    title: 'User Offboarding request for departing FSO Officer',
    description: 'Departing Political Officer transferring to Post London. Requesting de-provisioning from Post Tokyo routing pools and profile audit for unvouchered travel.',
    post: 'U.S. Embassy Tokyo',
    category: 'User Profile / Routing',
    priority: 'P2-High',
    status: 'New',
    assignee: 'E2 Post Administrator',
    slaMinutesRemaining: 180,
    createdAt: '2026-10-17 17:02:45',
    documentRef: 'USR-TYO-88219',
    errorLog: `Audit: 1 open Travel Advance ($1,200.00) pending voucher reconciliation. Profile deactivation blocked.`,
  },
  {
    id: 'TKT-9027',
    title: 'Fly America Act waiver review for direct British Airways flight',
    description: 'Traveler from London to Frankfurt booked non-US carrier due to direct flight schedule constraints. Travel Arranger requests verification of Open Skies exception eligibility.',
    post: 'U.S. Embassy London',
    category: 'Policy & DSSR',
    priority: 'P3-Normal',
    status: 'In Progress',
    assignee: 'Travel Compliance Analyst',
    slaMinutesRemaining: 320,
    createdAt: '2026-10-17 15:30:10',
    documentRef: 'TA-2026-LON-10029',
  },
  {
    id: 'TKT-9019',
    title: 'Centrally Billed Account (CBA) ticketing decline on GDS Sabre',
    description: 'Post Bogota GSO staff ticketing failed due to temporary merchant authorization threshold on Post CBA card.',
    post: 'U.S. Embassy Bogota',
    category: 'Ticketing & CBA',
    priority: 'P2-High',
    status: 'Awaiting Post',
    assignee: 'Post Financial Officer',
    slaMinutesRemaining: 95,
    createdAt: '2026-10-17 14:10:00',
    documentRef: 'TKT-BOG-9921',
  },
  {
    id: 'TKT-9005',
    title: 'Bangkok Post DSSR Lodging Cap overage reconciliation',
    description: 'Hotel room charge in Bangkok during UN Summit was $230/night, whereas standard DSSR rate is $185. Requires Actual Expense Allowance (AEA) approval in E2.',
    post: 'U.S. Embassy Bangkok',
    category: 'Policy & DSSR',
    priority: 'P3-Normal',
    status: 'Resolved',
    assignee: 'E2 Tier-1 Support',
    slaMinutesRemaining: 0,
    createdAt: '2026-10-17 11:20:00',
    documentRef: 'ER-2026-BKK-08812',
    resolutionNotes: 'Processed Form DS-4043 Actual Expense Allowance endorsement up to 150% of DSSR. Voucher approved and paid.',
  },
];

export const mockDiagnosticIssues: DiagnosticIssue[] = [
  {
    id: 'diag-401',
    title: 'Error 401: Unauthorized / Approval Route Validation Failed',
    category: 'TA Submission',
    commonErrorCode: 'ERR-401 / AuthSignatureException',
    summary: 'Traveler or Arranger cannot submit Travel Authorization (TA). System halts at digital signature or routing verification.',
    symptoms: [
      'Submit button triggers red banner: "401 Unauthorized"',
      'Approval routing list dropdown is grayed out or displays [EMPTY_POOL]',
      'Traveler PIV card certificate prompt does not appear',
    ],
    policyRef: '14 FAM 560 & E2 Admin Guide Chapter 4',
    steps: [
      {
        id: 's1',
        title: 'Step 1: Audit Approving Official (AO) Status',
        description: 'Verify if the Approving Official in the traveler routing chain is active and has valid delegation of authority.',
        actionRequired: 'Go to Admin > User Profiles > Traveler > Routing List. Confirm Tier 1 AO is ACTIVE.',
        resolutionIfFailed: 'Assign an authorized Alternate Approver with active date range.',
      },
      {
        id: 's2',
        title: 'Step 2: Inspect Digital Certificate & Session Token',
        description: 'Ensure the user browser has valid PKI certificates and ADFS token is not expired.',
        actionRequired: 'Instruct traveler to Sign Out, clear browser SSL state/cache, and re-login with PIV/CAC.',
        resolutionIfFailed: 'Re-authenticate via Embassy intranet portal.',
      },
      {
        id: 's3',
        title: 'Step 3: Validate Accounting Line & Fund Cite',
        description: 'Check if the fiscal year accounting strip was verified by the financial bridge.',
        actionRequired: 'Open TA > Accounting Tab > Click "Validate Accounting Codes" button.',
        resolutionIfFailed: 'Correct CAN or fiscal code with Post FMO budget analyst.',
      },
      {
        id: 's4',
        title: 'Step 4: Re-Submit Document',
        description: 'Re-apply digital signature and send document into routing chain.',
        actionRequired: 'Click "Sign and Submit" and observe confirmation number.',
        resolutionIfFailed: 'Escalate to Tier-2 CWTSato vendor desk with Document ID.',
      },
    ],
  },
  {
    id: 'diag-502',
    title: 'Error 502: GFMS Financial Sync & Obligation Mismatch',
    category: 'GFMS Financial Sync',
    commonErrorCode: 'ERR-502 / GFMS-INTERFACE-TIMEOUT',
    summary: 'Expense Report or TA de-obligation rejected by Department of State financial management system.',
    symptoms: [
      'Document status displays "Financial Interface Error"',
      'Traveler voucher reimbursement payment not initiated',
      'CAN budget balance shows insufficient obligated balance',
    ],
    policyRef: '14 FAM 530 & Department of State Financial Operations Manual',
    steps: [
      {
        id: 'gf1',
        title: 'Step 1: Check Accounting Strip Format',
        description: 'Verify the 26-digit string structure against current Fiscal Year parameters.',
        actionRequired: 'Compare string against post chart of accounts: Bureau-Post-CAN-Object Code.',
        resolutionIfFailed: 'Update line item with active FY allocation.',
      },
      {
        id: 'gf2',
        title: 'Step 2: Check GFMS Core Availability',
        description: 'Verify whether GFMS nightly batch processing or maintenance window is currently active.',
        actionRequired: 'Inspect System Uptime Monitor for GFMS API interface status.',
        resolutionIfFailed: 'Wait for nightly interface cycle to complete (approx 02:00 UTC).',
      },
      {
        id: 'gf3',
        title: 'Step 3: Force Manual Financial Re-Sync',
        description: 'Administrator re-triggers interface queue push from E2 admin queue.',
        actionRequired: 'Navigate to Admin > Interface Monitor > Select Document > Re-queue Sync.',
        resolutionIfFailed: 'Escalate to Post FMO and DOS Charleston Financial Center.',
      },
    ],
  },
  {
    id: 'diag-fly-america',
    title: 'Fly America Act Compliance & Open Skies Exception Verification',
    category: 'Policy & DSSR',
    commonErrorCode: 'POLICY-FAA-EXCEPTION',
    summary: 'Review and approve foreign flag carrier itineraries under Open Skies bilateral treaties or necessity exceptions.',
    symptoms: [
      'E2 pre-audit throws warning: "Non-US Carrier detected on international leg"',
      'Arranger cannot issue tickets on CBA account without waiver justification',
    ],
    policyRef: '41 CFR 301-10.131 through 301-10.143 & 14 FAM 583',
    steps: [
      {
        id: 'fa1',
        title: 'Step 1: Verify Open Skies Agreement Eligibility',
        description: 'Check if origin/destination involves EU, Australia, Switzerland, or Japan covered under bilateral Open Skies.',
        actionRequired: 'Verify point of origin and carrier nationality on travel itinerary.',
        resolutionIfFailed: 'If city-pair contract carrier exists, US flag carrier MUST be selected.',
      },
      {
        id: 'fa2',
        title: 'Step 2: Check Code-Share US Flag Flight Number',
        description: 'Ensure foreign-operated flight has US airline code-share designator (e.g., UA operated by ANA).',
        actionRequired: 'Verify ticket shows US airline designator code on the boarding pass/e-ticket.',
        resolutionIfFailed: 'Re-book via CWTSato SatoTravel with official code-share number.',
      },
      {
        id: 'fa3',
        title: 'Step 3: Attach Justification Form DS-XXXX to TA',
        description: 'Attach certified Fly America Act exception justification form signed by Approving Official.',
        actionRequired: 'Upload signed justification to E2 TA Attachments tab.',
        resolutionIfFailed: 'Obtain Supervisory Executive Office endorsement.',
      },
    ],
  },
];

export const mockSops: SOPDocument[] = [
  {
    id: 'sop-01',
    code: 'SOP-E2-ADM-042',
    title: 'User Profile Onboarding & Offboarding Lifecycle Management',
    category: 'User Administration',
    complianceRef: '14 FAM 510 & FTR §301-70.100',
    content: `### SOP-E2-ADM-042: User Profile Onboarding & Offboarding Lifecycle

#### 1. Purpose
Defines standard operating procedures for provisioning, maintaining, and decommissioning user credentials and routing permissions in E2 Solutions for U.S. Mission personnel.

#### 2. Onboarding Workflow
1. Verify DS-3064 authorization form signed by Section Head.
2. Cross-reference Employee ID with GEMS / Global HR database.
3. Access E2 Administrator Console > User Profiles > Create New.
4. Set legal name strictly matching Diplomatic/Official Passport.
5. Map Post default routing chain and link Government Travel Charge Card (IBA) or Centrally Billed Account (CBA).

#### 3. Offboarding Workflow
1. Run "Unliquidated Travel Authorizations" and "Open Expense Reports" report.
2. Confirm all travel advances are $0.00 reconciled.
3. Reassign active routing steps to replacement officer.
4. Switch profile status to INACTIVE. Archive audit record.`,
  },
  {
    id: 'sop-02',
    code: 'SOP-E2-FIN-109',
    title: 'GFMS Financial Sync & De-obligation Standard Procedure',
    category: 'Financial Operations',
    complianceRef: '14 FAM 530 & Department of State Financial Guide',
    content: `### SOP-E2-FIN-109: GFMS Financial Sync & Fiscal Deobligation

#### 1. Scope
Applies to all Financial Management Officers (FMO) and E2 Administrators managing accounting synchronization failures between E2 Solutions and the Global Financial Management System (GFMS).

#### 2. Troubleshooting Steps
1. Identify sync error code in the E2 Interface Monitor.
2. For Error 502: Validate fund code format (CAN, Sub-Object, Fiscal Year).
3. If fiscal year rollover occurs, verify that prior year deobligations have been posted in GFMS before amending the TA.
4. Execute manual push through the E2 Batch Interface.`,
  },
  {
    id: 'sop-03',
    code: 'SOP-E2-TRV-201',
    title: 'DSSR Per Diem Rate Compliance & Actual Expense Allowance (AEA)',
    category: 'Travel & Per Diem',
    complianceRef: 'DSSR Chapter 040 & 14 FAM 567',
    content: `### SOP-E2-TRV-201: DSSR Per Diem Calculation & AEA Justifications

#### 1. General Rule
Travelers must receive standard DSSR per diem consisting of:
- Maximum Lodging Allowance (reimbursed on actual cost up to cap)
- Meals and Incidentals (M&IE) flat rate
- 75% proration rule applied strictly on first and last travel calendar days.

#### 2. Actual Expense Allowance (AEA)
When lodging exceeds DSSR cap due to high-level diplomatic summits or lack of government rate hotel rooms:
- Up to 150% of DSSR cap requires Post Management Officer / Executive Director approval.
- Over 150% up to 300% requires Under Secretary for Management (M) approval.
- Approved Form DS-4043 must be attached to the TA before travel commencement.`,
  },
];
