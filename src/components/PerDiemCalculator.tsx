import React, { useState } from 'react';
import {
  Calculator,
  Building,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Language, PostInfo } from '../types';
import { translations } from '../translations';
import { mockPosts } from '../data/mockData';

interface PerDiemCalculatorProps {
  currentLang: Language;
  selectedPost: PostInfo;
  onAskAi: (prompt: string) => void;
}

export const PerDiemCalculator: React.FC<PerDiemCalculatorProps> = ({
  currentLang,
  selectedPost,
  onAskAi,
}) => {
  const t = translations[currentLang];
  const [activePost, setActivePost] = useState<PostInfo>(selectedPost);
  const [travelDays, setTravelDays] = useState<number>(5);
  const [applyFirstLastDayRule, setApplyFirstLastDayRule] = useState<boolean>(true);
  const [actualLodgingNightly, setActualLodgingNightly] = useState<number>(activePost.perDiemLodging);

  // When activePost changes, reset lodging
  const handlePostChange = (post: PostInfo) => {
    setActivePost(post);
    setActualLodgingNightly(post.perDiemLodging);
  };

  // Calculations
  const lodgingCap = activePost.perDiemLodging;
  const standardMIE = activePost.perDiemMIE;

  // First & Last day 75% rule
  let totalMIE = 0;
  if (travelDays <= 1) {
    totalMIE = standardMIE * (applyFirstLastDayRule ? 0.75 : 1);
  } else if (applyFirstLastDayRule) {
    // 2 days at 75%, (travelDays - 2) days at 100%
    const middleDays = Math.max(0, travelDays - 2);
    totalMIE = 2 * (standardMIE * 0.75) + middleDays * standardMIE;
  } else {
    totalMIE = travelDays * standardMIE;
  }

  // Lodging nights = travelDays - 1 (usually), or travelDays
  const lodgingNights = Math.max(1, travelDays - 1);
  const eligibleNightlyLodging = Math.min(actualLodgingNightly, lodgingCap);
  const totalReimbursableLodging = eligibleNightlyLodging * lodgingNights;
  const lodgingOverage = Math.max(0, actualLodgingNightly - lodgingCap);
  const totalPerDiem = totalReimbursableLodging + totalMIE;

  // M&IE Breakdown
  const breakfast = Math.round(standardMIE * 0.15);
  const lunch = Math.round(standardMIE * 0.25);
  const dinner = Math.round(standardMIE * 0.40);
  const incidentals = standardMIE - (breakfast + lunch + dinner);

  const isAEA_Required = actualLodgingNightly > lodgingCap;
  const aeaPercentage = Math.round((actualLodgingNightly / lodgingCap) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-lg bg-blue-900/40 text-blue-400 border border-blue-700/40">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">{t.perDiemTitle}</h2>
              <p className="text-xs text-slate-400">{t.perDiemDesc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-blue-950 text-blue-300 border border-blue-800/40 font-semibold">
              DSSR Section 040 Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Travel Parameters &amp; Post
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.selectCity}
            </label>
            <select
              value={activePost.code}
              onChange={(e) => {
                const found = mockPosts.find((p) => p.code === e.target.value);
                if (found) handlePostChange(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {mockPosts.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.country}) - Lodging ${p.perDiemLodging} / M&amp;IE ${p.perDiemMIE}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.travelDays}
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={travelDays}
              onChange={(e) => setTravelDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Estimated nights of lodging: {lodgingNights} nights
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Actual Hotel Nightly Rate ($ USD):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 text-xs">$</span>
              <input
                type="number"
                min={0}
                value={actualLodgingNightly}
                onChange={(e) => setActualLodgingNightly(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] mt-1">
              <span className="text-slate-500">Official DSSR Cap: ${lodgingCap}/night</span>
              <button
                type="button"
                onClick={() => setActualLodgingNightly(lodgingCap)}
                className="text-blue-400 hover:underline"
              >
                Reset to Cap
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={applyFirstLastDayRule}
                onChange={(e) => setApplyFirstLastDayRule(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
              />
              <span className="text-xs text-slate-300 leading-tight">
                {t.isFirstLastDay}
              </span>
            </label>
          </div>

          {/* AEA Warning if room rate exceeds DSSR */}
          {isAEA_Required && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 space-y-1">
              <div className="font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Actual Expense Allowance (AEA) Required</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Nightly room rate is {aeaPercentage}% of DSSR cap (+${lodgingOverage}/night).
                {aeaPercentage <= 150
                  ? ' Requires Post Management Officer / Executive Office approval (Form DS-4043).'
                  : ' Exceeds 150%! Requires Under Secretary for Management (M) approval.'}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() =>
                onAskAi(
                  `ขอปรึกษาระเบียบการเบิกจ่ายเบี้ยเลี้ยงที่ ${activePost.name}: ค่าห้องพักจริง $${actualLodgingNightly} เทียบกับ DSSR Cap $${lodgingCap} (เดินทาง ${travelDays} วัน) ต้องทำเรื่อง Actual Expense Allowance (AEA) อย่างไรในระบบ E2?`
                )
              }
              className="w-full flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-lg font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Policy Specialist</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Results and M&IE Split */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Entitlement Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {t.totalPerDiemEligible}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">
              ${totalPerDiem.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Estimated allowable travel reimbursement based on 14 FAM 560 &amp; DSSR rates for {activePost.name}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-500 uppercase block">Reimbursable Lodging Total</span>
                <span className="text-xl font-mono font-bold text-white mt-1 block">
                  ${totalReimbursableLodging.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lodgingNights} nights @ max ${eligibleNightlyLodging}/night
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-500 uppercase block">M&amp;IE Flat Allowance Total</span>
                <span className="text-xl font-mono font-bold text-white mt-1 block">
                  ${totalMIE.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">
                  {travelDays} days {applyFirstLastDayRule ? '(with 75% proration)' : '(100% full days)'}
                </span>
              </div>
            </div>
          </div>

          {/* Meals & Incidentals (M&IE) Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Official M&amp;IE Daily Breakdown (Standard DSSR: ${standardMIE}/day)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.breakfast}</span>
                <span className="font-mono text-base font-bold text-slate-200 mt-1 block">
                  ${breakfast}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.lunch}</span>
                <span className="font-mono text-base font-bold text-slate-200 mt-1 block">
                  ${lunch}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.dinner}</span>
                <span className="font-mono text-base font-bold text-slate-200 mt-1 block">
                  ${dinner}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{t.incidentals}</span>
                <span className="font-mono text-base font-bold text-slate-200 mt-1 block">
                  ${incidentals}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] text-slate-300">
              <strong className="text-blue-300">Policy Reminder (14 FAM 564):</strong> Meals provided at government expense (e.g. conference lunch included in registration or flight meals) must be deducted from the traveler&apos;s Expense Report voucher at the allocated rate above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
