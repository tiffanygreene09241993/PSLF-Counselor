import { LoanProgram, StudentLoan } from '../types/counselor';

/**
 * Maps raw loan type strings from MyStudentData.txt or freeform paste into our standard LoanProgram
 */
export function normalizeLoanProgram(raw: string): LoanProgram {
  const upper = raw.toUpperCase();

  if (upper.includes('PARENT') || (upper.includes('PLUS') && upper.includes('PARENT'))) {
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
  if (upper.includes('FFEL') || upper.includes('STAFFORD')) {
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
 * Parse MyStudentData.txt or freeform paste into StudentLoan objects
 */
export function parseStudentAidData(rawText: string): StudentLoan[] {
  if (!rawText || !rawText.trim()) return [];

  const loans: StudentLoan[] = [];
  const lines = rawText.split(/\r?\n/);

  // Strategy A: Official StudentAid.gov MyStudentData.txt format
  // Sections separated by "Loan Type:" or "Loan Award ID:"
  const hasLoanTypeMarker = lines.some((l) => l.toLowerCase().includes('loan type:'));

  if (hasLoanTypeMarker) {
    let currentLoanType = '';
    let currentBalance = 0;
    let currentRate = 5.0;
    let currentServicer = 'MOHELA';
    let currentStatus = '';
    let inLoanBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lower = line.toLowerCase();

      if (lower.startsWith('loan type:')) {
        // Save previous loan if balance > 0
        if (inLoanBlock && currentBalance > 0) {
          const program = normalizeLoanProgram(currentLoanType);
          loans.push({
            id: `imported-${Date.now()}-${loans.length + 1}`,
            name: currentLoanType || program,
            program,
            balance: Math.round(currentBalance),
            interestRate: currentRate,
            qualifyingPaymentsMade: 0,
            servicer: currentServicer || 'Federal Servicer',
          });
        }

        // Start new loan block
        inLoanBlock = true;
        currentLoanType = line.substring(line.indexOf(':') + 1).trim();
        currentBalance = 0;
        currentRate = 5.0;
        currentServicer = 'Federal Servicer';
        currentStatus = '';
      } else if (inLoanBlock) {
        if (
          lower.startsWith('loan outstanding principal balance:') ||
          lower.startsWith('outstanding principal balance:') ||
          lower.startsWith('current balance:')
        ) {
          const valStr = line.substring(line.indexOf(':') + 1).replace(/[$,]/g, '').trim();
          const parsed = parseFloat(valStr);
          if (!isNaN(parsed)) currentBalance = parsed;
        } else if (
          lower.startsWith('loan interest rate:') ||
          lower.startsWith('interest rate:')
        ) {
          const valStr = line.substring(line.indexOf(':') + 1).replace(/[%]/g, '').trim();
          const parsed = parseFloat(valStr);
          if (!isNaN(parsed) && parsed > 0) currentRate = parsed;
        } else if (
          lower.startsWith('loan current servicer:') ||
          lower.startsWith('current servicer:') ||
          lower.startsWith('servicer:')
        ) {
          const servicerVal = line.substring(line.indexOf(':') + 1).trim();
          if (servicerVal) currentServicer = servicerVal;
        }
      }
    }

    // Flush last block
    if (inLoanBlock && currentBalance > 0) {
      const program = normalizeLoanProgram(currentLoanType);
      loans.push({
        id: `imported-${Date.now()}-${loans.length + 1}`,
        name: currentLoanType || program,
        program,
        balance: Math.round(currentBalance),
        interestRate: currentRate,
        qualifyingPaymentsMade: 0,
        servicer: currentServicer || 'Federal Servicer',
      });
    }

    if (loans.length > 0) return loans;
  }

  // Strategy B: Line-by-line regex parsing for copy-pasted summaries
  // e.g. "Direct Subsidized Stafford - $14,500 - 4.99% - MOHELA"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length < 5) continue;

    // Look for dollar amount
    const dollarMatch = line.match(/\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/);
    if (!dollarMatch) continue;

    const balance = parseFloat(dollarMatch[1].replace(/,/g, ''));
    if (isNaN(balance) || balance < 100) continue;

    // Look for interest rate
    let rate = 5.25;
    const rateMatch = line.match(/([0-9]{1,2}(?:\.[0-9]{1,3})?)\s*%/);
    if (rateMatch) {
      rate = parseFloat(rateMatch[1]);
    }

    // Look for servicer name
    let servicer = 'Federal Servicer';
    if (/mohela/i.test(line)) servicer = 'MOHELA';
    else if (/nelnet/i.test(line)) servicer = 'Nelnet';
    else if (/aidvantage/i.test(line)) servicer = 'Aidvantage';
    else if (/navient/i.test(line)) servicer = 'Navient';
    else if (/ecsi/i.test(line)) servicer = 'ECSI';

    const program = normalizeLoanProgram(line);
    const loanName = line.split(/[$–-]/)[0]?.trim() || program;

    loans.push({
      id: `imported-line-${Date.now()}-${loans.length + 1}`,
      name: loanName.slice(0, 40),
      program,
      balance: Math.round(balance),
      interestRate: rate,
      qualifyingPaymentsMade: 0,
      servicer,
    });
  }

  return loans;
}

/**
 * Sample MyStudentData.txt content for 1-click user testing
 */
export const SAMPLE_MY_STUDENT_DATA = `MyStudentData.txt - Federal Student Aid Download
File Created Date: 2026-10-15

Loan Type: Direct Subsidized
Loan Award ID: 12345678901
Loan Outstanding Principal Balance: $18,450.00
Loan Outstanding Interest Balance: $320.10
Loan Interest Rate: 4.80%
Loan Current Servicer: MOHELA
Loan Status Description: In Repayment

Loan Type: Direct Unsubsidized
Loan Award ID: 12345678902
Loan Outstanding Principal Balance: $22,800.00
Loan Outstanding Interest Balance: $610.50
Loan Interest Rate: 5.28%
Loan Current Servicer: MOHELA
Loan Status Description: In Repayment

Loan Type: FFEL Subsidized Stafford
Loan Award ID: 12345678903
Loan Outstanding Principal Balance: $14,200.00
Loan Outstanding Interest Balance: $410.00
Loan Interest Rate: 6.80%
Loan Current Servicer: Navient
Loan Status Description: In Repayment

Loan Type: Federal Perkins
Loan Award ID: 12345678904
Loan Outstanding Principal Balance: $7,500.00
Loan Outstanding Interest Balance: $0.00
Loan Interest Rate: 5.00%
Loan Current Servicer: ECSI Campus Loan
Loan Status Description: In Repayment
`;
