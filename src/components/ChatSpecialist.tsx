import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  FileText,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Loader2,
  Terminal,
  Download
} from 'lucide-react';
import { ChatMessage, Language, PostInfo, Ticket } from '../types';
import { translations } from '../translations';

interface ChatSpecialistProps {
  currentLang: Language;
  selectedPost: PostInfo;
  ticketToAnalyze: Ticket | null;
  onClearTicketToAnalyze: () => void;
  onOpenSopModal: (title: string, content: string) => void;
}

export const ChatSpecialist: React.FC<ChatSpecialistProps> = ({
  currentLang,
  selectedPost,
  ticketToAnalyze,
  onClearTicketToAnalyze,
  onOpenSopModal,
}) => {
  const t = translations[currentLang];
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      content: currentLang === 'th'
        ? `สวัสดีครับ ผมคือ **E2 Travel Tier-1 Support Specialist & IT Analyst** ประจำ U.S. Mission และ Department of State

ผมพร้อมช่วยเหลือเจ้าหน้าที่, Travel Arrangers, และผู้ดูแลระบบ E2 Solutions ทั่วโลก (กว่า 200 Posts) ในเรื่อง:
1. **การวินิจฉัยปัญหาทางเทคนิค & Error Logs** (เช่น Error 401 ขณะกดส่ง TA, Error 502 GFMS Sync, Routing Chain Deadlock)
2. **ขั้นตอนมาตรฐานการปฏิบัติงาน (SOP)** (เช่น User Onboarding / Offboarding, การกำหนดสิทธิ์ AO / FMO)
3. **การคำนวณเบี้ยเลี้ยง & กฎระเบียบ** (DSSR Foreign Per Diem, 14 FAM 500, Fly America Act Open Skies)

*คุณสามารถคลิกเลือกสถานการณ์จำลองด้านล่าง หรือพิมพ์คำถาม / วาง Error Log เพื่อให้ผมวิเคราะห์ขั้นตอนการแก้ไขได้ทันทีครับ*`
        : `Welcome. I am your **E2 Travel Tier-1 Support Specialist & IT Operations Analyst** for the U.S. Mission and Department of State.

I assist travel administrators, IT analysts, and embassy personnel across 200+ global posts with:
1. **Technical Troubleshooting & Error Analysis** (e.g., Error 401 on TA submission, GFMS Sync Error 502, Routing deadlocks)
2. **Standard Operating Procedures (SOPs)** (User Onboarding/Offboarding, Approving Official profile setup)
3. **Travel Policy & Regulation Guidance** (14 FAM 500, DSSR Chapter 040, Fly America Act Open Skies)

*Select any real-world simulation below or type your inquiry to receive structured diagnostic action steps.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickScenarios = [
    {
      id: 'sc-401',
      label: 'Error 401 Submitting TA',
      prompt: currentLang === 'th'
        ? 'ช่วยตรวจสอบเคสนี้ให้หน่อยครับ ผู้ใช้งานไม่สามารถกดส่ง Travel Authorization ในระบบ E2 ได้ ติด Error 401 ควรตรวจสอบส่วนไหนก่อน?'
        : 'Can you troubleshoot this case: User cannot submit Travel Authorization in E2, getting Error 401. What should be checked first?',
      badge: 'Critical Bug',
    },
    {
      id: 'sc-onboard',
      label: 'User Onboarding / Offboarding SOP',
      prompt: currentLang === 'th'
        ? 'ขอขั้นตอนมาตรฐานในการทำ User Onboarding/Offboarding สำหรับแอดมินระบบ E2 Travel หน่อยครับ'
        : 'Please provide standard user onboarding/offboarding operating procedures for E2 Travel administrators.',
      badge: 'Admin SOP',
    },
    {
      id: 'sc-gfms',
      label: 'GFMS Sync Error 502 (Financial Mismatch)',
      prompt: currentLang === 'th'
        ? 'Voucher rejected: GFMS financial sync obligation mismatch error (502) ส่งผลให้เบิกเงินไม่ได้'
        : 'Voucher rejected: GFMS financial sync obligation mismatch error (Code 502) preventing payout.',
      badge: 'Finance / GFMS',
    },
    {
      id: 'sc-flyamerica',
      label: 'Fly America Act & Open Skies Waiver',
      prompt: currentLang === 'th'
        ? 'ขอแนวทางการยื่นขอยกเว้น Fly America Act ภายใต้ข้อตกลง Open Skies สำหรับเที่ยวบินตรง'
        : 'How to process a Fly America Act waiver exception request under Open Skies agreements for direct flights?',
      badge: 'Compliance',
    },
    {
      id: 'sc-perdiem',
      label: 'DSSR Lodging Cap Overage (AEA)',
      prompt: currentLang === 'th'
        ? `ผู้เดินทางของ Post ${selectedPost.name} มีปัญหาส่วนต่างเบี้ยเลี้ยง DSSR โรงแรมเกินเพดาน Lodging Cap ต้องทำ Actual Expense Allowance (AEA) อย่างไร?`
        : `Traveler at ${selectedPost.name} incurred hotel room rate exceeding DSSR lodging cap. What is the Actual Expense Allowance (AEA) procedure?`,
      badge: 'DSSR / 14 FAM',
    },
  ];

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // When a ticket is passed from the TicketQueue tab
  useEffect(() => {
    if (ticketToAnalyze) {
      const ticketPrompt = currentLang === 'th'
        ? `ช่วยวิเคราะห์ Ticket รหัส [${ticketToAnalyze.id}]: "${ticketToAnalyze.title}"\n- Post: ${ticketToAnalyze.post}\n- หมวดหมู่: ${ticketToAnalyze.category}\n- รายละเอียด: ${ticketToAnalyze.description}\n${ticketToAnalyze.errorLog ? `- Error Log: ${ticketToAnalyze.errorLog}` : ''}\nขอขั้นตอนการแก้ไขปัญหาทีละขั้น (Step-by-step) และการตรวจสอบความถูกต้องตามระเบียบ 14 FAM ครับ`
        : `Please analyze Service Ticket [${ticketToAnalyze.id}]: "${ticketToAnalyze.title}"\n- Assigned Post: ${ticketToAnalyze.post}\n- Category: ${ticketToAnalyze.category}\n- Description: ${ticketToAnalyze.description}\n${ticketToAnalyze.errorLog ? `- Error Log: ${ticketToAnalyze.errorLog}` : ''}\nProvide root cause analysis, step-by-step diagnostic actions, and 14 FAM regulatory compliance verification.`;

      sendMessage(ticketPrompt);
      onClearTicketToAnalyze();
    }
  }, [ticketToAnalyze]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          postContext: `${selectedPost.name} [${selectedPost.code}]`,
          language: currentLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'model',
        content: data.reply || 'No response returned from support specialist engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Fallback message
      const errorMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        role: 'model',
        content: currentLang === 'th'
          ? `### ⚠️ ข้อขัดข้องในการเชื่อมต่อระบบ E2 Service API\nระบบทำงานในโหมด Offline Fallback เนื่องจาก: ${err.message || 'Network delay'}\n\nกรุณาตรวจสอบว่า Service Desk API และเครือข่ายภายในสถานทูตทำงานปกติ หรือคลิกเลือกคำถามจำลองด้านบนเพื่อดูฐานข้อมูลความรู้ SOP ครับ`
          : `### ⚠️ Connection Notice to E2 Support API\nOperating under internal fallback mode: ${err.message || 'Service latency'}. Please select a verified simulation prompt above to reference the local E2 SOP knowledge engine.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAutoReport = async (lastBotMessageText?: string) => {
    setIsLoading(true);
    try {
      const relevantContent = lastBotMessageText || messages.filter((m) => m.role === 'model').slice(-1)[0]?.content || 'E2 General Support Query';
      const response = await fetch('/api/generate-sop-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'E2 Solutions Support Incident & Technical SOP',
          details: relevantContent,
          post: selectedPost.name,
          language: currentLang,
        }),
      });

      const data = await response.json();
      const reportMarkdown = data.report || 'Report generation complete.';
      onOpenSopModal(`Incident Report - ${selectedPost.name}`, reportMarkdown);
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Session Context Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-white">E2 Tier-1 Support Specialist</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active Context: <span className="text-blue-300 font-medium">{selectedPost.name}</span> ({selectedPost.tz}) • Knowledge Base: 14 FAM / DSSR / FTR
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleGenerateAutoReport()}
            disabled={isLoading || messages.length <= 1}
            className="flex items-center space-x-1.5 bg-blue-600/90 hover:bg-blue-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md font-medium shadow-sm transition"
            title="Auto-generate formal USG Incident Report / SOP"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.autoReportBtn}</span>
            <span className="sm:hidden">SOP Report</span>
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            title={t.clearChat}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Scenario Starters Strip */}
      <div className="bg-slate-900/40 px-4 py-2 border-b border-slate-800/80 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t.quickScenariosTitle}
          </span>
          {quickScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => sendMessage(sc.prompt)}
              disabled={isLoading}
              className="group flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 text-xs transition"
            >
              <span className="text-[10px] text-blue-400 font-mono font-semibold">[{sc.badge}]</span>
              <span className="truncate max-w-[200px] sm:max-w-xs">{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/50 flex-shrink-0 flex items-center justify-center text-blue-300 mt-1 shadow">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Header inside bubble */}
                <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-75 border-b border-white/10 pb-1">
                  <span className="font-semibold tracking-wide">
                    {isUser ? 'You (IT Analyst / Travel Arranger)' : 'E2 Solutions Tier-1 Specialist'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Content with formatted sections */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>

                {/* Bot action tools */}
                {!isUser && msg.id !== 'welcome' && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-emerald-400" />
                      14 FAM &amp; DSSR Verified
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="flex items-center space-x-1 hover:text-slate-200 transition text-[11px] px-2 py-0.5 rounded hover:bg-slate-800"
                        title="Copy diagnostic guidance"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Steps</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleGenerateAutoReport(msg.content)}
                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition text-[11px] px-2 py-0.5 rounded hover:bg-slate-800"
                        title="Export as official incident SOP report"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export SOP</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-700/70 border border-indigo-500/50 flex-shrink-0 flex items-center justify-center text-white mt-1 shadow">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/50 flex-shrink-0 flex items-center justify-center text-blue-300 mt-1 shadow">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs sm:text-sm text-slate-300 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>{t.thinking}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.askAiPlaceholder}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <span>{t.send}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Powered by Gemini 3.8 Flash • U.S. Mission E2 Support Protocol</span>
          <span className="hidden sm:inline">Press Enter to submit</span>
        </div>
      </div>
    </div>
  );
};
