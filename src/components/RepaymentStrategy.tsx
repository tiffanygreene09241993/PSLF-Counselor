import React, { useState } from 'react';
import {
  BorrowerProfile,
  MaritalFilingStatus,
  RepaymentPlanQuote,
  USRegion,
} from '../types/counselor';
import { generateRepaymentQuotes } from '../utils/calculator';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  TrendingDown,
  Sparkles,
  Award,
  Users,
  MapPin,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Scale,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RepaymentStrategyProps {
  profile: BorrowerProfile;
  onUpdateProfile: (updated: BorrowerProfile) => void;
  onNavigateNext?: () => void;
}

export const RepaymentStrategy: React.FC<RepaymentStrategyProps> = ({
  profile,
  onUpdateProfile,
  onNavigateNext,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('ibr_new');
  const [showBuybackDetails, setShowBuybackDetails] = useState<boolean>(true);
  const quotes = generateRepaymentQuotes(profile);

  // Find standard plan and recommended IDR plan
  const standardQuote = quotes.find((q) => q.planId === 'standard_10')!;
  const selectedQuote = quotes.find((q) => q.planId === selectedPlanId) || quotes.find((q) => q.planId === 'ibr_new') || quotes[1];
  const recommendedQuote = quotes.find((q) => q.isRecommended) || quotes.find((q) => q.planId === 'ibr_new') || quotes[1];

  const totalDebt = profile.loans.reduce((sum, l) => sum + l.balance, 0);
  const outOfPocketSavings = Math.max(0, standardQuote.totalPaid120 - selectedQuote.totalPaid120);

  const handleAgiChange = (newAgi: number) => {
    onUpdateProfile({
      ...profile,
      agi: Math.max(0, newAgi),
    });
  };

  const handleFamilySizeChange = (newSize: number) => {
    onUpdateProfile({
      ...profile,
      familySize: Math.max(1, newSize),
    });
  };

  const handleFilingStatusChange = (status: MaritalFilingStatus) => {
    onUpdateProfile({
      ...profile,
      filingStatus: status,
    });
  };

  return (
    <section id="step-3" className="scroll-mt-24 space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span>Step 3 of 4</span>
          <span aria-hidden="true">·</span>
          <span>Income-Driven Repayment Optimization</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          3. Repayment Strategy & IDR Savings Estimator
        </h2>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          Compare the standard 10-year amortization schedule against Income-Driven Repayment (IDR) plans.
          IDR plans peg your payment to household discretionary income, minimizing out-of-pocket costs and maximizing
          tax-free forgiveness after 120 payments.
        </p>
      </div>

      {/* Hero Financial Takeaway Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
              <Award className="w-3.5 h-3.5" />
              <span>Optimal PSLF Strategy: IDR Enrollment</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Switching to {selectedQuote.planName} Saves You ${outOfPocketSavings.toLocaleString()}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Under IDR, your monthly payment is based strictly on your Adjusted Gross Income (${profile.agi.toLocaleString()})
              and family size ({profile.familySize})—never on your total debt balance (${totalDebt.toLocaleString()}).
              By contrast, the 10-Year Standard plan forces you to pay off your balance in full to $0, resulting in
              <strong> zero forgiveness</strong>.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shrink-0 w-full sm:w-auto text-center sm:text-right space-y-1">
            <div className="text-xs text-slate-400 font-medium">Estimated 120-Mo Out-of-Pocket Savings</div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-emerald-400">
              +${outOfPocketSavings.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              Tax-Free Forgiveness at Month 120:{' '}
              <span className="font-mono font-bold text-slate-200">
                ${selectedQuote.totalForgiven.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PSLF Buyback & Court Injunction Guidance (Enhancement 3) */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                  Regulatory Notice
                </span>
                <span className="text-xs text-indigo-800 font-semibold">
                  8th Circuit Litigation & Administrative Forbearance
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                Caught in Court-Ordered Administrative Pauses? PSLF Buyback & IBR Guidance
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBuybackDetails(!showBuybackDetails)}
            className="p-1.5 text-indigo-700 hover:text-indigo-950 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
            title="Toggle Details"
          >
            {showBuybackDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          Due to federal court injunctions impacting the SAVE plan, the Department of Education placed many borrowers
          into an interest-free administrative forbearance. <strong>Months spent in general administrative forbearance do not automatically count as qualifying payments for PSLF.</strong> Borrowers have two primary remedies:
        </p>

        {showBuybackDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Pathway 1: PSLF Buyback */}
            <div className="p-4 rounded-xl bg-white border border-indigo-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pathway 1: The Official PSLF Buyback Protocol</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                If you have reached <strong>120 total certified employment months</strong> and only need payments from
                periods in forbearance (including the SAVE court pause) to reach forgiveness, you can request a <strong>PSLF Buyback</strong> on StudentAid.gov.
              </p>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <strong>How it works:</strong> The Department calculates what your IDR payment would have been during those paused months. You pay that lump sum, and those months immediately convert to qualifying payments for full debt discharge.
              </div>
              <a
                href="https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service/questions"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
              >
                <span>Read StudentAid.gov Buyback Rules</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Pathway 2: Switch to Statutory IBR */}
            <div className="p-4 rounded-xl bg-white border border-indigo-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Pathway 2: Transition to Statutory IBR</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Unlike SAVE (which was created by executive regulation), <strong>Income-Based Repayment (IBR)</strong> is codified directly into federal statute by Congress (20 U.S.C. § 1098e) and is <strong>unaffected by court injunctions</strong>.
              </p>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <strong>Active Option:</strong> If you do not want to wait for Buyback and prefer making verified monthly payments right now, submit an IDR application selecting IBR to resume active credit accumulation.
              </div>
              <a
                href="https://studentaid.gov/idr/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
              >
                <span>Submit IDR Plan Change Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Interactive IDR Savings Estimator Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">IDR Savings Estimator Controls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AGI Slider */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Annual Adjusted Gross Income (AGI)</label>
              <span className="font-mono font-bold text-sm text-slate-900">${profile.agi.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="15000"
              max="220000"
              step="1000"
              value={profile.agi}
              onChange={(e) => handleAgiChange(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$15k</span>
              <span>$100k</span>
              <span>$220k</span>
            </div>
            <span className="text-[11px] text-slate-500 block">From IRS Form 1040 line 11</span>
          </div>

          {/* Family Size Selector */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Household / Family Size</label>
              <span className="font-mono font-bold text-sm text-slate-900">{profile.familySize} Person(s)</span>
            </div>
            <div className="grid grid-cols-6 gap-1 pt-1">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleFamilySizeChange(num)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    profile.familySize === num
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500 block">Higher family size raises poverty protection</span>
          </div>

          {/* Filing Status */}
          <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Tax Filing Status</label>
            </div>
            <select
              value={profile.filingStatus}
              onChange={(e) => handleFilingStatusChange(e.target.value as MaritalFilingStatus)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-medium"
            >
              <option value="single">Single / Head of Household</option>
              <option value="married_joint">Married Filing Jointly (MFJ)</option>
              <option value="married_separate">Married Filing Separately (MFS)</option>
            </select>
            <span className="text-[11px] text-slate-500 block">
              {profile.filingStatus === 'married_separate'
                ? 'MFS excludes spousal income from calculation'
                : 'Combined household income applied'}
            </span>
          </div>
        </div>

        {/* Repayment Plans Side-by-Side Comparison Grid */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-base font-bold text-slate-900">
              Estimated Monthly Payments & Forgiveness by Plan
            </h4>
            <div className="text-xs text-slate-500">
              Based on <strong className="text-slate-900 font-mono">${totalDebt.toLocaleString()}</strong> total debt basis
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quotes.map((quote) => {
              const isSelected = quote.planId === selectedPlanId;
              const isStandard = quote.planId === 'standard_10';

              return (
                <div
                  key={quote.planId}
                  onClick={() => setSelectedPlanId(quote.planId)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/90 shadow-md ring-1 ring-slate-900'
                      : isStandard
                      ? 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          isStandard
                            ? 'bg-rose-100 text-rose-800'
                            : quote.isRecommended
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isStandard ? 'Standard' : quote.isRecommended ? 'Recommended IDR' : 'IDR Plan'}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-bold text-indigo-600">Selected</span>
                      )}
                    </div>

                    <h5 className="font-bold text-sm text-slate-950">{quote.planName}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                      {quote.eligibilityNote}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-2 mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Starting Payment:</span>
                      <span className="text-lg font-extrabold font-mono tabular-nums text-slate-900">
                        ${quote.initialMonthlyPayment.toLocaleString()}/mo
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">120-Mo Total Paid:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${quote.totalPaid120.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">Forgiven Tax-Free:</span>
                      <span
                        className={`font-mono font-bold ${
                          quote.totalForgiven > 0 ? 'text-emerald-600 font-extrabold' : 'text-slate-400'
                        }`}
                      >
                        {quote.totalForgiven > 0 ? `+$${quote.totalForgiven.toLocaleString()}` : '$0 (Fully paid)'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Bar Comparison (Out of Pocket vs Forgiven) */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="font-bold text-sm text-slate-900">
            Visual Comparison: 10-Year Cumulative Out-of-Pocket vs Forgiven Debt
          </div>

          <div className="space-y-3">
            {/* Standard Plan Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>10-Year Standard Repayment</span>
                <span className="text-rose-700 font-mono">${standardQuote.totalPaid120.toLocaleString()} paid · $0 forgiven</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                <div className="bg-rose-500 h-full w-full" title="100% paid out-of-pocket" />
              </div>
            </div>

            {/* Recommended IDR Plan Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>{selectedQuote.planName}</span>
                <span className="text-emerald-700 font-mono">
                  ${selectedQuote.totalPaid120.toLocaleString()} paid · +${selectedQuote.totalForgiven.toLocaleString()} forgiven
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedQuote.totalPaid120 / (standardQuote.totalPaid120 || 1)) * 100
                    )}%`,
                  }}
                  title="Total out-of-pocket"
                />
                <div className="bg-emerald-500 h-full flex-1" title="Discharged tax-free" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>Out-of-Pocket Payment (IDR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Tax-Free Forgiveness (PSLF)</span>
            </div>
          </div>
        </div>

        {/* Action to proceed */}
        {onNavigateNext && (
          <div className="flex justify-end pt-2">
            <button
              onClick={onNavigateNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Next: View Your Final PSLF Action Roadmap</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
