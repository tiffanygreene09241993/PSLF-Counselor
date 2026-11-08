import React, { useState } from 'react';
import { ALL_US_STATES, STATE_TAX_DATA, StateTaxConformity } from '../data/stateTaxData';
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Info,
  Scale,
  FileCheck,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface StateTaxExemptionCheckerProps {
  selectedStateCode?: string;
  onSelectState?: (stateCode: string) => void;
}

export const StateTaxExemptionChecker: React.FC<StateTaxExemptionCheckerProps> = ({
  selectedStateCode = 'CA',
  onSelectState,
}) => {
  const [activeStateCode, setActiveStateCode] = useState<string>(selectedStateCode);
  const stateData: StateTaxConformity = STATE_TAX_DATA[activeStateCode] || STATE_TAX_DATA.CA;

  const handleStateChange = (code: string) => {
    setActiveStateCode(code);
    if (onSelectState) onSelectState(code);
  };

  return (
    <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-white shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Interactive State Tax Exemption & Conformity Checker
            </h3>
            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full">
              IRC § 108(f) vs. State Codes
            </span>
          </div>
          <p className="text-xs text-slate-600">
            While PSLF discharge is 100% tax-free at the federal level under Internal Revenue Code § 108(f), verify your home state’s rolling conformity statutes below.
          </p>
        </div>

        {/* State Selector Dropdown */}
        <div className="shrink-0 flex items-center gap-2">
          <label htmlFor="state-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Borrower Home State:
          </label>
          <select
            id="state-select"
            value={activeStateCode}
            onChange={(e) => handleStateChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-slate-900 shadow-2xs cursor-pointer"
          >
            {ALL_US_STATES.map((state) => (
              <option key={state.stateCode} value={state.stateCode}>
                {state.stateName} ({state.stateCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* State Conformity Status Card */}
      <div
        className={`p-5 rounded-xl border transition-all space-y-3 ${
          stateData.isPslfTaxFree
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-current/10">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              {stateData.stateName} State Tax Status:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                stateData.isPslfTaxFree
                  ? 'bg-emerald-200 text-emerald-900 border-emerald-300'
                  : 'bg-amber-200 text-amber-950 border-amber-400'
              }`}
            >
              {stateData.statusBadge}
            </span>
          </div>

          <div className="text-xs font-mono font-semibold text-slate-600">
            Conformity Type: <span className="font-bold text-slate-900">{stateData.conformityType}</span>
          </div>
        </div>

        <p className="text-xs leading-relaxed font-normal">
          {stateData.notes}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-current/10 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              <strong>State Legal Authority:</strong> {stateData.legalCitation}
            </span>
          </div>
          <span className="font-semibold text-slate-600">IRC § 108(f)(1) Conformity</span>
        </div>
      </div>

      {/* Dynamic Executive Advisory Memo Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
          <FileCheck className="w-4 h-4 text-indigo-600" />
          <span>Executive Advisory Memo Integration ({stateData.stateCode}):</span>
        </div>
        <p className="text-[11px] text-slate-600 italic leading-relaxed">
          "{stateData.stateName} Tax Compliance Notice: Borrower's expected PSLF forgiveness is classified as tax-free public service debt relief. Under {stateData.legalCitation}, this discharge does not generate state gross income. No Form 1099-C adjustment is required for {stateData.stateName} individual returns."
        </p>
      </div>
    </div>
  );
};
