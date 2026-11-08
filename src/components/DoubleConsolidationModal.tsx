import React from 'react';
import { X, Layers, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink, HelpCircle } from 'lucide-react';

interface DoubleConsolidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoubleConsolidationModal: React.FC<DoubleConsolidationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Parent PLUS Double-Consolidation Protocol</h3>
              <p className="text-xs text-slate-400">Strategic workaround to unlock SAVE, PAYE, and IBR for Parent PLUS borrowers</p>
            </div>
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
          {/* Statutory Problem */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-950">
            <div className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              The Parent PLUS Problem: Trapped in ICR
            </div>
            <p className="leading-relaxed">
              By federal statute, Direct Parent PLUS loans cannot directly enroll in SAVE, PAYE, or IBR.
              Standard consolidation leaves the loan tagged as a "Parent PLUS Consolidation", restricting it exclusively
              to <strong>Income-Contingent Repayment (ICR)</strong>, which demands <strong>20% of discretionary income</strong>.
            </p>
            <p className="font-semibold text-amber-900">
              Double Consolidation cleanses the Parent PLUS flag, unlocking SAVE (5-10% of discretionary income) and saving
              borrowers hundreds of dollars monthly prior to PSLF discharge.
            </p>
          </div>

          {/* 3-Step Architecture */}
          <div className="space-y-4">
            <div className="font-bold text-slate-900 text-base">The 3-Phase Execution Roadmap</div>

            {/* Phase 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Phase 1</span>
                <span className="text-xs font-medium text-slate-500 font-mono">Paper Applications</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Split Loans & Submit to Two Different Servicers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Separate your Parent PLUS loans into two batches (Group A and Group B). Mail one paper consolidation application
                to <strong>Servicer 1</strong> (e.g., Nelnet) and the second paper consolidation application to <strong>Servicer 2</strong> (e.g., Aidvantage).
                Wait 6–8 weeks for both consolidation loans to fully disburse.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Phase 2</span>
                <span className="text-xs font-medium text-slate-500 font-mono">Online Application</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Consolidate the Two New Consolidation Loans Together</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once Group A and Group B are disbursed as two Direct Consolidation Loans, log into <strong>StudentAid.gov</strong>.
                Submit an online Direct Consolidation application to consolidate Group A and Group B together into a single final loan
                assigned to <strong>MOHELA</strong> (the designated PSLF servicer).
              </p>
            </div>

            {/* Phase 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Phase 3</span>
                <span className="text-xs font-medium text-emerald-600 font-semibold">Repayment Enrollment</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Enroll the Final Loan into SAVE / PAYE / IBR</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The final consolidated loan now has the statutory profile of a regular Direct Consolidation loan, without the
                restrictive Parent PLUS tag. Submit an IDR application selecting <strong>SAVE</strong> or <strong>IBR</strong>.
                Every subsequent monthly payment made while employed in public service qualifies toward your 120 PSLF payments.
              </p>
            </div>
          </div>

          {/* Timeline & Legal Notice */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900">Regulatory Timeline Deadline:</div>
            <p>
              The U.S. Department of Education has published regulations closing the double-consolidation loophole.
              Borrowers must ensure all phases are initiated promptly so the final consolidation completes within the regulatory window.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <a
            href="https://studentaid.gov/loan-consolidation/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline inline-flex items-center gap-1"
          >
            <span>StudentAid.gov Consolidation Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
