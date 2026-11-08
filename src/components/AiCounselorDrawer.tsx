import React, { useState, useRef, useEffect } from 'react';
import { BorrowerProfile } from '../types/counselor';
import { analyzeConsolidation, calculateReadinessScore, getEmployerEligibilityStatus } from '../utils/calculator';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Scale,
  Briefcase,
  Layers,
  Globe,
  ExternalLink,
  MapPin,
  Compass,
} from 'lucide-react';

interface WebSource {
  uri: string;
  title: string;
}

interface MapPlace {
  title: string;
  uri: string;
  snippet?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  webSources?: WebSource[];
  mapPlaces?: MapPlace[];
}

interface AiCounselorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BorrowerProfile;
}

export const AiCounselorDrawer: React.FC<AiCounselorDrawerProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello ${profile.borrowerName.split(' ')[0] || 'there'}! I am your AI Student Loan Counselor specializing in Public Service Loan Forgiveness (PSLF) and federal debt relief programs.

I have analyzed your active audit details for **${profile.employment[0]?.employerName || 'your employer'}** ($${profile.loans.reduce((s, l) => s + l.balance, 0).toLocaleString()} debt across ${profile.loans.length} loans). 

I am grounded with real-time **Google Search** data for breaking court litigation and Department of Education policies, and **Google Maps** data to locate qualifying public employers. Ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [activeGroundingMode, setActiveGroundingMode] = useState<'search' | 'maps'>('search');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const consolidation = analyzeConsolidation(profile.loans);
  const readiness = calculateReadinessScore(profile);
  const primaryEmployer = profile.employment[0];
  const employerStatus = getEmployerEligibilityStatus(primaryEmployer?.category || '501(c)(3) Non-Profit');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Suggested prompt chips for edge cases
  const suggestedQuestions = [
    'What is the latest status of the SAVE plan court injunction?',
    'How does the PSLF Buyback protocol work for paused months?',
    'Find 501(c)(3) hospitals and school districts in my area',
    'Does Married Filing Separately reduce my IBR monthly payment?',
    'Can I receive PSLF credit for past AmeriCorps or Peace Corps service?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    // If query specifically asks for places or nearby employers, or in maps mode
    const isMapsQuery =
      activeGroundingMode === 'maps' ||
      text.toLowerCase().includes('find') && (text.toLowerCase().includes('hospital') || text.toLowerCase().includes('school') || text.toLowerCase().includes('employer') || text.toLowerCase().includes('near'));

    try {
      if (isMapsQuery) {
        // Query Maps Grounding endpoint
        const response = await fetch('/api/pslf-assistant/nearby-employers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.text || 'Found local public service organizations in this area.',
          mapPlaces: data.mapPlaces || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Prepare active borrower context for multi-turn chat with Google Search grounding
        const borrowerContext = {
          borrowerName: profile.borrowerName,
          occupation: profile.occupation,
          employerName: primaryEmployer?.employerName,
          employerCategory: primaryEmployer?.category,
          hoursPerWeek: primaryEmployer?.hoursPerWeek,
          isFullTime: (primaryEmployer?.hoursPerWeek || 0) >= 30,
          ein: primaryEmployer?.ein,
          employerStatus: employerStatus.label,
          totalDebt: profile.loans.reduce((sum, l) => sum + l.balance, 0),
          directBalance: consolidation.directBalance,
          nonDirectBalance: consolidation.nonDirectBalance,
          nonDirectCount: consolidation.nonDirectLoanCount,
          hasParentPlus: profile.loans.some((l) => l.program === 'Direct PLUS (Parent)'),
          agi: profile.agi,
          familySize: profile.familySize,
          filingStatus: profile.filingStatus,
          region: profile.region,
          readinessScore: readiness.score,
          readinessStatus: readiness.statusBadge,
        };

        const historyForApi = messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          }));

        const response = await fetch('/api/pslf-assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationHistory: historyForApi,
            borrowerContext,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with status ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'I could not generate an answer at this time.',
          webSources: data.webSources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err?.message || 'Unable to connect to AI Counselor. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: `Conversation reset. How can I assist you with your PSLF roadmap today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      {/* Slide-out Drawer Panel */}
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">AI PSLF Counselor</h3>
                <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">
                  Gemini 3.8
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                  Search & Maps Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Real-time statutory analysis & employer locator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grounding Mode Pills */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveGroundingMode('search')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeGroundingMode === 'search'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Search Grounding</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGroundingMode('maps')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeGroundingMode === 'maps'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Google Maps Locator</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            {activeGroundingMode === 'search' ? 'Web Grounded' : 'Maps Grounded'}
          </span>
        </div>

        {/* Active Context Bar (Collapsible) */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
          <button
            onClick={() => setShowContext(!showContext)}
            className="w-full flex items-center justify-between font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Active Case Context: {profile.borrowerName}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
              <span>{showContext ? 'Hide' : 'View'}</span>
              {showContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showContext && (
            <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600 font-mono">
              <div>Employer: <span className="text-slate-900 font-bold">{primaryEmployer?.employerName}</span> ({primaryEmployer?.category})</div>
              <div>Hours: <span className="text-slate-900 font-bold">{primaryEmployer?.hoursPerWeek} hrs/wk</span> · Status: <span className="text-emerald-700 font-bold">{employerStatus.label}</span></div>
              <div>Total Debt: <span className="text-slate-900 font-bold">${profile.loans.reduce((s, l) => s + l.balance, 0).toLocaleString()}</span> ({consolidation.nonDirectLoanCount > 0 ? `${consolidation.nonDirectLoanCount} non-Direct loans` : 'All Direct'})</div>
              <div>Finances: <span className="text-slate-900 font-bold">AGI ${profile.agi.toLocaleString()}</span> · Family: <span className="text-slate-900 font-bold">{profile.familySize}</span> · Filing: <span className="text-slate-900 font-bold">{profile.filingStatus.toUpperCase()}</span></div>
            </div>
          )}
        </div>

        {/* Messages Stream (Scrollable Thread) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>

                  {/* Google Search Grounding Sources */}
                  {message.webSources && message.webSources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span>Google Search Grounded Sources:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {message.webSources.slice(0, 4).map((source, idx) => (
                          <a
                            key={`${source.uri}-${idx}`}
                            href={source.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-[11px] text-blue-700 font-medium transition-colors"
                          >
                            <span className="truncate max-w-[280px]">{source.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google Maps Grounded Places */}
                  {message.mapPlaces && message.mapPlaces.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>Google Maps Locations:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {message.mapPlaces.map((place, idx) => (
                          <div
                            key={`${place.title}-${idx}`}
                            className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col gap-1"
                          >
                            <div className="font-bold text-slate-900 text-[11px]">{place.title}</div>
                            {place.snippet && (
                              <p className="text-[10px] text-slate-500 italic">"{place.snippet}"</p>
                            )}
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>Open in Google Maps</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] text-right font-mono ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                    {message.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-none flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-75" />
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
                <span className="text-[11px] font-medium text-slate-600">
                  {activeGroundingMode === 'maps'
                    ? 'Consulting Google Maps data for qualifying public employers...'
                    : 'Querying Google Search & statutory PSLF regulations...'}
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Error Connecting to Counselor</div>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => handleSendMessage(messages[messages.length - 1]?.text)}
                  className="text-xs font-semibold text-rose-900 underline cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pill Section */}
        {messages.length <= 3 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Popular Grounded Inquiries:
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeGroundingMode === 'maps'
                  ? 'Find hospitals, school districts, or agencies near (city/zip)...'
                  : 'Ask about SAVE litigation, buyback, MFS, or PSLF rules...'
              }
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-1.5 text-center flex items-center justify-center gap-2">
            <span>Powered by Gemini 3.8</span>
            <span>·</span>
            <span>Google Search & Maps Grounded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
