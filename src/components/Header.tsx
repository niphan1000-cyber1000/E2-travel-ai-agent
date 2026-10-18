import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  Radio,
  Menu,
  X,
  Server,
  Ticket,
  Wrench,
  Calculator,
  MessageSquare,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Language, PostInfo } from '../types';
import { translations } from '../translations';
import { mockPosts } from '../data/mockData';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedPost: PostInfo;
  setSelectedPost: (post: PostInfo) => void;
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  activeTicketCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedPost,
  setSelectedPost,
  currentLang,
  setCurrentLang,
  activeTicketCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
  const t = translations[currentLang];

  const navItems = [
    { id: 'chat', label: t.navAiChat, icon: MessageSquare, badge: null },
    { id: 'uptime', label: t.navDashboard, icon: Server, badge: '99.94%' },
    { id: 'tickets', label: t.navTickets, icon: Ticket, badge: activeTicketCount > 0 ? activeTicketCount : null },
    { id: 'diagnostics', label: t.navDiagnostics, icon: Wrench, badge: null },
    { id: 'perdiem', label: t.navPerDiem, icon: Calculator, badge: null },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top utility strip */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/50 text-[10px] font-semibold tracking-wider uppercase">
            USG Official System
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-300 font-medium">U.S. Department of State • Global Travel Operations (E2 Solutions)</span>
          <span className="hidden md:inline text-emerald-400 flex items-center gap-1 font-mono text-[11px] ml-2">
            <Radio className="w-3 h-3 animate-pulse text-emerald-400 inline" />
            200+ Posts Synced
          </span>
        </div>

        {/* Post Selector & Language Picker */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* Post Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPostDropdownOpen(!postDropdownOpen)}
              className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs border border-slate-700 transition"
              title="Select Diplomatic Post"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-100">{selectedPost.code}</span>
              <span className="text-slate-400 hidden lg:inline">- {selectedPost.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {postDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setPostDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-md shadow-2xl z-40 py-1 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1 text-[11px] text-slate-400 font-semibold uppercase border-b border-slate-800">
                    {t.selectPost}
                  </div>
                  {mockPosts.map((p) => (
                    <button
                      key={p.code}
                      onClick={() => {
                        setSelectedPost(p);
                        setPostDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 flex items-center justify-between ${
                        selectedPost.code === p.code ? 'bg-blue-950/60 text-blue-300 font-semibold' : 'text-slate-200'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-mono text-blue-400 mr-1.5">[{p.code}]</span>
                        <span>{p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase ml-2">{p.region}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800/80 rounded border border-slate-700 p-0.5 text-xs">
            <Globe className="w-3 h-3 text-slate-400 ml-1.5 mr-1" />
            {(['th', 'en', 'es', 'fr'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition ${
                  currentLang === lang
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'th' ? 'ไทย' : lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('chat')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">E2 SOLUTIONS</span>
                <span className="bg-blue-500/20 text-blue-300 text-[11px] px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold">
                  Tier-1 Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                U.S. Mission Travel Software Support Console • 14 FAM &amp; DSSR
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : typeof item.badge === 'number'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
