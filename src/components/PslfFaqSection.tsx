import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  BookOpen,
  Briefcase,
  DollarSign,
  Clock,
  Scale,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'Employment & Hours' | 'Career Transitions' | 'Taxes & Forgiveness' | 'Litigation & Buyback' | 'Consolidation';
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  citation?: string;
  highlightIcon: React.ElementType;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-part-time',
    category: 'Employment & Hours',
    question: 'Does my part-time job count toward PSLF?',
    shortAnswer: 'Not on its own if under 30 hrs/wk, but multiple qualifying part-time jobs can be combined.',
    detailedAnswer:
      'Under 34 CFR § 685.219 (codified July 2023), the federal standard for "full-time" employment is at least 30 hours per week. If you work a single part-time job under 30 hours, it does not qualify. However, if you work multiple part-time jobs simultaneously for qualifying public employers (e.g., 18 hrs/wk at a community college + 15 hrs/wk at a municipal clinic = 33 total hrs/wk), you can submit separate PSLF forms for both employers. Their combined hours satisfy the 30-hour full-time threshold for that month.',
    citation: '34 CFR § 685.219(b) — Definition of Full-Time Employment',
    highlightIcon: Clock,
  },
  {
    id: 'faq-employer-change',
    category: 'Career Transitions',
    question: 'What happens if I change employers or take time off during the year?',
    shortAnswer: 'Your 120 payments do NOT have to be consecutive. Your credits never expire.',
    detailedAnswer:
      'PSLF payment credits are cumulative, not consecutive. If you leave public service to work for a private commercial firm, or take a sabbatical, parental leave, or break, your verified payment count freezes at your current number and never resets. When you return to a qualifying 501(c)(3) or government agency in the future, you resume accumulating toward 120 payments. You must submit a signed PSLF form for each respective employer covering the exact employment start and end dates.',
    citation: 'Higher Education Act § 455(m) — Cumulative 120 Monthly Payments Standard',
    highlightIcon: Briefcase,
  },
  {
    id: 'faq-taxability',
    category: 'Taxes & Forgiveness',
    question: 'Is student loan balance forgiveness under PSLF taxable?',
    shortAnswer: 'No. PSLF forgiveness is 100% tax-free under federal law and in virtually all states.',
    detailedAnswer:
      'Unlike standard 20/25-year Income-Driven Repayment forgiveness (which could potentially be subject to a "tax bomb" if congressional tax waivers expire), PSLF discharge is permanently exempt from federal gross income under Internal Revenue Code (IRC) § 108(f)(1). You will not receive a Form 1099-C for federal income tax, and virtually all states adhere to federal adjusted gross income exclusions for public service debt relief.',
    citation: '26 U.S. Code § 108(f)(1) — Student Loan Debt Relief Exclusion',
    highlightIcon: DollarSign,
  },
  {
    id: 'faq-save-forbearance',
    category: 'Litigation & Buyback',
    question: 'Do administrative forbearance months during SAVE court litigation count?',
    shortAnswer: 'Not automatically, but you can use the official PSLF Buyback protocol.',
    detailedAnswer:
      'Months spent in the court-ordered, zero-interest administrative forbearance resulting from 8th Circuit litigation do not automatically earn PSLF payment credits because no qualifying payment was made. However, once you reach 120 months of certified qualifying public service employment, you can file a "PSLF Buyback" request with the Department of Education. You will be permitted to make retroactive lump-sum payments equal to what your payment would have been under an available IDR plan (like IBR) to achieve immediate forgiveness.',
    citation: 'Federal Student Aid PSLF Buyback Regulatory Guidance (34 CFR § 685.219)',
    highlightIcon: Scale,
  },
  {
    id: 'faq-job-title',
    category: 'Employment & Hours',
    question: 'Does my job title or duty description determine whether I qualify?',
    shortAnswer: 'No. Qualification is 100% determined by who your employer is.',
    detailedAnswer:
      'A widespread misconception is that you must be a teacher, police officer, or frontline nurse to qualify. In reality, PSLF is employer-based under federal statute. An IT database administrator, accountant, administrative assistant, groundskeeper, or legal counsel working for a 501(c)(3) non-profit hospital, school district, or state department qualifies identically to direct clinical or classroom staff.',
    citation: 'Consumer Financial Protection Bureau (CFPB) Public Service Guidance',
    highlightIcon: ShieldCheck,
  },
  {
    id: 'faq-employed-at-discharge',
    category: 'Career Transitions',
    question: 'Must I still be working in public service when my final forgiveness is processed?',
    shortAnswer: 'You must be employed in public service when you submit the final form.',
    detailedAnswer:
      'Under modern Department of Education regulations, you must be actively employed by a qualifying employer at the time you submit your final 120th payment PSLF Certification and Application. The Department eliminated the older, punitive requirement that forced borrowers to remain employed through months of servicer discharge delays.',
    citation: '34 CFR § 685.219(c)(1)(ii)(B) — Certification of Active Employment Rule',
    highlightIcon: Briefcase,
  },
  {
    id: 'faq-pre-consolidation-payments',
    category: 'Consolidation',
    question: 'Will consolidating my older FFEL or Perkins loans reset my payment count to zero?',
    shortAnswer: 'No. Under current regulations, consolidation uses a weighted average calculation.',
    detailedAnswer:
      'Historically, consolidating loans would completely reset your PSLF payment counter to 0. Under the permanent Department of Education regulations that took effect in 2024, consolidating multiple federal loans results in a weighted average of qualifying payments based on the balances of the consolidated loans. While not 100% credited as was the case during the temporary 2022-2024 waiver window, your past progress is mathematically preserved rather than erased.',
    citation: '34 CFR § 685.209 & § 685.219 — Weighted Average Consolidation Standards',
    highlightIcon: AlertCircle,
  },
];

