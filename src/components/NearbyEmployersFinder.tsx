import React, { useState } from 'react';
import {
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Building2,
  School,
  HeartPulse,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { EmployerCategory } from '../types/counselor';

interface MapPlace {
  title: string;
  uri: string;
  snippet?: string;
}

interface NearbyEmployersFinderProps {
  onSelectEmployer: (employer: {
    name: string;
    ein: string;
    category: EmployerCategory;
  }) => void;
}

export const NearbyEmployersFinder: React.FC<NearbyEmployersFinderProps> = ({
  onSelectEmployer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [mapPlaces, setMapPlaces] = useState<MapPlace[]>([]);

  const handleSearch = async (loc?: string, coords?: { lat: number; lng: number }) => {
    const query = loc !== undefined ? loc : locationInput;
    if (!query.trim() && !coords) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = { query };
      if (coords) {
        payload.latitude = coords.lat;
        payload.longitude = coords.lng;
      }

      const res = await fetch('/api/pslf-assistant/nearby-employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to find nearby employers: ${res.statusText}`);
      }

      const data = await res.json();
      setResultText(data.text);
      setMapPlaces(data.mapPlaces || []);
    } catch (err: any) {
      console.error('Maps grounding error:', err);
      setErrorMessage(err?.message || 'Could not retrieve nearby employers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationInput('My Current Location');
        handleSearch('Public employers near my current location', { lat: latitude, lng: longitude });
      },
      (err) => {
        setIsLoading(false);
        setErrorMessage('Could not determine your location. Please type your city or ZIP code.');
      },
      { timeout: 10000 }
    );
  };

  const handleSelectPlace = (placeTitle: string) => {
    // Categorize based on common keywords
    let category: EmployerCategory = 'Government (Federal/State/Local/Tribal)';
    const lower = placeTitle.toLowerCase();
    if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('health') || lower.includes('red cross') || lower.includes('foundation')) {
      category = '501(c)(3) Non-Profit';
    }

    onSelectEmployer({
      name: placeTitle,
      ein: 'XX-XXXXXXX',
      category,
    });
  };

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/30 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-2xs">
              <MapPin className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Locate Qualifying PSLF Employers in Your Area
            </h4>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Google Maps Grounded
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Search for local public school districts, 501(c)(3) non-profit hospitals, and civil government agencies near your location.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-100/80 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          {isOpen ? 'Close Locator' : 'Explore Nearby Employers'}
        </button>
      </div>

      {isOpen && (
        <div className="pt-2 border-t border-blue-100 space-y-4 animate-in fade-in duration-200">
          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Enter city, state, or ZIP code (e.g. Austin, TX, Chicago 60601, Denver)..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isLoading || !locationInput.trim()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Find Employers</span>
              </button>

              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLoading}
                title="Use Current GPS Coordinates"
                className="inline-flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Near Me</span>
              </button>
            </div>
          </div>

          {/* Quick preset cities */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Quick Searches:</span>
            {['Austin, TX', 'Chicago, IL', 'Los Angeles, CA', 'New York, NY', 'Atlanta, GA'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setLocationInput(city);
                  handleSearch(city);
                }}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer transition-colors"
              >
                {city}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-6 text-center text-xs text-blue-800 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              <p className="font-semibold">Querying Google Maps Grounding for local public service agencies...</p>
              <p className="text-[11px] text-slate-500">Retrieving school districts, municipal offices, and non-profit hospitals</p>
            </div>
          )}

          {/* Results: Google Maps Grounded Places List */}
          {mapPlaces.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Verified Google Maps Grounded Locations ({mapPlaces.length}):</span>
                <span className="text-[10px] text-slate-500 font-normal">Click links to view on Google Maps</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {mapPlaces.map((place, idx) => (
                  <div
                    key={`${place.title}-${idx}`}
                    className="p-3.5 rounded-xl border border-blue-200 bg-white hover:border-blue-400 transition-all shadow-2xs flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="line-clamp-1">{place.title}</span>
                        </h5>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                          PSLF Eligible
                        </span>
                      </div>

                      {place.snippet && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-2">
                          "{place.snippet}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      {/* Required Google Maps URL link */}
                      <a
                        href={place.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                      >
                        <span>View on Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleSelectPlace(place.title)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                      >
                        Use as Employer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Guidance Text from Maps Grounding */}
          {resultText && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Regional Public Service Overview:</span>
              </div>
              <div className="whitespace-pre-line text-slate-600 leading-relaxed font-normal">
                {resultText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
