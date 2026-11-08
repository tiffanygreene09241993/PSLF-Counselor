import {
  BorrowerProfile,
  ConsolidationAnalysis,
  EmployerCategory,
  EmploymentRecord,
  LoanProgram,
  RepaymentPlanQuote,
  StudentLoan,
} from '../types/counselor';
import { getPovertyGuideline } from '../data/povertyGuidelines';

/**
 * Check whether a loan type is natively PSLF-eligible
 */
export function isLoanNativelyPSLFEligible(program: LoanProgram): boolean {
  switch (program) {
    case 'Direct Subsidized':
    case 'Direct Unsubsidized':
    case 'Direct PLUS (Grad/Prof)':
    case 'Direct Consolidation':
    case 'Direct PLUS (Parent)':
      return true;
    case 'FFEL Subsidized Stafford':
    case 'FFEL Unsubsidized Stafford':
    case 'FFEL PLUS':
    case 'FFEL Consolidation':
    case 'Federal Perkins':
    case 'Private Student Loan':
      return false;
  }
}

/**
 * Check whether a loan type can become eligible via Direct Consolidation
 */
export function canConsolidateForPSLF(program: LoanProgram): boolean {
  switch (program) {
    case 'FFEL Subsidized Stafford':
    case 'FFEL Unsubsidized Stafford':
    case 'FFEL PLUS':
    case 'FFEL Consolidation':
    case 'Federal Perkins':
      return true;
    case 'Private Student Loan':
      return false;
    default:
      return true; // Direct loans can also be consolidated together if desired
  }
}

/**
 * Check employer eligibility category
 */
export function getEmployerEligibilityStatus(category: EmployerCategory): {
  status: 'qualifies' | 'conditional' | 'disqualified';
  label: string;
  badgeClass: string;
  explanation: string;
} {
  switch (category) {
    case 'Government (Federal/State/Local/Tribal)':
      return {
        status: 'qualifies',
        label: 'Qualifies Fully',
        badgeClass: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
        explanation: 'Any federal, state, municipal, local, public school district, public university, or tribal entity qualifies regardless of role, subject to the 30-hour rule.',
      };
    case '501(c)(3) Non-Profit':
      return {
        status: 'qualifies',
        label: 'Qualifies Automatically',
        badgeClass: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
        explanation: 'All 501(c)(3) tax-exempt organizations qualify automatically regardless of mission or job title.',
      };
    case 'Other Public Service Non-Profit (Non-501c3)':
      return {
        status: 'conditional',
        label: 'Conditional Review',
        badgeClass: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800',
        explanation: 'Qualifies only if the organization provides qualifying public services (public safety, health, education, library) and is not a labor union or partisan political entity.',
      };
    case 'For-Profit / Private Commercial':
      return {
        status: 'disqualified',
        label: 'Does Not Qualify',
        badgeClass: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
        explanation: 'For-profit commercial businesses never qualify for PSLF, even if contracted to perform public government projects.',
      };
    case 'Partisan Political / Labor Union':
      return {
        status: 'disqualified',
        label: 'Does Not Qualify',
        badgeClass: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
        explanation: 'Labor unions and partisan political organizations are explicitly excluded from PSLF by federal regulation.',
      };
  }
}

/**
 * Check full-time employment status
 */
export function isFullTimeEmployment(hoursPerWeek: number): boolean {
  return hoursPerWeek >= 30;
}

/**
 * Standard 10-Year Amortization formula
 */
