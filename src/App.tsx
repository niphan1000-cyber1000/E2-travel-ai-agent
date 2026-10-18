import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatSpecialist } from './components/ChatSpecialist';
import { SystemUptimeDashboard } from './components/SystemUptimeDashboard';
import { TicketQueue } from './components/TicketQueue';
import { DiagnosticWizard } from './components/DiagnosticWizard';
import { PerDiemCalculator } from './components/PerDiemCalculator';
import { SopModal } from './components/SopModal';
import { Language, PostInfo, Ticket } from './types';
import { mockPosts, mockTickets } from './data/mockData';
import { translations } from './translations';
import { Shield, Radio, CheckCircle, HelpCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [currentLang, setCurrentLang] = useState<Language>('th');
  const [selectedPost, setSelectedPost] = useState<PostInfo>(mockPosts[0]); // Bangkok BKK by default
  const [ticketToAnalyze, setTicketToAnalyze] = useState<Ticket | null>(null);

  // SOP Modal state
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [sopModalTitle, setSopModalTitle] = useState('');
  const [sopModalContent, setSopModalContent] = useState('');

  const t = translations[currentLang];

  const handleAnalyzeWithAi = (ticket: Ticket) => {
    setTicketToAnalyze(ticket);
    setCurrentTab('chat');
  };

  const handleOpenSopModal = (title: string, content: string) => {
    setSopModalTitle(title);
    setSopModalContent(content);
    setIsSopModalOpen(true);
  };

  const handleAskAiFromOtherTab = (prompt: string) => {
    setCurrentTab('chat');
    // Using a synthetic ticket or let user pass prompt
    setTicketToAnalyze({
      id: 'AI-CONSULT',
      title: prompt,
      description: prompt,
      post: selectedPost.name,
      category: 'Policy & DSSR',
      priority: 'P2-High',
      status: 'New',
      assignee: 'E2 AI Specialist',
      slaMinutesRemaining: 60,
      createdAt: new Date().toISOString(),
    });
  };

  const activeTicketsCount = mockTickets.filter((t) => t.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Application Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedPost={selectedPost}
        setSelectedPost={setSelectedPost}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        activeTicketCount={activeTicketsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {currentTab === 'chat' && (
          <ChatSpecialist
            currentLang={currentLang}
            selectedPost={selectedPost}
            ticketToAnalyze={ticketToAnalyze}
            onClearTicketToAnalyze={() => setTicketToAnalyze(null)}
            onOpenSopModal={handleOpenSopModal}
          />
        )}

        {currentTab === 'uptime' && (
          <SystemUptimeDashboard
            currentLang={currentLang}
            selectedPost={selectedPost}
            onSelectPost={(post) => setSelectedPost(post)}
          />
        )}

        {currentTab === 'tickets' && (
          <TicketQueue
            currentLang={currentLang}
            onAnalyzeWithAi={handleAnalyzeWithAi}
            onOpenSopModal={handleOpenSopModal}
          />
        )}

        {currentTab === 'diagnostics' && (
          <DiagnosticWizard
            currentLang={currentLang}
            onOpenSopModal={handleOpenSopModal}
            onAskAi={handleAskAiFromOtherTab}
          />
        )}

        {currentTab === 'perdiem' && (
          <PerDiemCalculator
            currentLang={currentLang}
            selectedPost={selectedPost}
            onAskAi={handleAskAiFromOtherTab}
          />
        )}
      </main>

      {/* Global Status Bar Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 text-xs text-slate-400 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-medium">
              E2 Travel Software Tier-1 Operations Command
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-slate-400">
              Department of State (DOS) &amp; Global U.S. Missions
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-0.5" />
              <span>GFMS / DSSR Feed Synced</span>
            </span>
            <span className="text-slate-500">|</span>
            <span>Policy: 14 FAM 500 &amp; DSSR 040</span>
          </div>
        </div>
      </footer>

      {/* Universal SOP & Incident Report Viewer Modal */}
      <SopModal
        isOpen={isSopModalOpen}
        onClose={() => setIsSopModalOpen(false)}
        title={sopModalTitle}
        content={sopModalContent}
      />
    </div>
  );
}
