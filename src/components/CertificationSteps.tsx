import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Clock,
  Send,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Building,
  Mail,
  UserCheck,
} from 'lucide-react';
import { BorrowerProfile } from '../types/counselor';

interface CertificationStepsProps {
  profile: BorrowerProfile;
  onOpenReport: () => void;
}

export const CertificationSteps: React.FC<CertificationStepsProps> = ({
  profile,
  onOpenReport,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const primaryEmployer = profile.employment[0];

  return (
    <section id="steps" className="scroll-mt-20 space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span>Pillar 4</span>
          <span aria-hidden="true">·</span>
          <span>Official Department of Education Action Roadmap</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          4. Next 3 Steps to Certify Your Employment
        </h2>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          Complete these three sequential steps on the official Department of Education portal
          (StudentAid.gov) to verify your public service employment and lock in your qualifying payment count.
        </p>
      </div>

      {/* Progress Checklist Tracker */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Official Portal Action Plan</h3>
          </div>
          <div className="text-xs font-medium text-slate-500">
            {Object.values(completedSteps).filter(Boolean).length} of 3 Steps Marked Complete
          </div>
        </div>

        {/* Step 1 */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            completedSteps[1]
              ? 'bg-slate-50/70 border-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                onClick={() => toggleStep(1)}
                className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  completedSteps[1]
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-slate-400 bg-white text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 1</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <h4 className="text-base font-bold text-slate-900">
                    Access the PSLF Help Tool on StudentAid.gov
                  </h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Log into{' '}
                  <a
                    href="https://studentaid.gov/pslf/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-slate-900 underline hover:text-indigo-600 inline-flex items-center gap-0.5"
                  >
                    StudentAid.gov/pslf <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  using your FSA ID (Username and Password). Under the <em>Manage Loans</em> menu, open the official{' '}
                  <strong>PSLF Help Tool</strong>.
                </p>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    Key Actions in Step 1:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>
                      <strong>Locate EIN on Box b of W-2:</strong> Enter your employer's Federal Employer Identification
                      Number ({primaryEmployer?.ein || 'XX-XXXXXXX'}). The Help Tool searches the national database of
                      eligible public service employers.
                    </li>
                    <li>
                      <strong>Accurate Employment Dates:</strong> Provide your exact start date (
                      {primaryEmployer?.startDate || 'YYYY-MM'}) and current status (or end date).
                    </li>
                    <li>
                      <strong>Average Hours Per Week:</strong> Enter your contracted weekly hours (
                      {primaryEmployer?.hoursPerWeek || 40} hrs/wk). Must be at least 30 hours to satisfy federal full-time requirements.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <a
              href="https://studentaid.gov/pslf/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <span>Launch PSLF Help Tool</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            completedSteps[2]
              ? 'bg-slate-50/70 border-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                onClick={() => toggleStep(2)}
                className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  completedSteps[2]
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-slate-400 bg-white text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 2</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <h4 className="text-base font-bold text-slate-900">
                    Select Electronic Signature & Route to Your Employer
                  </h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Inside the Help Tool, choose the <strong>Digital Signature</strong> (electronic signature) option.
                  This routes your form directly through secure DocuSign to your employer's human resources or payroll office.
                </p>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    Crucial Requirements for Electronic Routing:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>
                      <strong>Official Work Email Only:</strong> Provide the verified corporate or institutional work email
                      address of your HR signatory. Personal domains (@gmail.com, @yahoo.com) are automatically rejected.
                    </li>
                    <li>
                      <strong>Notify Your HR Representative:</strong> Alert your payroll/benefits coordinator to look out
                      for an automated email from <code>dse@docusign.net</code> on behalf of the U.S. Department of Education.
                    </li>
                    <li>
                      <strong>Paper / Wet-Ink Fallback:</strong> If your employer cannot use DocuSign, download the generated
                      PDF form, obtain an authorized physical ink or cryptographic digital signature, and manually upload it
                      via the StudentAid.gov upload portal.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            completedSteps[3]
              ? 'bg-slate-50/70 border-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                onClick={() => toggleStep(3)}
                className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  completedSteps[3]
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-slate-400 bg-white text-transparent'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 3</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <h4 className="text-base font-bold text-slate-900">
                    Confirm Submission and Monitor Your Qualifying Payment Tracker
                  </h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Once your employer completes the electronic signature, monitor your form processing in your{' '}
                  <strong>StudentAid.gov Activity Dashboard</strong>.
                </p>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Servicer Transfer & Payment Tracker Milestones:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>
                      <strong>Automated Servicer Transfer:</strong> If your loans are with a general commercial servicer
                      (e.g., Nelnet, Aidvantage), the Department of Education will automatically initiate the transfer of
                      your Direct Loans to the designated PSLF servicer.
                    </li>
                    <li>
                      <strong>Official Payment Count Tracker:</strong> Once processed, your account will feature the official{' '}
                      <strong>PSLF Qualifying Payment Count Tracker</strong> showing every certified month from 1 to 120.
                    </li>
                    <li>
                      <strong>Annual Recertification Discipline:</strong> Submit a new certification form every 12 months,
                      or immediately whenever you change employers, to keep your official count permanently verified.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counselor Best Practices & Pitfalls to Avoid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-slate-900">Common Certification Pitfalls to Avoid</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900">Contractor vs. Direct W-2 Employment</div>
            <p className="text-slate-600 leading-relaxed">
              Ensure you enter the EIN of your actual W-2 employer. If you work at a public hospital or school through an
              outside staffing agency, you are legally an employee of the agency—not the school. If the agency is for-profit,
              the employment is disqualified.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900">The 30-Hour Full-Time Standard</div>
            <p className="text-slate-600 leading-relaxed">
              Federal rules now establish a uniform 30-hour standard. If you work for multiple qualifying employers simultaneously
              (e.g., two part-time non-profit jobs at 15 hrs/wk each), their combined hours total 30+ and qualify you for PSLF.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Formal records: Always maintain copies of all signed PSLF forms and servicer count letters.
          </div>
          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <span>Print Official Counseling Evaluation Memo</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
