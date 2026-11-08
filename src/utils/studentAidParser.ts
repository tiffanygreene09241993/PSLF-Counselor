import { LoanProgram, StudentLoan } from '../types/counselor';

export interface ParsedStudentAidLoan {
  id: string;
  loanType: string;
  awardId: string;
  balance: number;
  interestRate: number;
  servicer: string;
  status: string;
  cumulativePaymentCount: number;
  isDirect: boolean;
  needsConsolidation: boolean;
  isParentPlus: boolean;
  program: LoanProgram;
  disqualificationReason?: string;
}

/**
 * Maps raw loan type strings from MyStudentData.txt or freeform paste into our standard LoanProgram
 */
export function normalizeLoanProgram(raw: string): LoanProgram {
  const upper = raw.toUpperCase();

  if (upper.includes('PARENT') || (upper.includes('PLUS') && !upper.includes('GRAD'))) {
    return 'Direct PLUS (Parent)';
  }
  if (upper.includes('DIRECT') && upper.includes('GRAD') && upper.includes('PLUS')) {
    return 'Direct PLUS (Grad/Prof)';
  }
  if (upper.includes('DIRECT') && upper.includes('CONSOLIDAT')) {
    return 'Direct Consolidation';
  }
  if (upper.includes('DIRECT') && upper.includes('SUB')) {
    return 'Direct Subsidized';
  }
  if (upper.includes('DIRECT') && upper.includes('UNSUB')) {
    return 'Direct Unsubsidized';
  }
  if (upper.includes('DIRECT') && upper.includes('PLUS')) {
    return 'Direct PLUS (Grad/Prof)';
  }
  if (upper.includes('DIRECT')) {
    return 'Direct Unsubsidized';
  }

  if (upper.includes('FFEL') && upper.includes('CONSOLIDAT')) {
    return 'FFEL Consolidation';
  }
  if (upper.includes('FFEL') && upper.includes('PLUS')) {
    return 'FFEL PLUS';
  }
  if (upper.includes('FFEL') && upper.includes('SUB')) {
    return 'FFEL Subsidized Stafford';
  }
  if (upper.includes('FFEL') && upper.includes('UNSUB')) {
    return 'FFEL Unsubsidized Stafford';
  }
  if (upper.includes('FFEL') || upper.includes('STAFFORD') || upper.includes('FFELP')) {
    return 'FFEL Subsidized Stafford';
  }

  if (upper.includes('PERKINS')) {
    return 'Federal Perkins';
  }

  if (upper.includes('PRIVATE') || upper.includes('DISCOVER') || upper.includes('SALLIE')) {
    return 'Private Student Loan';
  }

  return 'Direct Unsubsidized';
}

/**
 * Key-Value regex parser specifically targeting StudentAid.gov MyStudentData.txt downloads.
 * Parses lines including Loan Type Code:, Loan Type:, Loan Description:, Loan Award ID:,
 * Loan Outstanding Principal Balance:, Loan Cumulative Payment Count:, and Loan Status Description:.
 */
