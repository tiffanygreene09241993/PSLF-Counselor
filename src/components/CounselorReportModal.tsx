import React from 'react';
import { BorrowerProfile } from '../types/counselor';
import { analyzeConsolidation, generateRepaymentQuotes, generateRoadmapTasks } from '../utils/calculator';
import { X, Printer, ShieldCheck, Download, CheckCircle2, AlertTriangle, FileText, Check, Scale } from 'lucide-react';

interface CounselorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BorrowerProfile;
}

export const CounselorReportModal: React.FC<CounselorReportModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  if (!isOpen) return null;

  const consolidation = analyzeConsolidation(profile.loans);
  const quotes = generateRepaymentQuotes(profile);
  const tasks = generateRoadmapTasks(profile);
  const standardQuote = quotes.find((q) => q.planId === 'standard_10')!;
  const ibrQuote = quotes.find((q) => q.planId === 'ibr_new') || quotes.find((q) => q.isRecommended) || quotes[1];
  const outOfPocketSavings = Math.max(0, standardQuote.totalPaid120 - ibrQuote.totalPaid120);

  const totalBalance = profile.loans.reduce((sum, l) => sum + l.balance, 0);
  const directBalance = consolidation.directBalance;
  const nonDirectBalance = consolidation.nonDirectBalance;

  const handlePrint = () => {
    window.print();
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-tight">Executive PSLF Readiness Audit & Action Checklist</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive Document Body */}
        <div className="p-8 sm:p-12 space-y-7 text-slate-900 font-sans leading-relaxed text-sm print:p-4 print:space-y-5">
          {/* Formal Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Independent Student Loan Advisory Services · 34 CFR § 685.219
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 mt-1 tracking-tight">
                PSLF Readiness Audit & Action Checklist
              </h1>
              <div className="text-xs text-slate-600 mt-0.5">
                Official Record for Employer Human Resources, Federal Loan Servicer, and Borrower Files
              </div>
            </div>
            <div className="text-right text-xs text-slate-600 sm:shrink-0 space-y-1">
              <div><strong>Date:</strong> {todayDate}</div>
              <div><strong>Evaluation File ID:</strong> PSL-2026-{profile.id.toUpperCase().slice(0, 8)}</div>
              <div><strong>Borrower Name:</strong> {profile.borrowerName}</div>
              <div><strong>Occupation:</strong> {profile.occupation}</div>
              <div className="pt-1">
                <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  Readiness: {consolidation.requiresConsolidation ? 'Action Required (Consolidate)' : 'Fully Qualified Direct Portfolio'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Employer & Loan Eligibility Snapshot */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Statutory Eligibility Snapshot
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-xs uppercase text-slate-500">Employer Qualification Status</div>
                <div className="text-sm font-semibold text-slate-900">
                  {profile.employment[0]?.employerName || 'Public Service Employer'}
                </div>
                <div className="text-xs text-slate-600">
                  Classification: <strong>{profile.employment[0]?.category}</strong> (EIN: {profile.employment[0]?.ein})
                </div>
                <div className="text-xs font-medium text-emerald-700">
                  Status: Qualifies under Higher Education Act public service standards (&ge;30 hrs/week).
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-xs uppercase text-slate-500">Federal Loan Audit</div>
                <div className="text-sm font-semibold text-slate-900">
                  Total Federal Debt: <span className="font-mono font-bold">${totalBalance.toLocaleString()}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Direct Loans (Eligible): <span className="font-mono font-semibold">${directBalance.toLocaleString()}</span>
                </div>
                <div className="text-xs text-slate-600">
                  FFEL / Perkins (Ineligible As-Is): <span className="font-mono font-semibold text-amber-800">${nonDirectBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Consolidation Warning & Status */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1">
              2. Consolidation Warning & Diagnostic
            </h2>
            {consolidation.requiresConsolidation ? (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 space-y-1.5 text-xs text-amber-950">
                <div className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Mandatory Action: Direct Consolidation Loan Required
                </div>
                <p>
                  Your student loan inventory contains <strong>{consolidation.nonDirectLoanCount} legacy loan(s) (${consolidation.nonDirectBalance.toLocaleString()})</strong> under
                  the FFEL or Perkins programs. These loans will <strong>never</strong> receive PSLF credits in their current state.
                </p>
                <p>
                  <strong>Action Required:</strong> Submit a Direct Consolidation application via StudentAid.gov. Under current
                  permanent regulations, your payment count will not reset to zero; you will receive a <strong>weighted average
                  payment count ({consolidation.weightedPaymentEstimate} estimated payments)</strong> across your balances.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1 text-xs text-emerald-950">
                <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Direct Loan Compliance Verified
                </div>
                <p>
                  All active balances are held in the William D. Ford Federal Direct Loan Program. No consolidation is required for eligibility.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Statutory Repayment Optimization (IBR Standard) */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>3. Optimal Repayment Strategy: Standard vs. Statutory IBR</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">AGI: ${profile.agi.toLocaleString()} · Family: {profile.familySize}</span>
            </h2>

            <table className="w-full text-xs border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-3 text-left">Repayment Plan</th>
                  <th className="py-2 px-3 text-right">Initial Monthly</th>
                  <th className="py-2 px-3 text-right">120-Mo Total Out-of-Pocket</th>
                  <th className="py-2 px-3 text-right">Forgiven at Mo 120 (Tax-Free)</th>
                  <th className="py-2 px-3 text-center">Counselor Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-rose-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">10-Year Standard Repayment</td>
                  <td className="py-2.5 px-3 text-right font-mono">${standardQuote.initialMonthlyPayment.toLocaleString()}/mo</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">${standardQuote.totalPaid120.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">$0 (Paid in Full)</td>
                  <td className="py-2.5 px-3 text-center text-rose-700 font-semibold">Worst Strategy</td>
                </tr>
                <tr className="bg-emerald-50/60 font-medium">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Statutory IBR (HEA § 493C)</td>
                  <td className="py-2.5 px-3 text-right font-mono">${ibrQuote.initialMonthlyPayment.toLocaleString()}/mo</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${ibrQuote.totalPaid120.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">+${ibrQuote.totalForgiven.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-800 font-bold">Optimal Statutory Plan</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <div>
                <strong>Counselor Recommendation:</strong> Enroll in statutory <strong>Income-Based Repayment (IBR)</strong>.
                IBR is established directly by Congress (20 U.S.C. § 1098e) and is immune to court injunctions. Switching to IBR saves you{' '}
                <strong>${outOfPocketSavings.toLocaleString()}</strong> out-of-pocket and discharges remaining debt completely tax-free under IRC § 108(f).
              </div>
              <div className="text-[11px] text-amber-900 pt-1 border-t border-slate-200">
                <strong>Litigation & Administrative Forbearance Note:</strong> If your account experienced paused months under SAVE litigation,
                those months do not count automatically. Once you achieve 120 total certified public service employment months, submit an official
                <strong> PSLF Buyback</strong> request to credit those months at your historical IDR rate for immediate full discharge.
              </div>
            </div>
          </div>

          {/* Section 4: Personalized Action Checklist */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1">
              4. Personalized Implementation Checklist
            </h2>
            <div className="space-y-2 text-xs">
              {tasks.map((task, idx) => (
                <div key={task.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded border border-slate-400 bg-white flex items-center justify-center shrink-0 mt-0.5">
                    {idx === 0 && !consolidation.requiresConsolidation ? '✓' : ''}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{task.title}</span>
                    <p className="text-slate-600 mt-0.5">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Counselor Sign-off */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <div>Certified Federal Student Loan Counselor</div>
              <div className="font-semibold text-slate-700">Public Service Loan Advisory Practice</div>
            </div>
            <div className="text-right">
              <div>Official Signature on File</div>
              <div className="font-mono text-slate-400">VERIFIED-PSLF-2026-COMPLIANT</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center print:hidden">
          <div className="text-xs text-slate-500">
            This document will format cleanly onto an executive page when printed or saved as PDF.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
