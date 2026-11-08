import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import { RepaymentPlanQuote } from '../types/counselor';
import { DollarSign, TrendingDown, Info, BarChart3, CheckCircle2, ArrowDownRight, Scale } from 'lucide-react';

interface RepaymentCostBarChartProps {
  quotes: RepaymentPlanQuote[];
  standardQuote: RepaymentPlanQuote;
  ibrQuote: RepaymentPlanQuote;
}

export const RepaymentCostBarChart: React.FC<RepaymentCostBarChartProps> = ({
  quotes,
  standardQuote,
  ibrQuote,
}) => {
  // Default to standard_vs_optimal as specifically requested
  const [chartMode, setChartMode] = useState<'standard_vs_optimal' | 'all_plans'>('standard_vs_optimal');

  // Filter valid plans for chart display
  const eligibleQuotes = quotes.filter((q) => q.planId !== 'save'); // exclude inactive SAVE

  const outOfPocketSavings = Math.max(0, standardQuote.totalPaid120 - ibrQuote.totalPaid120);
  const savingsPercent = standardQuote.totalPaid120 > 0
    ? Math.round((outOfPocketSavings / standardQuote.totalPaid120) * 100)
    : 0;

  // Head-to-head out-of-pocket comparison data
  const headToHeadData = [
    {
      planId: 'standard_10',
      name: 'Standard 10-Yr Plan',
      displayName: 'Standard 10-Year',
      fullName: 'Standard 10-Year Repayment (Zero PSLF)',
      outOfPocket: standardQuote.totalPaid120,
      forgiveness: 0,
      monthlyPayment: standardQuote.initialMonthlyPayment,
      isStandard: true,
      color: '#e11d48', // rose-600
    },
    {
      planId: ibrQuote.planId,
      name: 'Optimal IDR (Statutory IBR)',
      displayName: 'Optimal IDR Plan',
      fullName: 'Optimal Income-Driven Repayment (Statutory IBR under PSLF)',
      outOfPocket: ibrQuote.totalPaid120,
      forgiveness: ibrQuote.totalForgiven,
      monthlyPayment: ibrQuote.initialMonthlyPayment,
      isStandard: false,
      color: '#059669', // emerald-600
    },
  ];

  // All plans comparison data
  const allPlansData = eligibleQuotes.map((q) => {
    let shortName = q.planName;
    if (q.planId === 'standard_10') shortName = 'Standard (10-Yr)';
    if (q.planId === 'ibr_new') shortName = 'Statutory IBR';
    if (q.planId === 'paye') shortName = 'PAYE';
    if (q.planId === 'icr') shortName = 'ICR';

    return {
      planId: q.planId,
      name: shortName,
      displayName: shortName,
      fullName: q.planName,
      outOfPocket: q.totalPaid120,
      forgiveness: q.totalForgiven,
      monthlyPayment: q.initialMonthlyPayment,
      isStandard: q.planId === 'standard_10',
      color: q.planId === 'standard_10' ? '#e11d48' : q.planId === ibrQuote.planId ? '#059669' : '#475569',
    };
  });

  const activeData = chartMode === 'standard_vs_optimal' ? headToHeadData : allPlansData;

  // Formatter for YAxis ($K)
  const formatCurrencyAxis = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${val}`;
  };

  // Formatter for Bar top label
  const formatBarLabel = (val: any) => {
    const num = Number(val);
    if (!num || isNaN(num)) return '';
    return `$${num.toLocaleString()}`;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const itemData = payload[0]?.payload;

    return (
      <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-xl border border-slate-700 text-xs space-y-2 max-w-xs z-50">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
          <span className="font-bold text-white text-sm">{itemData.name}</span>
          {!itemData.isStandard && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/40">
              Optimal IDR
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: itemData.color }} />
              <span>Total Out-of-Pocket Cost:</span>
            </span>
            <span className="font-mono font-bold text-white">
              ${itemData.outOfPocket.toLocaleString()}
            </span>
          </div>

          {!itemData.isStandard && (
            <div className="flex justify-between gap-4 text-emerald-400">
              <span>Tax-Free Forgiveness:</span>
              <span className="font-mono font-bold">
                +${itemData.forgiveness.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-slate-400">
            <span>Starting Monthly Payment:</span>
            <span className="font-mono font-semibold text-slate-200">
              ${itemData.monthlyPayment.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Projected Total Out-of-Pocket Cost: Standard vs. Optimal IDR Plan
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparing total cash paid out-of-pocket over the remaining loan term before forgiveness.
          </p>
        </div>

        {/* View Segmented Toggle */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setChartMode('standard_vs_optimal')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              chartMode === 'standard_vs_optimal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standard vs. Optimal IDR
          </button>
          <button
            type="button"
            onClick={() => setChartMode('all_plans')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              chartMode === 'all_plans'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Repayment Plans
          </button>
        </div>
      </div>

      {/* Quick Visual Metric Highlight Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block font-medium">Standard 10-Year Cost:</span>
          <span className="text-lg font-extrabold font-mono text-rose-600">
            ${standardQuote.totalPaid120.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block">$0 forgiveness</span>
        </div>

        <div>
          <span className="text-slate-500 block font-medium">Optimal IDR Out-of-Pocket:</span>
          <span className="text-lg font-extrabold font-mono text-emerald-600">
            ${ibrQuote.totalPaid120.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 block font-semibold">
            +${ibrQuote.totalForgiven.toLocaleString()} forgiven tax-free
          </span>
        </div>

        <div className="sm:border-l sm:border-slate-200 sm:pl-4">
          <span className="text-slate-500 block font-medium">Net Out-of-Pocket Savings:</span>
          <span className="text-lg font-extrabold font-mono text-slate-900 flex items-center gap-1">
            <ArrowDownRight className="w-5 h-5 text-emerald-600" />
            ${outOfPocketSavings.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
            {savingsPercent}% Lower Out-of-Pocket
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={activeData}
            margin={{ top: 25, right: 20, left: 10, bottom: 25 }}
            barSize={chartMode === 'standard_vs_optimal' ? 52 : 36}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="displayName"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrencyAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              formatter={() => (
                <span className="text-slate-700 font-medium">
                  Total Projected Out-of-Pocket Paid ($)
                </span>
              )}
            />
            <Bar
              dataKey="outOfPocket"
              name="Total Out-of-Pocket Cost"
              radius={[6, 6, 0, 0]}
            >
              <LabelList
                dataKey="outOfPocket"
                position="top"
                formatter={formatBarLabel}
                fill="#475569"
                fontSize={11}
                fontWeight={700}
              />
              {activeData.map((entry, index) => (
                <Cell
                  key={`cell-cost-${index}`}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Callout Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Counselor Rationale:</strong> By enrolling in the optimal IDR plan (Statutory IBR), your total out-of-pocket cost is limited to{' '}
            <strong>${ibrQuote.totalPaid120.toLocaleString()}</strong>, saving you{' '}
            <strong className="underline">${outOfPocketSavings.toLocaleString()}</strong> compared to standard amortization.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Standard Amortization
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Optimal IDR Under PSLF
          </span>
        </div>
      </div>
    </div>
  );
};
