/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRESET_PROFILES } from './data/presets';
import { BorrowerProfile } from './types/counselor';
import { calculateReadinessScore } from './utils/calculator';
import { TopBar } from './components/TopBar';
import { EligibilitySnapshot } from './components/EligibilitySnapshot';
import { ConsolidationWarning } from './components/ConsolidationWarning';
import { RepaymentStrategy } from './components/RepaymentStrategy';
import { CertificationSteps } from './components/CertificationSteps';
import { ActionRoadmapCard } from './components/ActionRoadmapCard';
import { CounselorReportModal } from './components/CounselorReportModal';
import { PslfRulesGuide } from './components/PslfRulesGuide';
import { DoubleConsolidationModal } from './components/DoubleConsolidationModal';
import { AiCounselorDrawer } from './components/AiCounselorDrawer';
import {
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  ArrowRight,
  ArrowLeft,
  Printer,
  ChevronRight,
  Bot,
} from 'lucide-react';

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('public-school-teacher');
  const [profile, setProfile] = useState<BorrowerProfile>(PRESET_PROFILES[0]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isDoubleConsolidationOpen, setIsDoubleConsolidationOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Dynamic Readiness Score
  const readiness = calculateReadinessScore(profile);

  // Switch scenario preset
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setProfile(JSON.parse(JSON.stringify(found)));
    }
  };

  // Reset to default
  const handleResetProfile = () => {
    const found = PRESET_PROFILES.find((p) => p.id === selectedPresetId);
    if (found) {
      setProfile(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Enhanced Top Bar with Score Ring & Stepper Navigation */}
      <TopBar
        activeStep={activeStep}
        onSelectStep={handleStepChange}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        readiness={readiness}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Borrower Case Context & Preset Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Active Case Review</span>
                <span aria-hidden="true">·</span>
                <span>Independent Counseling Session</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {profile.borrowerName} — {profile.occupation}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                <span>AGI: <strong className="text-slate-800 font-mono">${profile.agi.toLocaleString()}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Household: <strong className="text-slate-800">{profile.familySize} Person(s)</strong></span>
                <span aria-hidden="true">·</span>
                <span>Filing: <strong className="text-slate-800">{profile.filingStatus.replace('_', ' ').toUpperCase()}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Total Debt: <strong className="text-slate-800 font-mono">${profile.loans.reduce((s, l) => s + l.balance, 0).toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Reset scenario to original preset data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Case</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              Select Real-World Borrower Counseling Scenarios:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_PROFILES.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{preset.scenarioName}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      ${preset.loans.reduce((s, l) => s + l.balance, 0).toLocaleString()} debt · AGI ${preset.agi.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Step View Routing */}
        <div className="space-y-12">
          {activeStep === 1 && (
            <EligibilitySnapshot
              profile={profile}
              onUpdateProfile={setProfile}
              onNavigateNext={() => handleStepChange(2)}
            />
          )}

          {activeStep === 2 && (
            <ConsolidationWarning
              profile={profile}
              onUpdateProfile={setProfile}
              onNavigateNext={() => handleStepChange(3)}
              onOpenDoubleConsolidation={() => setIsDoubleConsolidationOpen(true)}
            />
          )}

          {activeStep === 3 && (
            <RepaymentStrategy
              profile={profile}
              onUpdateProfile={setProfile}
              onNavigateNext={() => handleStepChange(4)}
            />
          )}

          {activeStep === 4 && (
            <div className="space-y-10">
              <ActionRoadmapCard
                profile={profile}
                onOpenReport={() => setIsReportOpen(true)}
                onOpenDoubleConsolidation={() => setIsDoubleConsolidationOpen(true)}
              />

              <CertificationSteps
                profile={profile}
                onOpenReport={() => setIsReportOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Step Navigation Controls (Prev / Next Bar) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {activeStep > 1 ? (
            <button
              onClick={() => handleStepChange(activeStep - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          <div className="text-xs font-mono text-slate-500">
            Step {activeStep} of 4
          </div>

          {activeStep < 4 ? (
            <button
              onClick={() => handleStepChange(activeStep + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          ) : (
            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Complete Advisory Memo</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Independent Public Service Loan Forgiveness (PSLF) Practice.
            Compliant with Higher Education Act (HEA) Section 455(m) & 34 CFR § 685.219.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="hover:text-slate-900 underline cursor-pointer"
            >
              Statutory Rulebook
            </button>
            <a
              href="https://studentaid.gov"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 underline inline-flex items-center gap-1"
            >
              StudentAid.gov <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Floating "Ask Counselor" Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer border border-slate-700/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          aria-label="Open AI PSLF Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400 transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-bold tracking-tight">Ask Counselor</span>
        </button>
      </div>

      {/* AI Counselor Chat Drawer */}
      <AiCounselorDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        profile={profile}
      />

      {/* Report Modal */}
      <CounselorReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        profile={profile}
      />

      {/* Rules Guide Modal */}
      <PslfRulesGuide
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Parent PLUS Double Consolidation Modal */}
      <DoubleConsolidationModal
        isOpen={isDoubleConsolidationOpen}
        onClose={() => setIsDoubleConsolidationOpen(false)}
      />
    </div>
  );
}
