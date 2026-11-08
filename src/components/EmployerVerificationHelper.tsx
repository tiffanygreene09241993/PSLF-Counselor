import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Building2,
  School,
  HeartPulse,
  Landmark,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  MOCK_VERIFIED_EMPLOYERS,
  VerifiedEmployerRecord,
  lookupVerifiedEmployerByEin,
  searchVerifiedEmployers,
} from '../data/mockEmployers';
import { EmployerCategory } from '../types/counselor';

interface EmployerVerificationHelperProps {
  currentEin: string;
  currentEmployerName: string;
  currentCategory: EmployerCategory;
  onSelectEmployer: (employer: {
    name: string;
    ein: string;
    category: EmployerCategory;
  }) => void;
}

type SectorFilter = 'All' | 'K-12 School District' | 'Healthcare / Hospital' | 'Higher Education' | 'Charity / Non-Profit' | 'Government Agency';

export const EmployerVerificationHelper: React.FC<EmployerVerificationHelperProps> = ({
  currentEin,
  currentEmployerName,
  currentCategory,
  onSelectEmployer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSector, setActiveSector] = useState<SectorFilter>('All');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Check if current active employer matches an entry in the verified database
  const verifiedMatch = useMemo(() => {
    // Check by EIN first
    const byEin = lookupVerifiedEmployerByEin(currentEin);
    if (byEin) return byEin;

    // Check by exact or close name match
    if (currentEmployerName && currentEmployerName.length > 3) {
      const cleanName = currentEmployerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const byName = MOCK_VERIFIED_EMPLOYERS.find((emp) => {
        const empClean = emp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return empClean.includes(cleanName) || cleanName.includes(empClean.slice(0, 15));
      });
      if (byName) return byName;
    }
    return undefined;
  }, [currentEin, currentEmployerName]);

  // Filtered list of employers based on search query and sector filter
  const searchResults = useMemo(() => {
    let results = MOCK_VERIFIED_EMPLOYERS;

    if (activeSector !== 'All') {
      results = results.filter((emp) => emp.sector === activeSector);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      results = results.filter((emp) => {
        const cleanEin = emp.ein.replace(/[^a-z0-9]/g, '').toLowerCase();
        const cleanName = emp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanSector = emp.sector.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanLocation = emp.location.toLowerCase().replace(/[^a-z0-9]/g, '');
        return (
          cleanEin.includes(q) ||
          cleanName.includes(q) ||
          cleanSector.includes(q) ||
          cleanLocation.includes(q)
        );
      });
    }

    return results;
  }, [searchQuery, activeSector]);

  const handleSelect = (record: VerifiedEmployerRecord) => {
    onSelectEmployer({
      name: record.name,
      ein: record.ein,
      category: record.category,
    });
    setSearchQuery('');
  };

  const getSectorIcon = (sector: VerifiedEmployerRecord['sector']) => {
    switch (sector) {
      case 'K-12 School District':
        return School;
      case 'Healthcare / Hospital':
        return HeartPulse;
      case 'Higher Education':
        return Landmark;
      case 'Government Agency':
        return Building2;
      default:
        return ShieldCheck;
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header with Live Verification Checkmark */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              PSLF Employer Verification Helper
            </h3>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
              Mock National Database
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Instant EIN & 501(c)(3) qualification check using common public school districts, non-profit hospital systems, and public institutions.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="shrink-0">
          {verifiedMatch ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 fill-emerald-600" />
              <span>Likely Eligible</span>
              <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded text-emerald-100 font-mono">
                {verifiedMatch.ein}
              </span>
            </div>
          ) : currentCategory === 'Government (Federal/State/Local/Tribal)' || currentCategory === '501(c)(3) Non-Profit' ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Likely Eligible (Statutory Category)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold">
              <span>Unverified Employer</span>
            </div>
          )}
        </div>
      </div>

      {/* Verified Match Card (If currently matched) */}
      {verifiedMatch && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-300/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950 text-sm">
                {verifiedMatch.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-200 text-emerald-900 border border-emerald-300">
                {verifiedMatch.sector}
              </span>
            </div>
            <div className="text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              <span><strong>EIN:</strong> <code className="font-mono text-emerald-900 bg-emerald-100/80 px-1.5 py-0.2 rounded">{verifiedMatch.ein}</code></span>
              <span>·</span>
              <span><strong>Location:</strong> {verifiedMatch.location}</span>
              <span>·</span>
              <span><strong>Source:</strong> {verifiedMatch.verificationSource}</span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official Registry Match</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Search Bar & Sector Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified school districts, non-profit hospitals, universities, or enter EIN (e.g., 47-0892144, Mayo, NY)..."
            className="w-full pl-9 pr-24 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {(
            [
              'All',
              'K-12 School District',
              'Healthcare / Hospital',
              'Higher Education',
              'Charity / Non-Profit',
              'Government Agency',
            ] as SectorFilter[]
          ).map((sector) => {
            const isSelected = activeSector === sector;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setActiveSector(sector)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {sector === 'All' ? 'All Sectors' : sector}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Results / Suggestion Grid */}
      {(searchQuery.trim() || isCatalogOpen) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Found {searchResults.length} verified qualifying organization{searchResults.length === 1 ? '' : 's'}:
            </span>
            <button
              type="button"
              onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {isCatalogOpen ? 'Collapse Catalog' : 'View Full Catalog'}
              {isCatalogOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {searchResults.map((emp) => {
              const isSelected =
                lookupVerifiedEmployerByEin(currentEin)?.ein === emp.ein ||
                currentEmployerName.toLowerCase() === emp.name.toLowerCase();
              const Icon = getSectorIcon(emp.sector);

              return (
                <div
                  key={emp.ein}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                          <span>{emp.location}</span>
                          <span>·</span>
                          <span className="font-mono font-semibold text-emerald-800">{emp.ein}</span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Likely Eligible
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 truncate max-w-[180px]">
                      {emp.verificationSource}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelect(emp)}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? 'Applied ✓' : 'Select Employer'}
                    </button>
                  </div>
                </div>
              );
            })}

            {searchResults.length === 0 && (
              <div className="col-span-2 p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="font-semibold text-slate-700">No mock employer matching "{searchQuery}"</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can still enter any organization name and EIN manually below. If it is a 501(c)(3) or government agency, it qualifies by law!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Toggle for Catalog if not typing */}
      {!searchQuery.trim() && !isCatalogOpen && (
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular: Lincoln Unified (47-0892144), Mayo Clinic (41-6011702), NYC DOE (13-1628123)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCatalogOpen(true)}
            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
          >
            <span>Browse {MOCK_VERIFIED_EMPLOYERS.length} Verified Employers</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