export const PslfFaqSection: React.FC = () => {
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({
    'faq-part-time': true, // Open the first common question by default
    'faq-employer-change': true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(FAQ_DATA.map((item) => item.category)));
    return ['All', ...cats];
  }, []);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.shortAnswer.toLowerCase().includes(q) ||
        item.detailedAnswer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    FAQ_DATA.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItemIds(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItemIds({});
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* FAQ Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              PSLF Knowledge Base & Common Misconceptions
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative answers grounded in Title 34 of the Code of Federal Regulations and official Department of Education policy.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. part-time, job change, taxes, buyback, job title)..."
            className="w-full pl-9 pr-20 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-hidden font-medium text-slate-900 placeholder:text-slate-400 transition-all"
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-3">
        {filteredFaqs.map((item) => {
          const isOpen = Boolean(openItemIds[item.id]);
          const Icon = item.highlightIcon;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isOpen
                  ? 'border-slate-300 bg-white shadow-2xs ring-1 ring-slate-900/5'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Question Header Button */}
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 sm:p-4.5 flex items-start justify-between gap-3 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                      isOpen ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.question}
                    </h4>
                    {!isOpen && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.shortAnswer}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`p-1.5 rounded-lg shrink-0 transition-transform duration-200 text-slate-400 ${
                    isOpen ? 'rotate-180 text-slate-700 bg-slate-100' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Collapsible Answer Body */}
              {isOpen && (
                <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-1 border-t border-slate-100 space-y-3 text-xs">
                  {/* Short Summary Takeaway */}
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200 font-semibold flex items-start gap-2">
                    <span className="text-emerald-700 font-extrabold text-sm leading-none mt-0.5">✓</span>
                    <span>{item.shortAnswer}</span>
                  </div>

                  {/* Detailed Analysis */}
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {item.detailedAnswer}
                  </p>

                  {/* Legal Citation Footnote */}
                  {item.citation && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Statutory Reference: {item.citation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">No questions found matching "{searchQuery}"</p>
            <p className="text-slate-400 text-[11px]">
              Try searching for general terms like "part-time", "employer change", "taxes", or "litigation".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer mt-1"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Counselor Edge-Case Assistance Callout */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Have a unique edge-case or non-standard scenario (e.g. AmeriCorps, Peace Corps, or married filing separately)?
          </span>
        </div>
        <span className="font-bold text-indigo-700 shrink-0 text-[11px]">
          Use the "Ask Counselor" assistant in the bottom right corner
        </span>
      </div>
    </div>
  );
};
