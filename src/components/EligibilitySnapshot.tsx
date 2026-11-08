import React, { useState } from 'react';
import {
  BorrowerProfile,
  EmployerCategory,
  EmploymentRecord,
  LoanProgram,
  StudentLoan,
} from '../types/counselor';
import {
  getEmployerEligibilityStatus,
  isFullTimeEmployment,
  isLoanNativelyPSLFEligible,
} from '../utils/calculator';
import { EmployerVerificationHelper } from './EmployerVerificationHelper';
import { NearbyEmployersFinder } from './NearbyEmployersFinder';
import {
  Building2,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Info,
  Calendar,
  Briefcase,
  HelpCircle,
  School,
  Building,
  HeartPulse,
  Landmark,
  Shield,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface EligibilitySnapshotProps {
  profile: BorrowerProfile;
  onUpdateProfile: (updated: BorrowerProfile) => void;
  onNavigateNext?: () => void;
}

export const EligibilitySnapshot: React.FC<EligibilitySnapshotProps> = ({
  profile,
  onUpdateProfile,
  onNavigateNext,
}) => {
  const [showAddEmployer, setShowAddEmployer] = useState(false);

  // Fast-check active employer
  const primaryEmployer = profile.employment[0] || {
    id: 'emp-default',
    employerName: 'Lincoln Unified Public School District',
    ein: '47-0892144',
    category: 'Government (Federal/State/Local/Tribal)',
    startDate: '2020-08',
    endDate: 'Present',
    hoursPerWeek: 37.5,
    isFullTimeCertified: true,
  };

  const currentStatus = getEmployerEligibilityStatus(primaryEmployer.category);
  const isFullTime = isFullTimeEmployment(primaryEmployer.hoursPerWeek);

  // Quick Presets
  const employerPresets: {
    label: string;
    category: EmployerCategory;
    icon: React.ElementType;
    ein: string;
    name: string;
    desc: string;
  }[] = [
    {
      label: 'Public School / District',
      category: 'Government (Federal/State/Local/Tribal)',
      icon: School,
      ein: '47-0892144',
      name: 'Lincoln Unified Public School District',
      desc: 'Qualifies as a local government public educational agency.',
    },
    {
      label: '501(c)(3) Hospital / Clinic',
      category: '501(c)(3) Non-Profit',
      icon: HeartPulse,
      ein: '36-2198042',
      name: 'St. Jude Regional Non-Profit Medical Center',
      desc: 'All 501(c)(3) organizations qualify automatically.',
    },
    {
      label: 'City / State / Federal Agency',
      category: 'Government (Federal/State/Local/Tribal)',
      icon: Landmark,
      ein: '74-6000001',
      name: 'Department of Transportation, State Division',
      desc: 'Any civil, state, municipal, or federal agency qualifies fully.',
    },
    {
      label: 'Private Commercial / For-Profit',
      category: 'For-Profit / Private Commercial',
      icon: Building,
      ein: '52-9812411',
      name: 'Apex Systems Commercial Solutions LLC',
      desc: 'For-profit businesses never qualify, even on public contracts.',
    },
    {
      label: 'Military / Armed Forces',
      category: 'Government (Federal/State/Local/Tribal)',
      icon: Shield,
      ein: '10-0000001',
      name: 'U.S. Armed Forces / Department of Defense',
      desc: 'Full-time military service qualifies by statute.',
    },
    {
      label: '501(c)(4) Public Service Non-Profit',
      category: 'Other Public Service Non-Profit (Non-501c3)',
      icon: Building2,
      ein: '94-8172635',
      name: 'Community Emergency Response Alliance',
      desc: 'Conditional: qualifies if primary service is public safety or health.',
    },
  ];

  const handleApplyPreset = (preset: typeof employerPresets[0]) => {
    const updatedEmployment = [...profile.employment];
    if (updatedEmployment.length > 0) {
      updatedEmployment[0] = {
        ...updatedEmployment[0],
        employerName: preset.name,
        ein: preset.ein,
        category: preset.category,
        isFullTimeCertified: isFullTimeEmployment(updatedEmployment[0].hoursPerWeek),
      };
    } else {
      updatedEmployment.push({
        id: `emp-${Date.now()}`,
        employerName: preset.name,
        ein: preset.ein,
        category: preset.category,
        startDate: '2021-01',
        endDate: 'Present',
        hoursPerWeek: 40,
        isFullTimeCertified: true,
      });
    }

    onUpdateProfile({
      ...profile,
      employment: updatedEmployment,
    });
  };

  const handleSelectVerifiedEmployer = (selected: {
    name: string;
    ein: string;
    category: EmployerCategory;
  }) => {
    const updatedEmployment = [...profile.employment];
    if (updatedEmployment.length > 0) {
      updatedEmployment[0] = {
        ...updatedEmployment[0],
        employerName: selected.name,
        ein: selected.ein,
        category: selected.category,
        isFullTimeCertified: isFullTimeEmployment(updatedEmployment[0].hoursPerWeek),
      };
    } else {
      updatedEmployment.push({
        id: `emp-${Date.now()}`,
        employerName: selected.name,
        ein: selected.ein,
        category: selected.category,
        startDate: '2021-01',
        endDate: 'Present',
        hoursPerWeek: 40,
        isFullTimeCertified: true,
      });
    }

    onUpdateProfile({
      ...profile,
      employment: updatedEmployment,
    });
  };

  const handleUpdatePrimaryHours = (hours: number) => {
    const updatedEmployment = [...profile.employment];
    if (updatedEmployment.length > 0) {
      updatedEmployment[0] = {
        ...updatedEmployment[0],
        hoursPerWeek: hours,
        isFullTimeCertified: isFullTimeEmployment(hours),
      };
      onUpdateProfile({
        ...profile,
        employment: updatedEmployment,
      });
    }
  };

  const handleUpdatePrimaryEin = (ein: string) => {
    const updatedEmployment = [...profile.employment];
    if (updatedEmployment.length > 0) {
      updatedEmployment[0] = {
        ...updatedEmployment[0],
        ein,
      };
      onUpdateProfile({
        ...profile,
        employment: updatedEmployment,
      });
    }
  };

  const handleUpdatePrimaryName = (name: string) => {
    const updatedEmployment = [...profile.employment];
    if (updatedEmployment.length > 0) {
      updatedEmployment[0] = {
        ...updatedEmployment[0],
        employerName: name,
      };
      onUpdateProfile({
        ...profile,
        employment: updatedEmployment,
      });
    }
  };

  const handleUpdatePrimaryCategory = (category: EmployerCategory) => {
    const updatedEmployment = [...profile.employment];
    if (updatedEmployment.length > 0) {
      updatedEmployment[0] = {
        ...updatedEmployment[0],
        category,
      };
      onUpdateProfile({
        ...profile,
        employment: updatedEmployment,
      });
    }
  };

  return (
    <section id="step-1" className="scroll-mt-24 space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          <span>Step 1 of 4</span>
          <span aria-hidden="true">·</span>
          <span>Statutory Employer Verification</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          1. Employer Fast-Check & PSLF Eligibility
        </h2>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          PSLF eligibility is determined exclusively by your employer's tax-exempt status or government designation
          under 34 CFR § 685.219—not by your job title or duties.
        </p>
      </div>

      {/* Interactive Employer Fast-Check Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Employer Fast-Check</h3>
            <p className="text-sm text-slate-500">
              Verify your employer below or browse common school districts and non-profit healthcare systems.
            </p>
          </div>

          {/* Dynamic Verdict Badge */}
          <div className="shrink-0">
            {currentStatus.status === 'qualifies' && isFullTime ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fully Qualified Employer & Hours</span>
              </span>
            ) : currentStatus.status === 'conditional' && isFullTime ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Conditional: Service Audit Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>{!isFullTime ? 'Ineligible: Under 30 Hrs/Week' : 'Ineligible Employer Tax Status'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Employer Verification Helper Component */}
        <EmployerVerificationHelper
          currentEin={primaryEmployer.ein}
          currentEmployerName={primaryEmployer.employerName}
          currentCategory={primaryEmployer.category}
          onSelectEmployer={handleSelectVerifiedEmployer}
        />

        {/* Nearby Public Employers Finder with Google Maps Grounding */}
        <NearbyEmployersFinder
          onSelectEmployer={handleSelectVerifiedEmployer}
        />

        {/* Quick Presets Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">Quick Employer Presets:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {employerPresets.map((preset) => {
              const isSelected =
                primaryEmployer.category === preset.category &&
                primaryEmployer.employerName.includes(preset.label.split(' ')[0]);
              const Icon = preset.icon;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {preset.category.includes('Government') || preset.category.includes('501(c)(3)') ? (
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>✓</span>
                    ) : (
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-rose-300' : 'text-rose-600'}`}>✕</span>
                    )}
                  </div>
                  <div className="text-xs font-bold leading-tight">{preset.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Employer Edit Controls */}
        <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employer Legal Name
              </label>
              <input
                type="text"
                value={primaryEmployer.employerName}
                onChange={(e) => handleUpdatePrimaryName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-medium"
                placeholder="e.g. Lincoln Unified School District"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Federal EIN (from W-2 Box b)
                </label>
              </div>
              <input
                type="text"
                value={primaryEmployer.ein}
                onChange={(e) => handleUpdatePrimaryEin(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
                placeholder="XX-XXXXXXX"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Entered into StudentAid.gov Help Tool</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tax Organization Category
              </label>
              <select
                value={primaryEmployer.category}
                onChange={(e) => handleUpdatePrimaryCategory(e.target.value as EmployerCategory)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-medium"
              >
                <option value="Government (Federal/State/Local/Tribal)">Government (Federal/State/Local/Tribal)</option>
                <option value="501(c)(3) Non-Profit">501(c)(3) Tax-Exempt Non-Profit</option>
                <option value="Other Public Service Non-Profit (Non-501c3)">Other Public Service Non-Profit (Non-501c3)</option>
                <option value="For-Profit / Private Commercial">For-Profit / Private Commercial (Ineligible)</option>
                <option value="Partisan Political / Labor Union">Partisan Political / Labor Union (Ineligible)</option>
              </select>
            </div>
          </div>

          {/* Hours per Week Slider with 30-Hour Standard Marker */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Contracted Hours Per Week:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {primaryEmployer.hoursPerWeek} hrs/wk
                </span>
                {isFullTime ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Meets Full-Time Benchmark (&ge;30 hrs)
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Under 30 hrs/wk (Requires Part-Time Aggregation)
                  </span>
                )}
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={primaryEmployer.hoursPerWeek}
              onChange={(e) => handleUpdatePrimaryHours(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10 hrs</span>
              <span className="font-bold text-indigo-600">30 hrs (Statutory Full-Time Threshold)</span>
              <span>60 hrs</span>
            </div>
          </div>

          {/* Statutory Rationale Box */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Legal Standard: </span>
              {currentStatus.explanation}
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
              <span>Next: Audit Student Loans & Consolidation</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
