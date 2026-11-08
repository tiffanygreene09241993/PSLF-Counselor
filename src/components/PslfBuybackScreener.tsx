import React, { useState } from 'react';
import { BorrowerProfile, RepaymentPlanQuote } from '../types/counselor';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ExternalLink,
  DollarSign,
  Calendar,
  Sparkles,
  Info,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface PslfBuybackScreenerProps {
  profile: BorrowerProfile;
  standardQuote: RepaymentPlanQuote;
  ibrQuote: RepaymentPlanQuote;
}

export const PslfBuybackScreener: React.FC<PslfBuybackScreenerProps> = ({
  profile,
  standardQuote,
  ibrQuote,
}) => {
  // Certified qualifying employment months (User can toggle or enter)
  // Default to 120 if borrower has high qualifying payments, or 108
  const defaultMonths = profile.loans.length > 0 && Math.max(...profile.loans.map((l) => l.qualifyingPaymentsMade)) >= 100 ? 120 : 108;
  const [certifiedMonths, setCertifiedMonths] = useState<number>(defaultMonths);
  const [pausedMonths, setPausedMonths] = useState<number>(12); // e.g. 12 months in SAVE litigation forbearance

  const isEligible = certifiedMonths >= 120;
  const monthsRemaining = Math.max(0, 120 - certifiedMonths);

  // Valuation calculation
  // Buyback uses the lower of the IDR payment that would have been owed vs Standard 10-year amount
  const idrMonthly = Math.max(0, ibrQuote.initialMonthlyPayment);
  const standardMonthly = Math.max(0, standardQuote.initialMonthlyPayment);
  const valuationRate = Math.min(idrMonthly, standardMonthly);
  const totalBuybackCost = valuationRate * pausedMonths;

  const totalOutstandingBalance = profile.loans.reduce((sum, l) => sum + l.balance, 0);
  const netForgiveness = Math.max(0, totalOutstandingBalance - totalBuybackCost);

  return (
    <div className="rounded-2xl border-2 border-indigo-300 bg-white p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
              <Scale className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              PSLF Buyback Qualification Screener & Valuation
            </h3>
            <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-full">
              34 CFR § 685.219
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Determine if your account meets the statutory threshold to buy back paused forbearance months during the SAVE litigation.
          </p>
        </div>

        <div className="shrink-0">
          {isEligible ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
              <Unlock className="w-4 h-4 text-emerald-600" />
              <span>Prerequisite Met (120+ Mo)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Prerequisite Incomplete</span>
            </span>
          )}
        </div>
      </div>

      {/* Prerequisite Check Interactive Controller */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <label className="font-bold text-slate-800">
                Total Certified Public Service Employment Months:
              </label>
            </div>
            <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300">
              {certifiedMonths} Months
            </span>
          </div>

          <input
            type="range"
            min="60"
            max="140"
            step="1"
            value={certifiedMonths}
            onChange={(e) => setCertifiedMonths(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>60 Mo (5 Yrs)</span>
            <span className="font-bold text-indigo-700">120 Months (Statutory Buyback Gate)</span>
            <span>140 Mo</span>
          </div>
        </div>

        {/* Informative Callout based on Prerequisite */}
        {!isEligible ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-2 text-sm text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Buyback Currently Ineligible: Premature Request Prevention</span>
            </div>
            <p className="leading-relaxed text-amber-900">
              Federal regulations strictly mandate that a borrower <strong>must already have 120 months of certified qualifying public service employment</strong> before requesting a buyback.
              You currently have <strong>{certifiedMonths} certified months</strong>. Submitting a buyback request now will result in an immediate administrative denial by the Department of Education.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-amber-800">
              <span>Required Next Step: Continue working for <strong>{monthsRemaining} more months</strong> in public service before filing the buyback form.</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-2 text-sm text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Prerequisite Verified: You Are Qualified to Request PSLF Buyback</span>
            </div>
            <p className="leading-relaxed text-emerald-900">
              You have accumulated at least 120 certified employment months! If your account was paused during SAVE litigation, you can now purchase those specific paused months to achieve immediate, full forgiveness.
            </p>
          </div>
        )}
      </div>

      {/* Forbearance Valuation Calculator (Unlocked only when eligible) */}
      <div
        className={`p-5 rounded-xl border transition-all space-y-5 ${
          isEligible
            ? 'bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/50 border-indigo-200'
            : 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span>Forbearance Valuation & Lump-Sum Cost Calculator</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Federal formula: Valuation is based on the lower of what your IDR payment would have been vs. Standard 10-Year rate.
            </p>
          </div>

          {!isEligible && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
              Locked until 120 Months
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Paused Months Slider */}
          <div className="space-y-2 p-3.5 bg-white rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Paused Litigation Months to Buy Back:</span>
              <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {pausedMonths} Months
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              disabled={!isEligible}
              value={pausedMonths}
              onChange={(e) => setPausedMonths(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 Month</span>
              <span>12 Months (Typical SAVE Pause)</span>
              <span>24 Months</span>
            </div>
          </div>

          {/* Rate Comparison Metrics */}
          <div className="space-y-2 p-3.5 bg-white rounded-lg border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 block">Valuation Rate Calculation:</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Historical IDR Rate (IBR):</span>
              <span className="font-mono font-bold text-slate-900">${idrMonthly.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Standard 10-Yr Rate:</span>
              <span className="font-mono font-bold text-slate-500">${standardMonthly.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-emerald-800 font-bold">
              <span>Applied Buyback Rate (Lesser):</span>
              <span className="font-mono text-sm">${valuationRate.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* Valuation Summary Card */}
        {isEligible && (
          <div className="p-4 rounded-xl bg-white border-2 border-emerald-300 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Estimated Buyback Lump Sum:</span>
              <span className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5 block">
                ${totalBuybackCost.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {pausedMonths} mo × ${valuationRate.toLocaleString()}/mo
              </span>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-xs text-slate-500 block font-medium">Instant Tax-Free Discharge:</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-600 mt-0.5 block">
                +${totalOutstandingBalance.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Immediate balance forgiveness</span>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Net Borrower Return:</span>
                <span className="text-lg font-extrabold font-mono text-indigo-700 mt-0.5 block">
                  +${netForgiveness.toLocaleString()}
                </span>
              </div>
              <a
                href="https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service/questions"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
              >
                <span>Submit Buyback Form</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
