export type LoanProgram = 
  | 'Direct Subsidized'
  | 'Direct Unsubsidized'
  | 'Direct PLUS (Grad/Prof)'
  | 'Direct Consolidation'
  | 'Direct PLUS (Parent)'
  | 'FFEL Subsidized Stafford'
  | 'FFEL Unsubsidized Stafford'
  | 'FFEL PLUS'
  | 'FFEL Consolidation'
  | 'Federal Perkins'
  | 'Private Student Loan';

export type EmployerCategory =
  | '501(c)(3) Non-Profit'
  | 'Government (Federal/State/Local/Tribal)'
  | 'Other Public Service Non-Profit (Non-501c3)'
  | 'For-Profit / Private Commercial'
  | 'Partisan Political / Labor Union';

export type MaritalFilingStatus = 'single' | 'married_joint' | 'married_separate';

export type USRegion = 'lower48' | 'alaska' | 'hawaii';

export interface StudentLoan {
  id: string;
  name: string;
  program: LoanProgram;
  balance: number;
  interestRate: number; // e.g. 5.5 for 5.5%
  qualifyingPaymentsMade: number; // e.g. 36 of 120
  servicer: string;
}

export interface EmploymentRecord {
  id: string;
  employerName: string;
  ein: string; // XX-XXXXXXX format
  category: EmployerCategory;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM or 'Present'
  hoursPerWeek: number;
  isFullTimeCertified: boolean;
  notes?: string;
}

export interface BorrowerProfile {
  id: string;
  scenarioName: string;
  borrowerName: string;
  occupation: string;
  agi: number; // Adjusted Gross Income
  spouseAgi?: number;
  familySize: number;
  region: USRegion;
  filingStatus: MaritalFilingStatus;
  annualIncomeGrowthRate: number; // e.g. 3 for 3%
  loans: StudentLoan[];
  employment: EmploymentRecord[];
}

export interface RepaymentPlanQuote {
  planId: 'standard_10' | 'save' | 'paye' | 'ibr_new' | 'ibr_old' | 'icr';
  planName: string;
  pslfEligible: boolean;
  initialMonthlyPayment: number;
  endingMonthlyPayment: number;
  totalPaid120: number; // Total out-of-pocket over 120 payments
  totalForgiven: number; // Balance forgiven at month 120
  monthlyDiscretionaryIncome: number;
  discretionaryPercentage: number;
  povertyThreshold: number;
  eligibilityNote: string;
  isRecommended: boolean;
  warning?: string;
}

export interface ConsolidationAnalysis {
  requiresConsolidation: boolean;
  nonDirectLoanCount: number;
  nonDirectBalance: number;
  directBalance: number;
  totalBalance: number;
  weightedPaymentEstimate: number;
  affectedLoans: StudentLoan[];
  directConsolidationRate: number;
}

export interface ReadinessBreakdownItem {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  status: 'passed' | 'warning' | 'failed';
  note: string;
}

export interface ReadinessScoreResult {
  score: number;
  status: 'green' | 'amber' | 'red';
  statusBadge: string;
  headline: string;
  summary: string;
  breakdown: ReadinessBreakdownItem[];
}

export interface RoadmapTaskItem {
  id: string;
  title: string;
  category: 'consolidation' | 'certification' | 'repayment' | 'annual';
  description: string;
  actionUrl?: string;
  actionLabel?: string;
  isCompleted: boolean;
  isUrgent: boolean;
}

