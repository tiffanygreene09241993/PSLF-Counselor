import React from 'react';
import { X, BookOpen, Scale, HelpCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PslfRulesGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PslfRulesGuide: React.FC<PslfRulesGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">PSLF Statutory & Regulatory Reference Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-sm text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Rule 1 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" />
              1. The 30-Hour Full-Time Definition (34 CFR § 685.219)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Effective under the Department of Education's updated regulations, full-time employment is defined as working
              an average of at least <strong>30 hours per week</strong>, or whatever number of hours the employer considers
              full-time if greater. Crucially, if you work for multiple qualifying employers simultaneously (for instance,
              two adjunct teaching roles at 15 hours each), you can combine the hours to satisfy the 30-hour benchmark.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" />
              2. Weighted Average on Direct Consolidation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prior to modern regulatory reforms, consolidating loans with existing qualifying counts wiped the counter
              back to zero. Under the permanent regulations, borrowers consolidating loans receive a <strong>weighted average
              of qualifying payments</strong> based on the principal balance of each loan consolidated.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" />
              3. Tax-Free Status of PSLF Forgiveness (26 U.S.C. § 108(f))
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlike standard 20- or 25-year IDR forgiveness (which historically carried a potential "tax bomb" under IRC § 61),
              Public Service Loan Forgiveness is <strong>permanently excluded from gross income</strong> under Internal Revenue Code
              Section 108(f). You will owe $0 in federal income taxes on the forgiven principal and accrued interest. Furthermore,
              virtually all states conform to § 108(f) and levy zero state tax.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" />
              4. Married Filing Separately (MFS) Strategy
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under IDR plans (SAVE, PAYE, IBR), if a borrower is married and files taxes as Married Filing Separately (MFS),
              the Department of Education will calculate monthly payments based <em>solely</em> on the borrower's individual
              Adjusted Gross Income. This shields higher spousal incomes from inflating monthly student loan payments.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" />
              5. PSLF Buyback Opportunity
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you have past periods of deferment or forbearance during which you were employed full-time by a qualifying
              employer, you may be eligible to "buy back" those months once you have reached 120 total certified employment months.
              You pay what your IDR payment would have been during those months to immediately earn final forgiveness.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