export function calculate10YearStandardMonthlyPayment(principal: number, annualRatePct: number): number {
  if (principal <= 0) return 0;
  if (annualRatePct <= 0) return principal / 120;
  const monthlyRate = annualRatePct / 100 / 12;
  const numPayments = 120;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

/**
 * Perform consolidation diagnostic
 */
export function analyzeConsolidation(loans: StudentLoan[]): ConsolidationAnalysis {
  const nonDirectLoans = loans.filter((l) => !isLoanNativelyPSLFEligible(l.program) && canConsolidateForPSLF(l.program));
  const directLoans = loans.filter((l) => isLoanNativelyPSLFEligible(l.program));

  const nonDirectBalance = nonDirectLoans.reduce((sum, l) => sum + l.balance, 0);
  const directBalance = directLoans.reduce((sum, l) => sum + l.balance, 0);
  const totalBalance = loans.reduce((sum, l) => sum + l.balance, 0);

  // Weighted average payment count under permanent regulations post-IDR account adjustment
  let totalBalancePaymentsProduct = 0;
  loans.forEach((l) => {
    totalBalancePaymentsProduct += l.balance * l.qualifyingPaymentsMade;
  });
  const weightedPaymentEstimate = totalBalance > 0 ? Math.round(totalBalancePaymentsProduct / totalBalance) : 0;

  // Direct Consolidation Interest Rate = Weighted average rounded UP to nearest 1/8th of a percent (0.125%)
  let totalBalanceRateProduct = 0;
  loans.forEach((l) => {
    totalBalanceRateProduct += l.balance * l.interestRate;
  });
  const rawWeightedRate = totalBalance > 0 ? totalBalanceRateProduct / totalBalance : 5.0;
  // Round up to nearest 1/8th (0.125)
  const directConsolidationRate = Math.ceil(rawWeightedRate * 8) / 8;

  return {
    requiresConsolidation: nonDirectLoans.length > 0,
    nonDirectLoanCount: nonDirectLoans.length,
    nonDirectBalance,
    directBalance,
    totalBalance,
    weightedPaymentEstimate,
    affectedLoans: nonDirectLoans,
    directConsolidationRate,
  };
}

/**
 * Compare Standard Repayment vs IDR Plans for PSLF
 */
export function generateRepaymentQuotes(profile: BorrowerProfile): RepaymentPlanQuote[] {
  const totalBalance = profile.loans.reduce((sum, l) => sum + l.balance, 0);
  
  // Calculate weighted average interest rate
  let totalBalanceRateProduct = 0;
  profile.loans.forEach((l) => {
    totalBalanceRateProduct += l.balance * l.interestRate;
  });
  const avgRatePct = totalBalance > 0 ? totalBalanceRateProduct / totalBalance : 5.5;
  const monthlyInterestRate = avgRatePct / 100 / 12;

  // Has Parent PLUS?
  const hasParentPlus = profile.loans.some((l) => l.program === 'Direct PLUS (Parent)');
  
  // Base poverty guideline for profile
  const basePovertyLine = getPovertyGuideline(profile.familySize, profile.region);

  // Standard 10-Year Payment
  const standard10Monthly = calculate10YearStandardMonthlyPayment(totalBalance, avgRatePct);
  const totalPaidStandard10 = standard10Monthly * 120;
  // Because 10-year standard pays loan to 0 at month 120, total forgiven is 0
  const standardQuote: RepaymentPlanQuote = {
    planId: 'standard_10',
    planName: '10-Year Standard Repayment',
    pslfEligible: true, // Technically eligible on Direct Non-Consolidation, but financially counterproductive
    initialMonthlyPayment: standard10Monthly,
    endingMonthlyPayment: standard10Monthly,
    totalPaid120: totalPaidStandard10,
    totalForgiven: 0,
    monthlyDiscretionaryIncome: 0,
    discretionaryPercentage: 0,
    povertyThreshold: 0,
    eligibilityNote: 'Technically eligible for non-consolidated Direct loans, but fully pays off debt to $0 at month 120, leaving zero forgiveness.',
    isRecommended: false,
    warning: 'Worst strategy for PSLF: you pay 100% of principal plus interest out-of-pocket, defeating the purpose of forgiveness.',
  };

  // Helper to project 10-year (120 payments) stream under IDR
  const simulateIdrPlan = (
    povertyMultiplier: number,
    discretionaryPct: number,
    capAtStandard: boolean,
    interestSubsidyPct: number = 0 // 1 = 100% unpaid interest subsidy (like SAVE)
  ): { initial: number; ending: number; totalPaid: number; forgiven: number } => {
    let currentBalance = totalBalance;
    let totalPaid = 0;
    let initialPayment = 0;
    let endingPayment = 0;

    for (let year = 0; year < 10; year++) {
      // Inflate AGI by growth rate annually
      const yearAgi = profile.agi * Math.pow(1 + profile.annualIncomeGrowthRate / 100, year);
      const yearPoverty = basePovertyLine * Math.pow(1.025, year); // Assume ~2.5% inflation in poverty line
      const discretionary = Math.max(0, yearAgi - povertyMultiplier * yearPoverty);
      
      let monthlyPmt = (discretionary * discretionaryPct) / 12;
      if (capAtStandard && monthlyPmt > standard10Monthly) {
        monthlyPmt = standard10Monthly;
      }

      if (year === 0) initialPayment = monthlyPmt;
      if (year === 9) endingPayment = monthlyPmt;

      for (let m = 0; m < 12; m++) {
        totalPaid += monthlyPmt;
        const accruedInterest = currentBalance * monthlyInterestRate;
        if (monthlyPmt >= accruedInterest) {
          const principalReduction = monthlyPmt - accruedInterest;
          currentBalance = Math.max(0, currentBalance - principalReduction);
        } else {
          // Payment less than interest
          const unpaidInterest = accruedInterest - monthlyPmt;
          // Apply interest subsidy
          const interestAdded = unpaidInterest * (1 - interestSubsidyPct);
          currentBalance += interestAdded;
        }
      }
    }

    const forgiven = Math.max(0, currentBalance);
    return {
      initial: Math.round(initialPayment),
      ending: Math.round(endingPayment),
      totalPaid: Math.round(totalPaid),
      forgiven: Math.round(forgiven),
    };
  };

  // 1. SAVE Plan (Inactive / Court Injunction)
  const saveSim = simulateIdrPlan(2.25, 0.08, false, 1.0);
  const saveQuote: RepaymentPlanQuote = {
    planId: 'save',
    planName: 'SAVE Plan (Court Injunction — Inactive)',
    pslfEligible: false,
    initialMonthlyPayment: saveSim.initial,
    endingMonthlyPayment: saveSim.ending,
    totalPaid120: saveSim.totalPaid,
    totalForgiven: saveSim.forgiven,
    monthlyDiscretionaryIncome: Math.max(0, profile.agi - 2.25 * basePovertyLine) / 12,
    discretionaryPercentage: 8,
    povertyThreshold: 2.25 * basePovertyLine,
    eligibilityNote: 'Currently inactive under federal court injunction. Months spent in administrative forbearance do not automatically count; use PSLF Buyback once you reach 120 certified employment months.',
    isRecommended: false,
    warning: 'Blocked by 8th Circuit Court Injunction. Not accepting new enrollments; use IBR for active qualifying credit.',
  };

  // 2. IBR (Income-Based Repayment — Statutory Benchmark)
  const ibrNewSim = simulateIdrPlan(1.50, 0.10, true, 0.5);
  const ibrNewQuote: RepaymentPlanQuote = {
    planId: 'ibr_new',
    planName: 'IBR (Income-Based Repayment — Statutory Standard)',
    pslfEligible: true,
    initialMonthlyPayment: ibrNewSim.initial,
    endingMonthlyPayment: ibrNewSim.ending,
    totalPaid120: ibrNewSim.totalPaid,
    totalForgiven: ibrNewSim.forgiven,
    monthlyDiscretionaryIncome: Math.max(0, profile.agi - 1.50 * basePovertyLine) / 12,
    discretionaryPercentage: 10,
    povertyThreshold: 1.50 * basePovertyLine,
    eligibilityNote: 'Statutorily protected under Higher Education Act Section 493C (20 U.S.C. § 1098e). Immune to litigation and guarantees qualifying PSLF credits.',
    isRecommended: !hasParentPlus,
  };

  // 3. PAYE (Pay As You Earn)
  const payeSim = simulateIdrPlan(1.50, 0.10, true, 0.5);
  const payeQuote: RepaymentPlanQuote = {
    planId: 'paye',
    planName: 'PAYE (Pay As You Earn)',
    pslfEligible: true,
    initialMonthlyPayment: payeSim.initial,
    endingMonthlyPayment: payeSim.ending,
    totalPaid120: payeSim.totalPaid,
    totalForgiven: payeSim.forgiven,
    monthlyDiscretionaryIncome: Math.max(0, profile.agi - 1.50 * basePovertyLine) / 12,
    discretionaryPercentage: 10,
    povertyThreshold: 1.50 * basePovertyLine,
    eligibilityNote: '10% of discretionary income (150% poverty line). Payment is capped at standard 10-year amount.',
    isRecommended: false,
  };

  // 4. IBR (Old Borrower - prior to July 1, 2014)
  const ibrOldSim = simulateIdrPlan(1.50, 0.15, true, 0.3);
  const ibrOldQuote: RepaymentPlanQuote = {
    planId: 'ibr_old',
    planName: 'IBR (Older Borrowers prior to July 2014)',
    pslfEligible: true,
    initialMonthlyPayment: ibrOldSim.initial,
    endingMonthlyPayment: ibrOldSim.ending,
    totalPaid120: ibrOldSim.totalPaid,
    totalForgiven: ibrOldSim.forgiven,
    monthlyDiscretionaryIncome: Math.max(0, profile.agi - 1.50 * basePovertyLine) / 12,
    discretionaryPercentage: 15,
    povertyThreshold: 1.50 * basePovertyLine,
    eligibilityNote: '15% of discretionary income. Standard fallback for older loans before 2014.',
    isRecommended: false,
  };

  // 5. ICR (Income-Contingent Repayment)
  const icrSim = simulateIdrPlan(1.00, 0.20, false, 0);
  const icrQuote: RepaymentPlanQuote = {
    planId: 'icr',
    planName: 'ICR (Income-Contingent Repayment)',
    pslfEligible: true,
    initialMonthlyPayment: icrSim.initial,
    endingMonthlyPayment: icrSim.ending,
    totalPaid120: icrSim.totalPaid,
    totalForgiven: icrSim.forgiven,
    monthlyDiscretionaryIncome: Math.max(0, profile.agi - 1.00 * basePovertyLine) / 12,
    discretionaryPercentage: 20,
    povertyThreshold: 1.00 * basePovertyLine,
    eligibilityNote: hasParentPlus
      ? 'The only standard IDR plan directly accessible to consolidated Parent PLUS loans without double-consolidation.'
      : '20% of discretionary income (100% poverty line). Typically higher payments than SAVE or PAYE.',
    isRecommended: hasParentPlus,
  };

  return [standardQuote, saveQuote, payeQuote, ibrNewQuote, ibrOldQuote, icrQuote];
}

/**
 * Calculate dynamic PSLF Readiness Score (0-100%)
 */
export function calculateReadinessScore(profile: BorrowerProfile): {
  score: number;
  status: 'green' | 'amber' | 'red';
  statusBadge: string;
  headline: string;
  summary: string;
  breakdown: {
    key: string;
    label: string;
    points: number;
    maxPoints: number;
    status: 'passed' | 'warning' | 'failed';
    note: string;
  }[];
} {
  let score = 0;
  const breakdown: {
    key: string;
    label: string;
    points: number;
    maxPoints: number;
    status: 'passed' | 'warning' | 'failed';
    note: string;
  }[] = [];

  // 1. Employer Qualification (35 max) — 34 CFR § 685.219 (Supports Concurrent Multi-Employer Aggregation)
  const qualifyingEmployers = profile.employment.filter((e) => {
    const status = getEmployerEligibilityStatus(e.category);
    return status.status === 'qualifies' || status.status === 'conditional';
  });

  const totalQualifyingHours = qualifyingEmployers.reduce((sum, e) => sum + e.hoursPerWeek, 0);
  const isMultiEmployer = qualifyingEmployers.length > 1;

  const hasAutoQualifying = qualifyingEmployers.some(
    (e) => e.category === '501(c)(3) Non-Profit' || e.category === 'Government (Federal/State/Local/Tribal)'
  ) && totalQualifyingHours >= 30;

  const hasConditional = qualifyingEmployers.some(
    (e) => e.category === 'Other Public Service Non-Profit (Non-501c3)'
  ) && totalQualifyingHours >= 30;

  if (hasAutoQualifying) {
    score += 35;
    breakdown.push({
      key: 'employer',
      label: 'Employer Tax Status & Hours',
      points: 35,
      maxPoints: 35,
      status: 'passed',
      note: isMultiEmployer
        ? `Qualified via Concurrent Part-Time Aggregation (${totalQualifyingHours} combined hrs/wk across ${qualifyingEmployers.length} qualifying employers under 34 CFR § 685.219).`
        : 'Verified 501(c)(3) or Government agency meeting the 30+ hr/wk statutory standard.',
    });
  } else if (hasConditional) {
    score += 22;
    breakdown.push({
      key: 'employer',
      label: 'Employer Tax Status & Hours',
      points: 22,
      maxPoints: 35,
      status: 'warning',
      note: 'Non-501(c)(3) public service non-profit requires specific public service documentation.',
    });
  } else {
    breakdown.push({
      key: 'employer',
      label: 'Employer Tax Status & Hours',
      points: 0,
      maxPoints: 35,
      status: 'failed',
      note: totalQualifyingHours < 30
        ? `Total qualifying hours (${totalQualifyingHours} hrs/wk) is under the 30-hour statutory threshold.`
        : 'Current employer is for-profit or not a qualifying tax-exempt public entity.',
    });
  }

  // 2. Loan Program Compliance (35 max)
  const consolidation = analyzeConsolidation(profile.loans);
  const totalBalance = consolidation.totalBalance;
  const hasParentPlus = profile.loans.some((l) => l.program === 'Direct PLUS (Parent)');
  const hasPrivate = profile.loans.some((l) => l.program === 'Private Student Loan');

  if (totalBalance <= 0) {
    breakdown.push({
      key: 'loans',
      label: 'Federal Loan Program Eligibility',
      points: 0,
      maxPoints: 35,
      status: 'failed',
      note: 'No active student loans recorded in portfolio.',
    });
  } else if (!consolidation.requiresConsolidation && !hasParentPlus && !hasPrivate) {
    score += 35;
    breakdown.push({
      key: 'loans',
      label: 'Federal Loan Program Eligibility',
      points: 35,
      maxPoints: 35,
      status: 'passed',
      note: 'All loans are Direct Loans natively qualified for PSLF credits.',
    });
  } else if (consolidation.requiresConsolidation) {
    const directRatio = totalBalance > 0 ? consolidation.directBalance / totalBalance : 0;
    const loanPoints = Math.round(15 + directRatio * 10);
    score += loanPoints;
    breakdown.push({
      key: 'loans',
      label: 'Federal Loan Program Eligibility',
      points: loanPoints,
      maxPoints: 35,
      status: 'warning',
      note: `${consolidation.nonDirectLoanCount} non-Direct loans ($${consolidation.nonDirectBalance.toLocaleString()}) require Direct Consolidation.`,
    });
  } else if (hasParentPlus) {
    score += 25;
    breakdown.push({
      key: 'loans',
      label: 'Federal Loan Program Eligibility',
      points: 25,
      maxPoints: 35,
      status: 'warning',
      note: 'Parent PLUS loans require ICR or double-consolidation workaround to qualify.',
    });
  } else {
    score += 10;
    breakdown.push({
      key: 'loans',
      label: 'Federal Loan Program Eligibility',
      points: 10,
      maxPoints: 35,
      status: 'warning',
      note: 'Review loan programs for federal vs private classifications.',
    });
  }

  // 3. IDR Repayment Strategy (20 max)
  // Check if borrower would benefit from IDR
  const quotes = generateRepaymentQuotes(profile);
  const recommendedQuote = quotes.find((q) => q.isRecommended) || quotes[1];
  const standardQuote = quotes[0];
  const savings = standardQuote.totalPaid120 - recommendedQuote.totalPaid120;

  if (savings > 0) {
    score += 20;
    breakdown.push({
      key: 'repayment',
      label: 'Repayment Plan Alignment',
      points: 20,
      maxPoints: 20,
      status: 'passed',
      note: `Enrolled/targeted for IDR (${recommendedQuote.planName}), maximizing loan forgiveness.`,
    });
  } else {
    score += 12;
    breakdown.push({
      key: 'repayment',
      label: 'Repayment Plan Alignment',
      points: 12,
      maxPoints: 20,
      status: 'warning',
      note: 'Standard plan payoff matches IDR; verify if public service timeline aligns with debt size.',
    });
  }

  // 4. Certification & Audit Readiness (10 max)
  const hasCertifiedEmployment = profile.employment.some((e) => e.isFullTimeCertified);
  if (hasCertifiedEmployment) {
    score += 10;
    breakdown.push({
      key: 'certification',
      label: 'Employment Certification Status',
      points: 10,
      maxPoints: 10,
      status: 'passed',
      note: 'Prior employment periods certified via official PSLF Form or active contract.',
    });
  } else {
    score += 5;
    breakdown.push({
      key: 'certification',
      label: 'Employment Certification Status',
      points: 5,
      maxPoints: 10,
      status: 'warning',
      note: 'Initial electronic PSLF certification form pending submission on StudentAid.gov.',
    });
  }

  let status: 'green' | 'amber' | 'red' = 'green';
  let statusBadge = 'Strong PSLF Trajectory';
  let headline = 'Your Portfolio Is Well-Positioned for PSLF';
  let summary = 'Your employer and loan structure satisfy the primary federal statutory requirements.';

  if (score < 50) {
    status = 'red';
    statusBadge = 'Action Required';
    headline = 'Critical Eligibility Barriers Detected';
    summary = 'Your employer or loan type requires fundamental changes before PSLF credits can be earned.';
  } else if (score < 80) {
    status = 'amber';
    statusBadge = 'Needs Action';
    headline = 'Near PSLF-Ready with Action Items';
    summary = 'Address consolidation or certification steps to protect and unlock your 120-payment counter.';
  }

  return {
    score,
    status,
    statusBadge,
    headline,
    summary,
    breakdown,
  };
}

/**
 * Generate personal roadmap tasks based on profile
 */
export function generateRoadmapTasks(profile: BorrowerProfile): {
  id: string;
  title: string;
  category: 'consolidation' | 'certification' | 'repayment' | 'annual';
  description: string;
  actionUrl?: string;
  actionLabel?: string;
  isCompleted: boolean;
  isUrgent: boolean;
}[] {
  const consolidation = analyzeConsolidation(profile.loans);
  const hasParentPlus = profile.loans.some((l) => l.program === 'Direct PLUS (Parent)');
  const primaryEmployer = profile.employment[0];
  const quotes = generateRepaymentQuotes(profile);
  const recommendedQuote = quotes.find((q) => q.isRecommended) || quotes[1];

  const tasks: {
    id: string;
    title: string;
    category: 'consolidation' | 'certification' | 'repayment' | 'annual';
    description: string;
    actionUrl?: string;
    actionLabel?: string;
    isCompleted: boolean;
    isUrgent: boolean;
  }[] = [];

  // Task 1: Consolidation if required
  if (consolidation.requiresConsolidation) {
    tasks.push({
      id: 'task-consolidation',
      title: `Consolidate ${consolidation.nonDirectLoanCount} Legacy Loans ($${consolidation.nonDirectBalance.toLocaleString()}) into a Direct Consolidation Loan`,
      category: 'consolidation',
      description: 'Your FFEL and/or Perkins loans will not earn PSLF credit until consolidated. Apply online via StudentAid.gov. Under permanent regulations, you receive a weighted average payment count.',
      actionUrl: 'https://studentaid.gov/loan-consolidation/',
      actionLabel: 'Launch Direct Consolidation',
      isCompleted: false,
      isUrgent: true,
    });
  }

  // Task 2: Parent PLUS Double Consolidation
  if (hasParentPlus) {
    tasks.push({
      id: 'task-parent-plus',
      title: 'Execute Parent PLUS Double-Consolidation Strategy',
      category: 'consolidation',
      description: 'Without double consolidation, Parent PLUS loans are restricted to Income-Contingent Repayment (20% of discretionary income). Completing the multi-step double consolidation unlocks SAVE/PAYE/IBR at 5-10%.',
      actionLabel: 'View Double-Consolidation Guide',
      isCompleted: false,
      isUrgent: true,
    });
  }

  // Task 3: PSLF Help Tool
  tasks.push({
    id: 'task-help-tool',
    title: `Generate PSLF Form with Employer EIN (${primaryEmployer?.ein || 'From W-2 Box b'})`,
    category: 'certification',
    description: `Log into StudentAid.gov PSLF Help Tool and enter ${primaryEmployer?.employerName || 'your employer'}'s details to verify qualifying status and generate digital signature packet.`,
    actionUrl: 'https://studentaid.gov/pslf/',
    actionLabel: 'Open PSLF Help Tool',
    isCompleted: primaryEmployer?.isFullTimeCertified ?? false,
    isUrgent: false,
  });

  // Task 4: Digital Signature DocuSign
  tasks.push({
    id: 'task-docusign',
    title: 'Route Electronic Signature to Authorized HR Signatory',
    category: 'certification',
    description: 'Provide your HR/payroll representative’s official institutional email address so the U.S. Department of Education can send a secure DocuSign package to certify your 30+ hr/week status.',
    isCompleted: false,
    isUrgent: false,
  });

  // Task 5: Enroll in Statutory IBR Plan
  tasks.push({
    id: 'task-idr-enroll',
    title: 'Enroll in Statutorily Protected Income-Based Repayment (IBR)',
    category: 'repayment',
    description: `IBR is established by Congress under HEA Section 493C (20 U.S.C. § 1098e) and guarantees qualifying PSLF credits without legal vulnerability. Establishes your payment at ~$${recommendedQuote.initialMonthlyPayment}/month, shielding your income and maximizing tax-free forgiveness.`,
    actionUrl: 'https://studentaid.gov/idr/',
    actionLabel: 'Apply for IBR on StudentAid.gov',
    isCompleted: false,
    isUrgent: false,
  });

  // Task 6: Litigation & Administrative Forbearance Note (PSLF Buyback)
  tasks.push({
    id: 'task-pslf-buyback',
    title: 'Litigation & Administrative Forbearance Note: Prepare for PSLF Buyback',
    category: 'repayment',
    description: 'If you were placed in court-ordered administrative forbearance during the SAVE litigation, those paused months do not count automatically. Once you reach 120 certified employment months, submit an official PSLF Buyback request to receive retroactive credit at your historical IDR rate.',
    actionUrl: 'https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service/questions',
    actionLabel: 'View Buyback Rules',
    isCompleted: false,
    isUrgent: false,
  });

  // Task 7: Annual Recertification & Tracker Monitoring
  tasks.push({
    id: 'task-annual-recert',
    title: 'Establish Annual PSLF Recertification & Track 120 Payments',
    category: 'annual',
    description: 'Set a calendar reminder to submit an updated PSLF form every 12 months or immediately upon switching employers to maintain verified payment counts in your servicer dashboard.',
    isCompleted: false,
    isUrgent: false,
  });

  return tasks;
}

