import React, { useState } from 'react';
import { BorrowerProfile, RoadmapTaskItem } from '../types/counselor';
import { calculateReadinessScore, generateRoadmapTasks, generateRepaymentQuotes } from '../utils/calculator';
import { RepaymentCostBarChart } from './RepaymentCostBarChart';
import { PslfFaqSection } from './PslfFaqSection';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Printer,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  Info,
  TrendingDown,
  DollarSign,
  Scale,
} from 'lucide-react';

interface ActionRoadmapCardProps {
  profile: BorrowerProfile;
  onOpenReport: () => void;
  onOpenDoubleConsolidation?: () => void;
}

export const ActionRoadmapCard: React.FC<ActionRoadmapCardProps> = ({
  profile,
  onOpenReport,
  onOpenDoubleConsolidation,
}) => {
  const readiness = calculateReadinessScore(profile);
  const tasks = generateRoadmapTasks(profile);
  const [copied, setCopied] = useState(false);

  // Persistent user checkbox completion state by taskId
  const [completedTaskMap, setCompletedTaskMap] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    if (profile.employment[0]?.isFullTimeCertified) {
      initialMap['task-help-tool'] = true;
    }
    return initialMap;
  });

  // Financial Quotes for Side-by-Side Comparison Box (Using Statutory IBR as benchmark)
  const quotes = generateRepaymentQuotes(profile);
  const standardQuote = quotes.find((q) => q.planId === 'standard_10')!;
  const ibrQuote = quotes.find((q) => q.planId === 'ibr_new') || quotes.find((q) => q.isRecommended) || quotes[1];
  const outOfPocketSavings = Math.max(0, standardQuote.totalPaid120 - ibrQuote.totalPaid120);

  // Interactive toggle handler
  const handleToggleTask = (taskId: string) => {
    setCompletedTaskMap((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const completedCount = tasks.filter((t) => Boolean(completedTaskMap[t.id])).length;

  const handleCopyPlan = () => {
    const textLines = [
      `MY PSLF ACTION ROADMAP — ${profile.borrowerName.toUpperCase()}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `Readiness Status: ${readiness.statusBadge} (${readiness.score}/100)`,
      '',
      'FINANCIAL REPAYMENT COMPARISON:',
      `- Total Paid Under Standard 10-Yr Plan: $${standardQuote.totalPaid120.toLocaleString()} ($0 Forgiven)`,
      `- Total Paid Under Statutory IBR Plan: $${ibrQuote.totalPaid120.toLocaleString()}`,
      `- Estimated Tax-Free Forgiveness: +$${ibrQuote.totalForgiven.toLocaleString()}`,
      `- Net Borrower Out-of-Pocket Savings: +$${outOfPocketSavings.toLocaleString()}`,
      '',
      'ACTION CHECKLIST:',
      ...tasks.map((t, idx) => {
        const isDone = Boolean(completedTaskMap[t.id]);
        return `[${isDone ? 'X' : ' '}] ${idx + 1}. ${t.title}\n    ${t.description}`;
      }),
      '',
      'LITIGATION & ADMINISTRATIVE FORBEARANCE NOTE:',
      '- If you were placed into administrative forbearance during SAVE litigation, use PSLF Buyback once you reach 120 certified employment months to credit paused months.',
      '',
      'ANNUAL RE-CERTIFICATION CADENCE:',
      '- Submit an updated PSLF Form via StudentAid.gov every 12 months',
      '- Re-certify immediately upon changing qualifying employers',
      '- Track official qualifying payment count on your federal servicer dashboard',
    ];

    navigator.clipboard.writeText(textLines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section id="roadmap" className="scroll-mt-20 space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span>Deliverable</span>
          <span aria-hidden="true">·</span>
          <span>Personalized Action Plan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My PSLF Action Roadmap
        </h2>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          An executive, itemized action plan designed to guide you from your current loan status to full, tax-free forgiveness
          under statutory Income-Based Repayment (IBR).
        </p>
      </div>

      {/* Main Roadmap Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 sm:p-8 shadow-lg space-y-8">
        {/* Card Header & Status Badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">File #PSL-{profile.id.slice(0, 6)}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-600">{profile.borrowerName}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-950">Executive Public Service Forgiveness Blueprint</h3>
            <p className="text-sm text-slate-600">
              Target Employer: <strong>{profile.employment[0]?.employerName || 'Qualifying Public Agency'}</strong>
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                readiness.status === 'green'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : readiness.status === 'amber'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {readiness.status === 'green' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {readiness.status === 'amber' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {readiness.status === 'red' && <XCircle className="w-4 h-4 text-rose-600" />}
              <span>{readiness.statusBadge}</span>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Readiness Score: <strong className="text-slate-900">{readiness.score}/100</strong>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Summary Card (Standard Plan vs Statutory IBR) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Financial Comparison Summary: Standard Plan vs. Statutory IBR</span>
            </h4>
            <span className="text-xs text-slate-500 font-medium">120-Payment Trajectory</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box A: Total Paid Under Standard Plan */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                  Standard 10-Year Plan
                </span>
                <span className="text-xs text-rose-700 font-semibold">Zero Forgiveness</span>
              </div>

              <div>
                <div className="text-xs text-slate-600">Total Out-of-Pocket Paid (120 Mo):</div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-0.5">
                  ${standardQuote.totalPaid120.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-200/60 text-xs">
                <div>
                  <span className="text-slate-500 block">Monthly Payment:</span>
                  <span className="font-mono font-bold text-slate-800">${standardQuote.initialMonthlyPayment.toLocaleString()}/mo</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Balance Forgiven:</span>
                  <span className="font-mono font-bold text-slate-500">$0 (Paid in full)</span>
                </div>
              </div>

              <p className="text-[11px] text-rose-800 leading-relaxed">
                Paying under the 10-Year Standard plan pays 100% of principal plus commercial interest, defeating the purpose of PSLF.
              </p>
            </div>

            {/* Box B: Total Paid Under Statutory IBR + Estimated Forgiveness Amount */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded">
                  Statutory IBR (Higher Education Act § 493C)
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  Save ${outOfPocketSavings.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600">Total Paid (120 Mo):</div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-0.5">
                    ${ibrQuote.totalPaid120.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-emerald-800 font-semibold">Estimated Forgiveness:</div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 mt-0.5">
                    +${ibrQuote.totalForgiven.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-300/70 text-xs">
                <div>
                  <span className="text-slate-600 block">Starting Monthly:</span>
                  <span className="font-mono font-bold text-emerald-900">${ibrQuote.initialMonthlyPayment.toLocaleString()}/mo</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Tax Status:</span>
                  <span className="font-semibold text-emerald-900">100% Tax-Free (IRC § 108)</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
                IBR is statutorily protected by Congress (20 U.S.C. § 1098e) and unaffected by court litigation.
              </p>
            </div>
          </div>

          {/* Recharts Bar Chart: Projected Total Cost Comparison */}
          <RepaymentCostBarChart
            quotes={quotes}
            standardQuote={standardQuote}
            ibrQuote={ibrQuote}
          />
        </div>

        {/* Litigation & Administrative Forbearance Note (PSLF Buyback) */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 text-xs text-amber-950 space-y-2">
          <div className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Litigation & Administrative Forbearance Note: PSLF Buyback Opportunity</span>
          </div>
          <p className="leading-relaxed">
            Borrowers whose accounts were placed into court-ordered administrative pauses during the SAVE litigation do not
            automatically earn PSLF payment counts during paused months. However, under the official <strong>PSLF Buyback</strong> protocol,
            once you reach 120 certified qualifying public service employment months, you can request to buy back those paused months
            at what your IDR payment would have been, allowing you to achieve immediate tax-free forgiveness.
          </p>
          <a
            href="https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service/questions"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-amber-900 underline inline-flex items-center gap-1 hover:text-amber-950"
          >
            <span>Read StudentAid.gov PSLF Buyback Instructions</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Personalized Implementation Checklist (Interactive Toggles) */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">Personalized Implementation Checklist</h4>
              <p className="text-xs text-slate-500">Click any step to check it off as you complete your filings.</p>
            </div>
            <div className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              {completedCount} of {tasks.length} Completed
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => {
              const isDone = Boolean(completedTaskMap[task.id]);

              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-300 text-slate-700'
                      : task.isUrgent
                      ? 'bg-amber-50/60 border-amber-300 text-slate-900 hover:bg-amber-50/80'
                      : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-400 bg-white hover:border-slate-600'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-500">Step {index + 1}</span>
                          <span className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </span>
                          {task.isUrgent && (
                            <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                              Priority Action
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed max-w-3xl ${isDone ? 'text-slate-500' : 'text-slate-600'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {task.actionUrl && (
                        <a
                          href={task.actionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hidden sm:inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md border border-slate-300 transition-colors shadow-2xs whitespace-nowrap"
                        >
                          <span>{task.actionLabel || 'StudentAid.gov'}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      )}
                      {task.id === 'task-parent-plus' && onOpenDoubleConsolidation && (
                        <button
                          type="button"
                          onClick={onOpenDoubleConsolidation}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <span>Guide</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadlines & Annual Cadence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-600">
              <Calendar className="w-4 h-4" />
              Annual Re-certification Cadence
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit an updated PSLF form through the Help Tool every <strong>12 months</strong> (recommend: October
              annual review). This freezes your qualifying payment progress permanently into federal records.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              Consolidation Processing Timeline
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct Consolidation applications take <strong>45 to 60 days</strong> to process. Keep making your regular
              payments until the new consolidation loan appears in your servicer portal to avoid past-due flags.
            </p>
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Keep this roadmap handy during your student aid portal navigation.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyPlan}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Roadmap Text'}</span>
            </button>

            <button
              onClick={onOpenReport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Action Plan as PDF / Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible PSLF Misconceptions & Knowledge Base FAQ */}
      <PslfFaqSection />
    </section>
  );
};
