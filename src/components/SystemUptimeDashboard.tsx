import React, { useState } from 'react';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Globe2,
  Database,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Language, PostInfo, SystemService } from '../types';
import { translations } from '../translations';
import { mockSystemServices, mockPosts } from '../data/mockData';

interface SystemUptimeDashboardProps {
  currentLang: Language;
  selectedPost: PostInfo;
  onSelectPost: (post: PostInfo) => void;
}

export const SystemUptimeDashboard: React.FC<SystemUptimeDashboardProps> = ({
  currentLang,
  selectedPost,
  onSelectPost,
}) => {
  const t = translations[currentLang];
  const [services, setServices] = useState<SystemService[]>(mockSystemServices);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latencyMs: Math.max(45, Math.floor(s.latencyMs + (Math.random() * 20 - 10))),
        }))
      );
      setLastRefreshed(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 600);
  };

  const operationalCount = services.filter((s) => s.status === 'operational').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const avgLatency = Math.round(services.reduce((acc, s) => acc + s.latencyMs, 0) / services.length);

  const filteredPosts = selectedRegion === 'ALL'
    ? mockPosts
    : mockPosts.filter((p) => p.region === selectedRegion);

  const regions = ['ALL', 'EAP', 'EUR', 'AF', 'WHA', 'NEA', 'SCA'];

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-blue-900/40 text-blue-400 border border-blue-700/40">
                <Activity className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">{t.uptimeTitle}</h2>
                <p className="text-xs text-slate-400">{t.uptimeDesc}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono">
              Last Ping: <span className="text-slate-200">{lastRefreshed}</span>
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh Pings</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{t.overallUptime}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">99.94%</div>
            <p className="text-[11px] text-slate-500 mt-1">Past 30-day global SLA benchmark</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{t.activeIncidents}</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">{degradedCount} Minor</div>
            <p className="text-[11px] text-slate-500 mt-1">GFMS peak-hour sync latency</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{t.avgResponseTime}</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-400">{avgLatency} ms</div>
            <p className="text-[11px] text-slate-500 mt-1">Global average response latency</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{t.dssrSyncStatus}</span>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-400">Chapter 040</div>
            <p className="text-[11px] text-emerald-400 mt-1">✓ Synced today for 200+ posts</p>
          </div>
        </div>
      </div>

      {/* Critical Subsystem Health Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Server className="w-4 h-4 text-blue-400" />
          <span>Core Subsystem Architecture &amp; Interfaces</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const isDegraded = service.status === 'degraded';
            return (
              <div
                key={service.id}
                className={`bg-slate-950/90 rounded-lg p-4 border transition ${
                  isDegraded
                    ? 'border-amber-500/50 hover:border-amber-400'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                      {service.category}
                    </span>
                    <h4 className="font-semibold text-white text-sm leading-tight">{service.name}</h4>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      isDegraded
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        isDegraded ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                      }`}
                    />
                    {service.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{service.description}</p>

                {service.lastIncident && (
                  <div className="mt-2.5 p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300">
                    <strong>Advisory:</strong> {service.lastIncident}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>Uptime:</span>
                    <span className="font-mono font-semibold text-slate-200">{service.uptime}%</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ping:</span>
                    <span
                      className={`font-mono font-semibold ${
                        service.latencyMs > 250 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {service.latencyMs} ms
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 200+ Global Posts Availability Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <span>Global Mission Posts Uptime (Sample of 200+ Posts)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select any embassy or mission to focus support telemetry and local per diem context.
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  selectedRegion === reg
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filteredPosts.map((post) => {
            const isSelected = selectedPost.code === post.code;
            const isDegraded = post.status === 'degraded';
            return (
              <button
                key={post.code}
                onClick={() => onSelectPost(post)}
                className={`text-left p-3 rounded-lg border transition ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm text-blue-400">{post.code}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDegraded ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div className="font-semibold text-white text-xs truncate">{post.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                  <span>{post.country}</span>
                  <span className="font-mono text-slate-500">{post.tz}</span>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>DSSR M&amp;IE:</span>
                  <span className="text-emerald-400">${post.perDiemMIE}/d</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
