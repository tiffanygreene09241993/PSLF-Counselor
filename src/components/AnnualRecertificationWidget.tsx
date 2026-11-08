import React, { useState } from 'react';
import { BorrowerProfile } from '../types/counselor';
import { generateIdrRecertificationIcs, downloadIcsFile } from '../utils/icsGenerator';
import {
  Calendar,
  Download,
  CheckCircle2,
  Bell,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Building,
  Info,
} from 'lucide-react';

interface AnnualRecertificationWidgetProps {
  profile: BorrowerProfile;
}

export const AnnualRecertificationWidget: React.FC<AnnualRecertificationWidgetProps> = ({ profile }) => {
  // Common Federal Servicers
  const servicers = [
    'MOHELA (Higher Education Loan Authority of the State of MO)',
    'Aidvantage (Maximus Federal Services)',
    'Nelnet',
    'Edfinancial Services',
    'Default Resolution Group',
  ];

  // Default servicer from profile loans if available
  const detectedServicer = profile.loans[0]?.servicer || 'MOHELA';
  const initialServicerMatch = servicers.find((s) => s.toLowerCase().includes(detectedServicer.toLowerCase())) || servicers[0];

  const [selectedServicer, setSelectedServicer] = useState<string>(initialServicerMatch);

  // Month selector for annual renewal
  const currentMonth = new Date().getMonth(); // 0-indexed
  // Default to 6 months out or typical October anniversary
  const defaultMonthIndex = (currentMonth + 6) % 12;
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(defaultMonthIndex);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [isDownloaded, setIsDownloaded] = useState(false);

  // Compute calculated deadline date
  const computeDeadlineDate = (): Date => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetYear = currentYear;
    // If selected month is in the past for this year, schedule for next year
    if (selectedMonthIndex < currentMonth || (selectedMonthIndex === currentMonth && now.getDate() > 15)) {
      targetYear = currentYear + 1;
    }
    // Set deadline to the 15th of the selected month
    return new Date(targetYear, selectedMonthIndex, 15, 9, 0, 0);
  };

  const deadlineDate = computeDeadlineDate();

  const handleDownloadCalendar = () => {
    const cleanServicer = selectedServicer.split(' (')[0];
    const icsString = generateIdrRecertificationIcs({
      borrowerName: profile.borrowerName || 'Federal Borrower',
      servicerName: cleanServicer,
      deadlineDate: deadlineDate,
    });

    const filename = `IDR_Recertification_Deadline_${cleanServicer}_${deadlineDate.getFullYear()}-${String(selectedMonthIndex + 1).padStart(2, '0')}.ics`;
    downloadIcsFile(filename, icsString);

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 5000);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 sm:p-7 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-900 text-white shadow-2xs">
              <Calendar className="w-4 h-4 text-indigo-300" />
            </span>
            <h3 className="text-lg font-bold text-slate-950 tracking-tight">
              Annual Recertification Protection (.ics Calendar Generator)
            </h3>
            <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
              Automated 90d / 30d / 7d Alerts
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Federal regulations require annual IDR income recertification. Missing your deadline causes payments to spike to the 10-Year Standard amount and derails PSLF.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCalendar}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer hover:shadow-md"
          >
            <Download className="w-4 h-4 text-indigo-200" />
            <span>Download .ics Calendar Reminder</span>
          </button>
        </div>
      </div>

      {isDownloaded && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Calendar File Exported:</strong> Open the downloaded <span className="font-mono">.ics</span> file to automatically import the event with pre-configured 90-day, 30-day, and 7-day alarms into Google Calendar, Apple Calendar, or Microsoft Outlook.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            RFC 5545 EXPORTED
          </span>
        </div>
      )}

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Servicer Selector */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <label className="font-bold text-slate-900 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-600" />
            <span>Designated Federal Student Loan Servicer:</span>
          </label>
          <select
            value={selectedServicer}
            onChange={(e) => setSelectedServicer(e.target.value)}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-hidden font-medium text-slate-800"
          >
            {servicers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Check your dashboard at StudentAid.gov to confirm your current designated servicer.
          </p>
        </div>

        {/* Renewal Month Selector */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <label className="font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Annual Recertification Anniversary Month:</span>
          </label>
          <select
            value={selectedMonthIndex}
            onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-hidden font-medium text-slate-800"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>
                {m} (Scheduled: {m} 15, {idx < currentMonth ? new Date().getFullYear() + 1 : new Date().getFullYear()})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Target Deadline: <strong className="text-slate-900">{deadlineDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
          </p>
        </div>
      </div>

      {/* Alarm Timeline Cadence Breakdown */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-indigo-600" />
          <span>Automated Embedded Calendar Alarms (Standard RFC 5545 VALARM Sequence):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-indigo-900">
              <span>90 Days Prior</span>
              <span className="font-mono text-[10px] bg-indigo-200/80 px-1.5 py-0.5 rounded">TRIGGER:-P90D</span>
            </div>
            <p className="text-[11px] text-slate-700">
              Tax Document Retrieval: Pull your latest IRS Form 1040 / Adjusted Gross Income transcript to ensure tax figures are ready.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span>30 Days Prior</span>
              <span className="font-mono text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded">TRIGGER:-P30D</span>
            </div>
            <p className="text-[11px] text-slate-700">
              Submit Recertification: Complete electronic renewal via StudentAid.gov/idr with IRS direct data consent to beat servicer processing backlogs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-rose-900">
              <span>7 Days Prior</span>
              <span className="font-mono text-[10px] bg-rose-200/80 px-1.5 py-0.5 rounded">TRIGGER:-P7D</span>
            </div>
            <p className="text-[11px] text-slate-700">
              Final Verification: Log into your servicer portal to verify receipt and confirmation, preventing payment recalculation to standard rate.
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Protection Callout */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Regulatory Protection (34 CFR § 685.209 & § 685.221):</strong> If you submit your documentation at least 30 days prior to your deadline, your servicer is prohibited from capitalized interest penalties or payment increases even if servicer backlogs delay final approval.
        </div>
      </div>
    </div>
  );
};
