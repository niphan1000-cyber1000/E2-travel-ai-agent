import React, { useState } from 'react';
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  CheckCircle,
  FileText,
  Building,
  User,
  ShieldAlert
} from 'lucide-react';
import { Language, Ticket, TicketCategory, TicketPriority, TicketStatus } from '../types';
import { translations } from '../translations';
import { mockTickets, mockPosts } from '../data/mockData';

interface TicketQueueProps {
  currentLang: Language;
  onAnalyzeWithAi: (ticket: Ticket) => void;
  onOpenSopModal: (title: string, content: string) => void;
}

export const TicketQueue: React.FC<TicketQueueProps> = ({
  currentLang,
  onAnalyzeWithAi,
  onOpenSopModal,
}) => {
  const t = translations[currentLang];
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<Ticket | null>(null);

  // New ticket modal state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPost, setNewPost] = useState(mockPosts[0].name);
  const [newCategory, setNewCategory] = useState<TicketCategory>('TA Submission');
  const [newPriority, setNewPriority] = useState<TicketPriority>('P1-Critical');
  const [newDesc, setNewDesc] = useState('');
  const [newErrorLog, setNewErrorLog] = useState('');

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.post.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.documentRef && ticket.documentRef.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || ticket.category === selectedCategory;
    const matchesPriority = selectedPriority === 'ALL' || ticket.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || ticket.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Ticket = {
      id: 'TKT-' + Math.floor(9100 + Math.random() * 899),
      title: newTitle,
      post: newPost,
      category: newCategory,
      priority: newPriority,
      status: 'New',
      description: newDesc || 'User reported issue in E2 Solutions travel workflow.',
      errorLog: newErrorLog.trim() || undefined,
      assignee: 'E2 Tier-1 Support Desk',
      slaMinutesRemaining: newPriority === 'P1-Critical' ? 60 : 240,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setTickets([created, ...tickets]);
    setIsNewTicketOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewErrorLog('');
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'P1-Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60 font-bold';
      case 'P2-High':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60 font-semibold';
      case 'P3-Normal':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60 font-medium';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'New':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'In Progress':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
      case 'Vendor Escalated':
        return 'bg-orange-950/80 text-orange-300 border-orange-700/60';
      case 'Awaiting Post':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'Resolved':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-lg bg-blue-900/40 text-blue-400 border border-blue-700/40">
              <TicketIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{t.ticketsTitle}</h2>
                <span className="text-[10px] font-mono uppercase bg-amber-950 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded font-semibold">
                  Simulated Scenarios
                </span>
              </div>
              <p className="text-xs text-slate-400">{t.ticketsDesc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-2 rounded-lg font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newTicketBtn}</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticket ID, Post, or summary..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="TA Submission">TA Submission</option>
            <option value="Expense Report (Voucher)">Expense Report (Voucher)</option>
            <option value="GFMS Financial Sync">GFMS Financial Sync</option>
            <option value="User Profile / Routing">User Profile / Routing</option>
            <option value="Ticketing & CBA">Ticketing &amp; CBA</option>
            <option value="Policy & DSSR">Policy &amp; DSSR</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1-Critical">P1 - Critical (SLA &lt; 1hr)</option>
            <option value="P2-High">P2 - High</option>
            <option value="P3-Normal">P3 - Normal</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting Post">Awaiting Post</option>
            <option value="Vendor Escalated">Vendor Escalated (CWTSato)</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">{t.ticketId}</th>
                <th className="px-4 py-3">{t.ticketTitle}</th>
                <th className="px-4 py-3 hidden md:table-cell">{t.postCol}</th>
                <th className="px-4 py-3 hidden sm:table-cell">{t.priorityCol}</th>
                <th className="px-4 py-3">{t.statusCol}</th>
                <th className="px-4 py-3 hidden lg:table-cell">{t.slaRemaining}</th>
                <th className="px-4 py-3 text-right">{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTickets.map((ticket) => {
                const isCritical = ticket.priority === 'P1-Critical';
                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => setSelectedTicketDetail(ticket)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {ticket.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-white max-w-sm sm:max-w-md truncate">
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-500">{ticket.category}</span>
                        {ticket.documentRef && (
                          <span className="text-blue-300 bg-blue-950/60 px-1 rounded border border-blue-800/40">
                            {ticket.documentRef}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ticket.post}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] border ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] border font-medium ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell whitespace-nowrap font-mono">
                      {ticket.status === 'Resolved' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Met SLA
                        </span>
                      ) : (
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            ticket.slaMinutesRemaining < 30
                              ? 'text-rose-400 animate-pulse'
                              : ticket.slaMinutesRemaining < 60
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {ticket.slaMinutesRemaining}m
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnalyzeWithAi(ticket);
                        }}
                        className="inline-flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold shadow-sm transition"
                        title="Send diagnostic logs to AI Support Specialist"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden sm:inline">{t.analyzeWithAi}</span>
                        <span className="sm:hidden">AI Triage</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Drawer / Modal */}
      {selectedTicketDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-blue-400">
                    {selectedTicketDetail.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityBadge(selectedTicketDetail.priority)}`}>
                    {selectedTicketDetail.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs border ${getStatusBadge(selectedTicketDetail.status)}`}>
                    {selectedTicketDetail.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">
                  {selectedTicketDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicketDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[11px]">Assigned Post:</span>
                  <span className="font-medium text-white">{selectedTicketDetail.post}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Category:</span>
                  <span className="font-medium text-white">{selectedTicketDetail.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Document Ref:</span>
                  <span className="font-mono text-blue-400">{selectedTicketDetail.documentRef || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">SLA Target:</span>
                  <span className="font-mono text-amber-400">{selectedTicketDetail.slaMinutesRemaining} minutes remaining</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Issue Description</h4>
                <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedTicketDetail.description}
                </p>
              </div>

              {selectedTicketDetail.errorLog && (
                <div>
                  <h4 className="font-semibold text-rose-400 mb-1 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Captured Error Diagnostic Log</span>
                  </h4>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-rose-900/40 text-rose-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {selectedTicketDetail.errorLog}
                  </pre>
                </div>
              )}

              {selectedTicketDetail.resolutionNotes && (
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-1 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolution Notes</span>
                  </h4>
                  <p className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-800/40 text-emerald-200">
                    {selectedTicketDetail.resolutionNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Created: {selectedTicketDetail.createdAt}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const ticket = selectedTicketDetail;
                    setSelectedTicketDetail(null);
                    onAnalyzeWithAi(ticket);
                  }}
                  className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Send to AI Specialist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Create New E2 Service Incident Ticket</span>
              </h3>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Issue Summary / Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Error 401 when approving TA-2026-BKK-0911"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mission Post:</label>
                  <select
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                  >
                    {mockPosts.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name} [{p.code}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="TA Submission">TA Submission</option>
                    <option value="Expense Report (Voucher)">Expense Report (Voucher)</option>
                    <option value="GFMS Financial Sync">GFMS Financial Sync</option>
                    <option value="User Profile / Routing">User Profile / Routing</option>
                    <option value="Ticketing & CBA">Ticketing &amp; CBA</option>
                    <option value="Policy & DSSR">Policy &amp; DSSR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="P1-Critical">P1 - Critical (Urgent TDY/Ticketing Block)</option>
                    <option value="P2-High">P2 - High</option>
                    <option value="P3-Normal">P3 - Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Description:</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain user action, traveler name, document ID, and impact..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Error Log / Screenshot text:</label>
                <textarea
                  rows={2}
                  value={newErrorLog}
                  onChange={(e) => setNewErrorLog(e.target.value)}
                  placeholder="Paste ERR-401, HTTP 502, or Java stack trace here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-[11px] text-rose-300 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-semibold transition"
                >
                  Save &amp; Queue Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
