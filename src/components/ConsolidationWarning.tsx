import React, { useState, useRef } from 'react';
import { BorrowerProfile, LoanProgram, StudentLoan } from '../types/counselor';
import { analyzeConsolidation, isLoanNativelyPSLFEligible } from '../utils/calculator';
import { parseStudentAidData, SAMPLE_MY_STUDENT_DATA } from '../utils/studentAidParser';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Scale,
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
  Plus,
  Trash2,
  Calendar,
  Check,
  UploadCloud,
  FileText,
  Sparkles,
  ClipboardPaste,
} from 'lucide-react';

interface ConsolidationWarningProps {
  profile: BorrowerProfile;
  onUpdateProfile: (updated: BorrowerProfile) => void;
  onNavigateNext?: () => void;
  onOpenDoubleConsolidation: () => void;
}

export const ConsolidationWarning: React.FC<ConsolidationWarningProps> = ({
  profile,
  onUpdateProfile,
  onNavigateNext,
  onOpenDoubleConsolidation,
}) => {
  const analysis = analyzeConsolidation(profile.loans);
  const hasParentPlus = profile.loans.some((l) => l.program === 'Direct PLUS (Parent)');

  // Input method mode: 'manual' | 'file_upload'
  const [entryMode, setEntryMode] = useState<'manual' | 'file_upload'>('manual');
  const [pastedData, setPastedData] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loan types for quick toggle/add
  const loanTypeConfigs: {
    program: LoanProgram;
    label: string;
    category: 'Direct' | 'FFEL' | 'Perkins' | 'Parent PLUS' | 'Private';
    isNativelyEligible: boolean;
    requiresConsolidation: boolean;
    defaultRate: number;
  }[] = [
    {
      program: 'Direct Subsidized',
      label: 'Direct Subsidized Stafford',
      category: 'Direct',
      isNativelyEligible: true,
      requiresConsolidation: false,
      defaultRate: 4.8,
    },
    {
      program: 'Direct Unsubsidized',
      label: 'Direct Unsubsidized Stafford',
      category: 'Direct',
      isNativelyEligible: true,
      requiresConsolidation: false,
      defaultRate: 5.3,
    },
    {
      program: 'Direct PLUS (Grad/Prof)',
      label: 'Direct PLUS (Graduate)',
      category: 'Direct',
      isNativelyEligible: true,
      requiresConsolidation: false,
      defaultRate: 6.8,
    },
    {
      program: 'FFEL Subsidized Stafford',
      label: 'Legacy FFEL Subsidized',
      category: 'FFEL',
      isNativelyEligible: false,
      requiresConsolidation: true,
      defaultRate: 6.8,
    },
    {
      program: 'FFEL Unsubsidized Stafford',
      label: 'Legacy FFEL Unsubsidized',
      category: 'FFEL',
      isNativelyEligible: false,
      requiresConsolidation: true,
      defaultRate: 6.8,
    },
    {
      program: 'Federal Perkins',
      label: 'Federal Perkins Loan',
      category: 'Perkins',
      isNativelyEligible: false,
      requiresConsolidation: true,
      defaultRate: 5.0,
    },
    {
      program: 'Direct PLUS (Parent)',
      label: 'Direct Parent PLUS',
      category: 'Parent PLUS',
      isNativelyEligible: true,
      requiresConsolidation: false,
      defaultRate: 7.2,
    },
  ];

  const handleToggleLoanType = (config: typeof loanTypeConfigs[0]) => {
    const existingIndex = profile.loans.findIndex((l) => l.program === config.program);
    if (existingIndex >= 0) {
      onUpdateProfile({
        ...profile,
        loans: profile.loans.filter((_, idx) => idx !== existingIndex),
      });
    } else {
      const newLoan: StudentLoan = {
        id: `loan-${Date.now()}`,
        name: config.label,
        program: config.program,
        balance: 15000,
        interestRate: config.defaultRate,
        qualifyingPaymentsMade: config.isNativelyEligible ? 24 : 0,
        servicer: config.isNativelyEligible ? 'MOHELA' : 'Commercial Servicer',
      };
      onUpdateProfile({
        ...profile,
        loans: [...profile.loans, newLoan],
      });
    }
  };

  const handleUpdateLoanBalance = (id: string, balance: number) => {
    onUpdateProfile({
      ...profile,
      loans: profile.loans.map((l) => (l.id === id ? { ...l, balance: Math.max(0, balance) } : l)),
    });
  };

  const handleUpdateLoanPayments = (id: string, payments: number) => {
    onUpdateProfile({
      ...profile,
      loans: profile.loans.map((l) =>
        l.id === id ? { ...l, qualifyingPaymentsMade: Math.min(120, Math.max(0, payments)) } : l
      ),
    });
  };

  const handleDeleteLoan = (id: string) => {
    onUpdateProfile({
      ...profile,
      loans: profile.loans.filter((l) => l.id !== id),
    });
  };

  // StudentAid.gov file parsing logic
  const processRawData = (text: string) => {
    const parsedLoans = parseStudentAidData(text);
    if (parsedLoans.length === 0) {
      setImportNotice('No student loan entries could be detected. Please verify the file or paste format.');
      return;
    }

    const nonDirect = parsedLoans.filter((l) => !isLoanNativelyPSLFEligible(l.program));
    const totalBalance = parsedLoans.reduce((sum, l) => sum + l.balance, 0);

    onUpdateProfile({
      ...profile,
      loans: parsedLoans,
    });

    setImportNotice(
      `Successfully extracted ${parsedLoans.length} loans ($${totalBalance.toLocaleString()}). ${
        nonDirect.length > 0
          ? `${nonDirect.length} non-Direct loan(s) detected requiring consolidation.`
          : 'All parsed loans are Direct Loans.'
      }`
    );
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedData(content);
        processRawData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleData = () => {
    setPastedData(SAMPLE_MY_STUDENT_DATA);
    processRawData(SAMPLE_MY_STUDENT_DATA);
  };

  return (
    <section id="step-2" className="scroll-mt-24 space-y-8">
      {/* Section Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span>Step 2 of 4</span>
          <span aria-hidden="true">·</span>
          <span>Federal Debt Triage & Consolidation Diagnostic</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          2. Loan Audit & Consolidation Warning
        </h2>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          By federal statute (HEA Section 455(m)), PSLF forgiveness is legally restricted to the
          William D. Ford Direct Loan Program. Non-Direct loans must be consolidated into Direct Loans to receive payment credits.
        </p>
      </div>

      {/* Dynamic Warning Alert: Non-Direct Loans Detected */}
      {analysis.requiresConsolidation ? (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/90 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-200 text-amber-900 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  Consolidation Required
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  {analysis.nonDirectLoanCount} Legacy Loan(s) · ${analysis.nonDirectBalance.toLocaleString()} Balance
                </span>
              </div>
              <h3 className="text-xl font-bold text-amber-950">
                Action Mandated: FFEL or Perkins Loans Will Not Earn PSLF Credit As-Is
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                Payments made on unconsolidated FFEL (Stafford) or Federal Perkins loans <strong>do not count</strong> toward the
                120 payments needed for PSLF. You must submit a <strong>Direct Consolidation Loan Application</strong> on{' '}
                <a
                  href="https://studentaid.gov/loan-consolidation/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline hover:text-amber-950 inline-flex items-center gap-1"
                >
                  StudentAid.gov <ExternalLink className="w-3.5 h-3.5" />
                </a>{' '}
                to convert them into an eligible Direct Loan.
              </p>
            </div>
          </div>

          {/* Weighted Average Impact Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold text-sm text-slate-900">Permanent Regulations: Weighted Payment Count</div>
              <p className="text-slate-600">
                Consolidating no longer resets your progress to zero. Your new Direct Consolidation Loan will carry an
                estimated <strong>{analysis.weightedPaymentEstimate} qualifying payments</strong> based on the weighted
                balance of your existing loans.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold text-sm text-slate-900">Consolidated Fixed Interest Rate</div>
              <p className="text-slate-600">
                The new loan rate will be the weighted average of your consolidated balances rounded up to the nearest
                eighth of a percent: <strong className="font-mono">{analysis.directConsolidationRate.toFixed(3)}%</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-6 shadow-xs flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold text-emerald-800">Direct Loan Compliance Verified</div>
            <h3 className="text-lg font-bold text-emerald-950 mt-0.5">
              All Active Loans Are Qualified Direct Loans
            </h3>
            <p className="mt-1 text-sm text-emerald-900 leading-relaxed">
              Your portfolio consists entirely of William D. Ford Federal Direct Loans. No consolidation is required
              to make your loans eligible.
            </p>
          </div>
        </div>
      )}

      {/* Parent PLUS Loophole Callout Card */}
      {hasParentPlus && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50/70 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Parent PLUS Strategic Opportunity</span>
            </div>
            <h3 className="text-lg font-bold text-indigo-950">
              Double-Consolidation Loophole Available for Parent PLUS Borrowers
            </h3>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Parent PLUS loans are ordinarily locked into <strong>Income-Contingent Repayment (ICR)</strong> at 20% of
              discretionary income. Executing a two-step double consolidation removes this restriction, unlocking
              <strong> SAVE / PAYE / IBR (5–10% of discretionary income)</strong> and saving thousands prior to PSLF discharge.
            </p>
          </div>

          <button
            onClick={onOpenDoubleConsolidation}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>View Double-Consolidation Guide</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Entry Mode Toggle (Manual vs StudentAid.gov Data File Support) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Student Loan Inventory & Data Extraction</h3>
            <p className="text-sm text-slate-500">
              Select your loan types manually or upload your official MyStudentData.txt from StudentAid.gov.
            </p>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setEntryMode('manual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                entryMode === 'manual'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Select Manually
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('file_upload')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                entryMode === 'file_upload'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload MyStudentData.txt</span>
            </button>
          </div>
        </div>

        {/* Tab 1: File Drop Zone & Raw Paste Extractor */}
        {entryMode === 'file_upload' ? (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/60'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  Drop your official <span className="font-mono text-indigo-600">MyStudentData.txt</span> here or click to browse
                </div>
                <div className="text-xs text-slate-500">
                  Download from StudentAid.gov (Dashboard &gt; My Aid &gt; Download My Student Data)
                </div>
              </div>
            </div>

            {/* Paste Box Alternative */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
                  <span>Or Paste Loan Summary / Raw Text:</span>
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Load Sample MyStudentData.txt Demo
                </button>
              </div>

              <textarea
                rows={4}
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder="Paste the text from your MyStudentData.txt file or loan servicer summary here..."
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => processRawData(pastedData)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Extract Loan Programs & Balances
                </button>
              </div>
            </div>

            {/* Extraction Feedback Notice */}
            {importNotice && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="font-medium">{importNotice}</div>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Manual Selection (Toggle cards) */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {loanTypeConfigs.map((config) => {
                const isSelected = profile.loans.some((l) => l.program === config.program);

                return (
                  <button
                    key={config.program}
                    type="button"
                    onClick={() => handleToggleLoanType(config)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? config.requiresConsolidation
                          ? 'bg-amber-50/90 border-amber-300 shadow-xs'
                          : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          isSelected
                            ? config.requiresConsolidation
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-800 text-emerald-400'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {config.category}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? config.requiresConsolidation
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-500 text-white'
                            : 'border border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>

                    <div>
                      <div className={`text-xs font-bold ${isSelected && !config.requiresConsolidation ? 'text-white' : 'text-slate-900'}`}>
                        {config.label}
                      </div>
                      <div className={`text-[11px] mt-1 ${isSelected && !config.requiresConsolidation ? 'text-slate-300' : 'text-slate-500'}`}>
                        {config.isNativelyEligible
                          ? 'Natively Direct Eligible'
                          : 'Requires Direct Consolidation'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Loan Balances & Payment Adjusters */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-700">Audit Active Loan Balances & Payments:</div>
          <div className="space-y-3">
            {profile.loans.map((loan) => {
              const isDirect = isLoanNativelyPSLFEligible(loan.program);

              return (
                <div
                  key={loan.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDirect
                      ? 'bg-white border-slate-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{loan.name}</span>
                      {isDirect ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Direct
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          Must Consolidate
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Servicer: {loan.servicer} · {loan.interestRate}% interest
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold">Balance ($)</label>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={loan.balance}
                        onChange={(e) => handleUpdateLoanBalance(loan.id, Number(e.target.value))}
                        className="w-28 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded text-right focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="text-right">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold">Payments</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={loan.qualifyingPaymentsMade}
                        onChange={(e) => handleUpdateLoanPayments(loan.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded text-right focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteLoan(loan.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer mt-3"
                      title="Remove loan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action to proceed */}
        {onNavigateNext && (
          <div className="flex justify-end pt-2">
            <button
              onClick={onNavigateNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Next: Compare IDR Repayment Plans & Savings</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
