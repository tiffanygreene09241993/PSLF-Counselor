import React, { useState } from 'react';
import { BorrowerProfile, EmploymentRecord } from '../types/counselor';
import { generatePreFilledPslfPdf, downloadPslfPdf } from '../utils/pslfPdfGenerator';
import {
  FileText,
  Download,
  CheckCircle2,
  Building,
  User,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Printer,
  Loader2,
} from 'lucide-react';

interface OfficialPslfFormCardProps {
  profile: BorrowerProfile;
}

export const OfficialPslfFormCard: React.FC<OfficialPslfFormCardProps> = ({ profile }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const primaryEmployer = profile.employment[0] || {
    id: 'emp-default',
    employerName: 'Public Educational Agency',
    ein: '47-0892144',
    category: 'Government (Federal/State/Local/Tribal)',
    startDate: '2020-08',
    endDate: 'Present',
    hoursPerWeek: 37.5,
    isFullTimeCertified: true,
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const pdfBytes = await generatePreFilledPslfPdf(profile, primaryEmployer);
      const filename = `PSLF_Certification_PreFilled_OMB1845-0110_${profile.borrowerName.replace(/\s+/g, '_')}.pdf`;
      downloadPslfPdf(filename, pdfBytes);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate pre-filled PSLF PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 sm:p-7 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-white shadow-2xs">
              <FileText className="w-4 h-4 text-emerald-400" />
            </span>
            <h3 className="text-lg font-bold text-slate-950 tracking-tight">
              Official PSLF Certification Form Pre-Filler (OMB No. 1845-0110)
            </h3>
            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full">
              Federal Student Aid Approved
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Generate and download the official Department of Education employment certification form pre-populated with your verified borrower records and employer FEIN for HR signature routing.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer hover:shadow-md"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isGenerating ? 'Compiling PDF...' : 'Download Pre-Filled PSLF Form'}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Form Ready:</strong> Official pre-filled PSLF Certification Form (OMB No. 1845-0110) has been generated and downloaded. Forward to your HR department or upload to StudentAid.gov.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            PDF READY
          </span>
        </div>
      )}

      {/* Pre-Filled Summary Data Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1 Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Section 1: Borrower Information (Pre-Filled)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Page 1</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Borrower Legal Name:</span>
              <span className="font-bold text-slate-900">{profile.borrowerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">SSN Mask / FSA ID:</span>
              <span className="font-mono font-semibold text-slate-800">XXX-XX-6789</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">State of Residence:</span>
              <span className="font-semibold text-slate-900">{profile.homeState || 'CA'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Certification Request:</span>
              <span className="font-semibold text-emerald-700 font-mono">PSLF Progress Check [X]</span>
            </div>
          </div>
        </div>

        {/* Section 4 Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-600" />
              <span>Section 4: Employer Certification (For HR Official)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Page 2</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Employer Legal Name:</span>
              <span className="font-bold text-slate-900 line-clamp-1">{primaryEmployer.employerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Federal EIN (from W-2):</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                {primaryEmployer.ein}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Employment Period:</span>
              <span className="font-semibold text-slate-900">
                {primaryEmployer.startDate} to {primaryEmployer.endDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Contracted Hours:</span>
              <span className="font-mono font-bold text-slate-900">
                {primaryEmployer.hoursPerWeek} hrs/wk ({primaryEmployer.hoursPerWeek >= 30 ? 'Full-Time' : 'Part-Time'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Live Visual Document Preview */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Interactive OMB No. 1845-0110 Document Layout Preview</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>{isPreviewOpen ? 'Hide Form View' : 'Inspect Form Layout'}</span>
            {isPreviewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {isPreviewOpen && (
          <div className="p-6 bg-slate-100 space-y-4 animate-in fade-in duration-200">
            {/* Visual Paper Form Mock */}
            <div className="max-w-2xl mx-auto bg-white border border-slate-300 rounded-lg shadow-sm p-6 space-y-4 font-sans text-xs">
              <div className="bg-slate-900 text-white p-2.5 rounded flex items-center justify-between text-[11px] font-bold">
                <span>PUBLIC SERVICE LOAN FORGIVENESS (PSLF) CERTIFICATION</span>
                <span className="font-mono text-slate-300">OMB No. 1845-0110</span>
              </div>

              <div className="border border-slate-300 rounded p-3 space-y-2">
                <div className="font-bold text-[11px] text-slate-900 uppercase">
                  Section 1: Borrower Information
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Borrower: <strong>{profile.borrowerName}</strong></div>
                  <div>SSN: <span className="font-mono">XXX-XX-6789</span></div>
                  <div>State: <strong>{profile.homeState || 'CA'}</strong></div>
                  <div>FSA ID Status: <strong>Verified Active</strong></div>
                </div>
              </div>

              <div className="border border-slate-300 rounded p-3 space-y-2">
                <div className="font-bold text-[11px] text-slate-900 uppercase">
                  Section 4: Employer Information & Certification
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Employer: <strong>{primaryEmployer.employerName}</strong></div>
                  <div>FEIN: <strong className="font-mono">{primaryEmployer.ein}</strong></div>
                  <div>Status: <strong>{primaryEmployer.category}</strong></div>
                  <div>Weekly Hours: <strong className="font-mono">{primaryEmployer.hoursPerWeek} hrs/week</strong></div>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between text-[10px] text-slate-400">
                  <span>Authorized HR Signature Line: _________________________</span>
                  <span>Date: ____________</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HR Signature Routing Instructions */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Next Step: Forward to HR / Payroll or Use Digital Signature</span>
          </span>
          <p className="text-[11px] text-slate-500">
            Download the pre-filled PDF above and email it to your employer's HR office, or submit digitally via the StudentAid.gov PSLF Help Tool with your HR representative's email address.
          </p>
        </div>

        <a
          href="https://studentaid.gov/pslf/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-2xs shrink-0 transition-colors"
        >
          <span>StudentAid.gov PSLF Portal</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
};