export function parseMyStudentData(rawText: string): ParsedStudentAidLoan[] {
  if (!rawText || !rawText.trim()) return [];

  const loans: ParsedStudentAidLoan[] = [];

  // Split by loan block delimiters (supports both "Loan Type Code:" and "Loan Type:")
  let loanBlocks = rawText.split(/(?:Loan Type Code:|Loan Type:)/i);

  // If the file starts with a header, slice(1) gets loan blocks. Otherwise, check line-by-line
  if (loanBlocks.length > 1) {
    loanBlocks.slice(1).forEach((block, idx) => {
      // 1. Loan Description / Type
      const typeMatch =
        block.match(/(?:Loan Description|Loan Type Description|Loan Type):\s*([^\r\n]+)/i) ||
        block.match(/^\s*([A-Za-z0-9\s()/-]+)[\r\n]/);
      const loanType = typeMatch ? typeMatch[1].trim() : 'Federal Student Loan';

      // 2. Loan Award ID / Identification
      const awardIdMatch = block.match(/(?:Loan Award ID|Award ID|Loan Identification):\s*([^\r\n]+)/i);
      const awardId = awardIdMatch ? awardIdMatch[1].trim() : `AID-${idx + 1}`;

      // 3. Outstanding Principal Balance
      const balanceMatch = block.match(
        /(?:Loan Outstanding Principal Balance|Outstanding Principal Balance|Principal Balance):\s*\$?([0-9,]+(?:\.[0-9]{2})?)/i
      );
      const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0;

      // 4. Status Description
      const statusMatch = block.match(
        /(?:Loan Status Description|Loan Status):\s*([^\r\n]+)/i
      );
      const status = statusMatch ? statusMatch[1].trim() : 'In Repayment';

      // 5. Cumulative Payment Count
      const paymentCountMatch = block.match(
        /(?:Loan Cumulative Payment Count|Cumulative Payment Count|Payment Count):\s*([0-9]+)/i
      );
      const cumulativePaymentCount = paymentCountMatch ? parseInt(paymentCountMatch[1], 10) : 0;

      // 6. Interest Rate
      const rateMatch = block.match(
        /(?:Loan Interest Rate|Interest Rate):\s*([0-9.]+)%?/i
      );
      const interestRate = rateMatch ? parseFloat(rateMatch[1]) : 5.25;

      // 7. Servicer
      const servicerMatch = block.match(
        /(?:Loan Current Servicer|Current Servicer|Servicer):\s*([^\r\n]+)/i
      );
      const servicer = servicerMatch ? servicerMatch[1].trim() : 'Federal Servicer';

      // Disqualification & Classification checks
      const isDirect = /DIRECT/i.test(loanType);
      const isParentPlus = (/PLUS/i.test(loanType) && !/GRAD/i.test(loanType)) || /PARENT/i.test(loanType);
      const isPerkins = /PERKINS/i.test(loanType);
      const isFfel = /FFEL/i.test(loanType) || /STAFFORD/i.test(loanType);

      const needsConsolidation = !isDirect;
      let disqualificationReason = undefined;

      if (isPerkins) {
        disqualificationReason = 'Federal Perkins Loan: Not natively held by Department of Ed. Must be consolidated into a Direct Loan before it can earn PSLF credits.';
      } else if (isFfel) {
        disqualificationReason = 'FFEL Program Loan: Commercial or guaranteed legacy loan. Zero payments qualify for PSLF until consolidated into a Direct Consolidation Loan on StudentAid.gov.';
      } else if (isParentPlus) {
        disqualificationReason = 'Parent PLUS Loan: Restricted from standard IDR plans. Requires either ICR or multi-step Double-Consolidation to qualify for PSLF.';
      }

      if (balance > 0 || cumulativePaymentCount > 0) {
        loans.push({
          id: `parsed-loan-${Date.now()}-${idx + 1}`,
          loanType,
          awardId,
          balance: Math.round(balance),
          interestRate,
          servicer,
          status,
          cumulativePaymentCount,
          isDirect,
          needsConsolidation,
          isParentPlus,
          program: normalizeLoanProgram(loanType),
          disqualificationReason,
        });
      }
    });
  }

  // Fallback: If formatted blocks didn't yield loans, use line-by-line fallback
  if (loans.length === 0) {
    const lines = rawText.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const dollarMatch = line.match(/\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/);
      if (!dollarMatch) continue;

      const balance = parseFloat(dollarMatch[1].replace(/,/g, ''));
      if (isNaN(balance) || balance < 100) continue;

      const program = normalizeLoanProgram(line);
      const isDirect = /DIRECT/i.test(line);
      const isParentPlus = program === 'Direct PLUS (Parent)';
      const needsConsolidation = !isDirect;

      loans.push({
        id: `parsed-fallback-${Date.now()}-${loans.length + 1}`,
        loanType: line.split(/[$–-]/)[0]?.trim() || program,
        awardId: `AID-${loans.length + 1}`,
        balance: Math.round(balance),
        interestRate: 5.25,
        servicer: /mohela/i.test(line) ? 'MOHELA' : /nelnet/i.test(line) ? 'Nelnet' : 'Federal Servicer',
        status: 'In Repayment',
        cumulativePaymentCount: 0,
        isDirect,
        needsConsolidation,
        isParentPlus,
        program,
        disqualificationReason: needsConsolidation
          ? 'Legacy Non-Direct Loan: Must be consolidated to Direct Loan to earn PSLF credit.'
          : undefined,
      });
    }
  }

  return loans;
}

/**
 * Convenience wrapper converting parsed MyStudentData into standard StudentLoan[] array
 */
export function parseStudentAidData(rawText: string): StudentLoan[] {
  const parsed = parseMyStudentData(rawText);
  return parsed.map((item) => ({
    id: item.id,
    name: item.loanType,
    program: item.program,
    balance: item.balance,
    interestRate: item.interestRate,
    qualifyingPaymentsMade: item.cumulativePaymentCount,
    servicer: item.servicer,
  }));
}

/**
 * Sample MyStudentData.txt content for 1-click user testing
 */
export const SAMPLE_MY_STUDENT_DATA = `MyStudentData.txt - Federal Student Aid Download
File Created Date: 2026-10-15

Loan Type Code: D1
Loan Type: Direct Subsidized
Loan Award ID: 12345678901
Loan Outstanding Principal Balance: $18,450.00
Loan Outstanding Interest Balance: $320.10
Loan Interest Rate: 4.80%
Loan Current Servicer: MOHELA
Loan Status Description: In Repayment
Loan Cumulative Payment Count: 42

Loan Type Code: D2
Loan Type: Direct Unsubsidized
Loan Award ID: 12345678902
Loan Outstanding Principal Balance: $22,800.00
Loan Outstanding Interest Balance: $610.50
Loan Interest Rate: 5.28%
Loan Current Servicer: MOHELA
Loan Status Description: In Repayment
Loan Cumulative Payment Count: 42

Loan Type Code: SF
Loan Type: FFEL Subsidized Stafford
Loan Award ID: 12345678903
Loan Outstanding Principal Balance: $14,200.00
Loan Outstanding Interest Balance: $410.00
Loan Interest Rate: 6.80%
Loan Current Servicer: Navient
Loan Status Description: In Repayment
Loan Cumulative Payment Count: 0

Loan Type Code: PL
Loan Type: Direct PLUS (Parent)
Loan Award ID: 12345678904
Loan Outstanding Principal Balance: $28,500.00
Loan Outstanding Interest Balance: $820.00
Loan Interest Rate: 7.20%
Loan Current Servicer: MOHELA
Loan Status Description: In Repayment
Loan Cumulative Payment Count: 14

Loan Type Code: PU
Loan Type: Federal Perkins
Loan Award ID: 12345678905
Loan Outstanding Principal Balance: $7,500.00
Loan Outstanding Interest Balance: $0.00
Loan Interest Rate: 5.00%
Loan Current Servicer: ECSI Campus Loan
Loan Status Description: In Repayment
Loan Cumulative Payment Count: 0
`;
