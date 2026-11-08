import React, { useState } from 'react';
import { BorrowerProfile } from '../types/counselor';
import { getPovertyGuideline } from '../data/povertyGuidelines';
import {
  Users,
  DollarSign,
  Scale,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface DualTaxStrategyComparisonProps {
  profile: BorrowerProfile;
  onUpdateSpouseDetails?: (spouseAgi: number, spouseDebt: number) => void;
}

export const DualTaxStrategyComparison: React.FC<DualTaxStrategyComparisonProps> = ({
  profile,
  onUpdateSpouseDetails,
}) => {
  const [spouseAgi, setSpouseAgi] = useState<number>(profile.spouseAgi || 65000);
  const [spouseDebt, setSpouseDebt] = useState<number>(25000);
  const [estimatedExtraTax, setEstimatedExtraTax] = useState<number>(1400); // Typical MFS tax penalty per year

  const borrowerDebt = profile.loans.reduce((sum, l) => sum + l.balance, 0);
  const borrowerAgi = profile.agi;

  // 1. Joint Scenario (MFJ)
  const jointAgi = borrowerAgi + spouseAgi;
  const jointFamilySize = Math.max(2, profile.familySize); // at least 2 for married
  const jointPoverty = getPovertyGuideline(jointFamilySize, profile.region);
  const jointDiscretionary = Math.max(0, jointAgi - 1.5 * jointPoverty);
  const totalHouseholdPayment = Math.round((jointDiscretionary * 0.10) / 12);

  const totalHouseholdDebt = borrowerDebt + spouseDebt;
  const borrowerDebtShare = totalHouseholdDebt > 0 ? borrowerDebt / totalHouseholdDebt : 1;
  const borrowerJointPayment = Math.round(totalHouseholdPayment * borrowerDebtShare);
  const borrowerJoint120 = borrowerJointPayment * 120;

  // 2. Separate Scenario (MFS)
  // Family size excludes spouse under MFS
  const separateFamilySize = Math.max(1, profile.familySize - 1);
  const separatePoverty = getPovertyGuideline(separateFamilySize, profile.region);
  const separateDiscretionary = Math.max(0, borrowerAgi - 1.5 * separatePoverty);
  const borrowerSeparatePayment = Math.round((separateDiscretionary * 0.10) / 12);
  const borrowerSeparate120 = borrowerSeparatePayment * 120;

  // Financial deltas
  const monthlyLoanSavings = borrowerJointPayment - borrowerSeparatePayment;
  const annualLoanSavings = monthlyLoanSavings * 12;
  const netAnnualHouseholdBenefit = annualLoanSavings - estimatedExtraTax;
  const isMfsAdvantageous = netAnnualHouseholdBenefit > 0;

  const handleSpouseAgiChange = (val: number) => {
    setSpouseAgi(val);
    if (onUpdateSpouseDetails) onUpdateSpouseDetails(val, spouseDebt);
  };

  const handleSpouseDebtChange = (val: number) => {
    setSpouseDebt(val);
    if (onUpdateSpouseDetails) onUpdateSpouseDetails(spouseAgi, val);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-white shadow-2xs">
              <Users className="w-4 h-4 text-emerald-400" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Dual-Scenario Tax Strategy Comparison: MFS vs. MFJ
            </h3>
            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full">
              Higher Education Act § 493C
            </span>
          </div>
          <p className="text-xs text-slate-600">
            For married borrowers, choosing Married Filing Separately (MFS) versus Married Filing Jointly (MFJ) is often the single largest variable determining your monthly IDR payment.
          </p>
        </div>

        <div className="shrink-0">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
              isMfsAdvantageous
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              {isMfsAdvantageous
                ? 'Filing Separately (MFS) Recommended'
                : 'Filing Jointly (MFJ) Recommended'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Spouse Financial Inputs */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>Spousal Income & Debt Variables:</span>
          <span className="text-[11px] text-slate-500 font-normal">Adjust values to model your household</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Spouse AGI */}
          <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Spouse Annual AGI:</label>
              <span className="font-mono font-bold text-slate-900">${spouseAgi.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="2500"
              value={spouseAgi}
              onChange={(e) => handleSpouseAgiChange(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$0</span>
              <span>$100k</span>
              <span>$200k</span>
            </div>
          </div>

          {/* Spouse Federal Student Debt */}
          <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Spouse Federal Debt:</label>
              <span className="font-mono font-bold text-slate-900">${spouseDebt.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="2500"
              value={spouseDebt}
              onChange={(e) => handleSpouseDebtChange(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$0 (No Debt)</span>
              <span>$75k</span>
              <span>$150k</span>
            </div>
          </div>

          {/* Estimated Extra Tax Penalty */}
          <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Estimated MFS Tax Penalty:</label>
              <span className="font-mono font-bold text-slate-900">${estimatedExtraTax.toLocaleString()}/yr</span>
            </div>
            <input
              type="range"
              min="0"
              max="4000"
              step="100"
              value={estimatedExtraTax}
              onChange={(e) => setEstimatedExtraTax(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$0</span>
              <span>$1,400 (Avg)</span>
              <span>$4,000</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          *Under HEA § 493C, filing separately excludes spousal income from your IDR calculation entirely. The estimated MFS tax penalty accounts for lost tax deductions (e.g. student loan interest deduction, childcare credits, and tax bracket divergences).
        </p>
      </div>

      {/* Side-by-Side Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A: Married Filing Jointly */}
        <div
          className={`p-5 rounded-xl border transition-all space-y-3 ${
            !isMfsAdvantageous
              ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              Scenario A: Married Filing Jointly (MFJ)
            </span>
            {!isMfsAdvantageous && (
              <span className="text-xs font-bold text-indigo-700">Optimal Option</span>
            )}
          </div>

          <div>
            <div className="text-xs text-slate-600">Borrower Monthly IDR Payment:</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-0.5">
              ${borrowerJointPayment.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Total 120-Month Cost: <strong className="text-slate-800">${borrowerJoint120.toLocaleString()}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Combined Household AGI:</span>
              <span className="font-mono font-semibold text-slate-900">${jointAgi.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Household IDR Payment:</span>
              <span className="font-mono font-semibold text-slate-900">${totalHouseholdPayment.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span>Borrower Proportional Debt Share:</span>
              <span className="font-mono font-semibold text-slate-900">
                {Math.round(borrowerDebtShare * 100)}% (${borrowerDebt.toLocaleString()} of ${totalHouseholdDebt.toLocaleString()})
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            If your spouse has federal student debt, the Department of Education prorates your monthly payment based on your share of the total household debt.
          </p>
        </div>

        {/* Scenario B: Married Filing Separately */}
        <div
          className={`p-5 rounded-xl border transition-all space-y-3 ${
            isMfsAdvantageous
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/50 shadow-xs'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Scenario B: Married Filing Separately (MFS)
            </span>
            {isMfsAdvantageous && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
                Recommended Strategy
              </span>
            )}
          </div>

          <div>
            <div className="text-xs text-slate-600">Borrower Monthly IDR Payment:</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-0.5">
              ${borrowerSeparatePayment.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-emerald-900 font-semibold mt-1">
              Monthly Student Loan Savings:{' '}
              <span className="font-mono font-bold">
                {monthlyLoanSavings >= 0 ? `+$${monthlyLoanSavings.toLocaleString()}/mo` : `-$${Math.abs(monthlyLoanSavings).toLocaleString()}/mo`}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Considered AGI (Borrower Only):</span>
              <span className="font-mono font-semibold text-slate-900">${borrowerAgi.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Spouse Income Treated as:</span>
              <span className="font-mono font-bold text-emerald-700">$0 (Excluded by Law)</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Extra Annual Tax Liability:</span>
              <span className="font-mono font-semibold text-rose-700">-${estimatedExtraTax.toLocaleString()}/yr</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
            Filing separately legally isolates your income, but you forgo certain joint tax benefits. Review the net household analysis below.
          </p>
        </div>
      </div>

      {/* Net Household Analysis Callout */}
      <div
        className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isMfsAdvantageous
            ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
            : 'bg-indigo-50 text-indigo-950 border-indigo-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Receipt className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <div className="font-bold text-sm">
              {isMfsAdvantageous
                ? `Net Annual Household Gain from Filing Separately: +$${netAnnualHouseholdBenefit.toLocaleString()}/year`
                : `Net Household Advantage from Filing Jointly: Saves ~$${Math.abs(netAnnualHouseholdBenefit).toLocaleString()}/year`}
            </div>
            <p className="text-[11px] mt-0.5 opacity-90">
              {isMfsAdvantageous
                ? `Your student loan savings ($${annualLoanSavings.toLocaleString()}/yr) exceed the estimated extra tax burden ($${estimatedExtraTax.toLocaleString()}/yr) by $${netAnnualHouseholdBenefit.toLocaleString()}.`
                : `The student loan payment difference is outweighed by the tax benefits of filing jointly with your spouse.`}
            </p>
          </div>
        </div>

        <div className="shrink-0 font-mono font-bold text-sm bg-white px-3 py-1.5 rounded-lg border shadow-2xs">
          {isMfsAdvantageous ? `+ $${(netAnnualHouseholdBenefit / 12).toFixed(0)}/mo Net` : 'MFJ Optimal'}
        </div>
      </div>
    </div>
  );
};
