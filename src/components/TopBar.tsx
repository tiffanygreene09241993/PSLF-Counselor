import React from 'react';
import {
  ShieldCheck,
  Printer,
  Sparkles,
  Building2,
  GraduationCap,
  Calculator,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import { ReadinessScoreResult } from '../types/counselor';

interface TopBarProps {
  activeStep: number;
  onSelectStep: (stepNumber: number) => void;
  onOpenReport: () => void;
  onOpenRules: () => void;
  readiness: ReadinessScoreResult;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeStep,
  onSelectStep,
  onOpenReport,
  onOpenRules,
  readiness,
}) => {
  // SVG circular score ring math
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (readiness.score / 100) * circumference;

  const ringColor =
    readiness.status === 'green'
      ? '#059669' // emerald-600
      : readiness.status === 'amber'
      ? '#d97706' // amber-600
      : '#e11d48'; // rose-600

  const steps = [
    { number: 1, label: 'Employer Check', mobileLabel: 'Employer', icon: Building2 },
    { number: 2, label: 'Loan Audit & Consolidation', mobileLabel: 'Loans', icon: GraduationCap },
    { number: 3, label: 'Repayment & IDR Savings', mobileLabel: 'Repayment', icon: Calculator },
    { number: 4, label: 'Action Roadmap', mobileLabel: 'Roadmap', icon: FileCheck },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Upper Main Navbar: Responsive 3-Zone Contract */}
      <header className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Brand title & Icon (compact on mobile) */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-2xs shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onSelectStep(1);
              }}
              className="text-xs sm:text-base font-extrabold tracking-tight text-slate-900 truncate hover:text-slate-700 transition-colors"
            >
              <span className="sm:hidden">PSLF Counselor</span>
              <span className="hidden sm:inline">PSLF & Debt Relief Counselor</span>
            </a>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-700 font-semibold">2026 Regulations</span>
              <span aria-hidden="true">·</span>
              <span>34 CFR § 685.219 Compliant</span>
            </div>
          </div>
        </div>

        {/* Readiness Score Ring Widget (Compact on mobile) */}
        <div
          onClick={() => onSelectStep(4)}
          title={`Readiness Score: ${readiness.score}/100 (${readiness.statusBadge}). Click to view your roadmap.`}
          className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 -rotate-90 transform" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="2.8"
                fill="none"
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                stroke={ringColor}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute font-mono text-[9px] sm:text-[10px] font-bold text-slate-900">
              {readiness.score}%
            </span>
          </div>

          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[11px] font-bold text-slate-900 leading-tight">
              {readiness.score}% PSLF Ready
            </span>
            <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[100px]">
              {readiness.statusBadge}
            </span>
          </div>
        </div>

        {/* Zone 3: Primary Action (Export PDF/Print) & Rules trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenRules}
            className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            title="View Statutory Rulebook"
          >
            <BookOpen className="w-3.5 h-3.5 sm:mr-1 text-slate-500" />
            <span className="hidden md:inline">Rulebook</span>
          </button>

          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="sm:hidden">Export</span>
            <span className="hidden sm:inline">Export Action Plan</span>
          </button>
        </div>
      </header>

      {/* Responsive Stepper Navigation Bar */}
      <nav aria-label="Counseling Steps" className="border-t border-slate-100 bg-slate-50/80 px-2 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-3">
          {steps.map((step) => {
            const isActive = activeStep === step.number;
            const isCompleted = activeStep > step.number;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => onSelectStep(step.number)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 sm:py-1.5 px-1.5 sm:px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-950 font-bold shadow-2xs border border-slate-200'
                    : isCompleted
                    ? 'text-emerald-700 hover:bg-white/70'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-bold shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓' : step.number}
                </div>
                <span className="sm:hidden text-[11px]">{step.mobileLabel}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
