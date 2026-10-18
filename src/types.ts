export type Language = 'en' | 'th' | 'es' | 'fr';

export interface PostInfo {
  code: string;
  name: string;
  country: string;
  region: 'EAP' | 'EUR' | 'AF' | 'WHA' | 'NEA' | 'SCA';
  status: 'operational' | 'degraded' | 'maintenance';
  tz: string;
  perDiemLodging: number;
  perDiemMIE: number;
}

export interface SystemService {
  id: string;
  name: string;
  category: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: number; // e.g. 99.94
  latencyMs: number;
  lastIncident?: string;
  description: string;
}

export type TicketPriority = 'P1-Critical' | 'P2-High' | 'P3-Normal' | 'P4-Low';
export type TicketStatus = 'New' | 'In Progress' | 'Awaiting Post' | 'Vendor Escalated' | 'Resolved';
export type TicketCategory = 'TA Submission' | 'Expense Report (Voucher)' | 'GFMS Financial Sync' | 'User Profile / Routing' | 'Ticketing & CBA' | 'Policy & DSSR';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  post: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  slaMinutesRemaining: number;
  createdAt: string;
  documentRef?: string;
  errorLog?: string;
  resolutionNotes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  ticketRef?: string;
  suggestedActions?: string[];
}

export interface DiagnosticStep {
  id: string;
  title: string;
  description: string;
  actionRequired: string;
  resolutionIfFailed: string;
}

export interface DiagnosticIssue {
  id: string;
  title: string;
  category: TicketCategory;
  commonErrorCode: string;
  summary: string;
  symptoms: string[];
  steps: DiagnosticStep[];
  policyRef: string;
}

export interface SOPDocument {
  id: string;
  title: string;
  code: string;
  category: string;
  complianceRef: string;
  content: string;
}
