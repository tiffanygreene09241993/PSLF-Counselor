import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { BorrowerProfile, EmploymentRecord } from '../types/counselor';

/**
 * Generates an official, pre-filled PSLF Certification & Application Form (OMB No. 1845-0110)
 * Pre-fills Section 1 (Borrower info) and Section 4 (Employer info & hours)
 */
export async function generatePreFilledPslfPdf(
  profile: BorrowerProfile,
  primaryEmployer: EmploymentRecord
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Page 1: Form Header, Section 1, Section 2, and Section 3
  const page1 = pdfDoc.addPage([612, 792]); // Standard US Letter
  const { width, height } = page1.getSize();

  const navy = rgb(0.08, 0.15, 0.32);
  const slateDark = rgb(0.12, 0.16, 0.24);
  const slateGray = rgb(0.35, 0.42, 0.52);
  const borderGray = rgb(0.8, 0.83, 0.88);
  const lightBg = rgb(0.96, 0.97, 0.99);

  // Top Government Header
  page1.drawRectangle({
    x: 36,
    y: height - 60,
    width: width - 72,
    height: 36,
    color: navy,
  });

  page1.drawText('PUBLIC SERVICE LOAN FORGIVENESS (PSLF) & TEPSLF CERTIFICATION', {
    x: 48,
    y: height - 42,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText('OMB No. 1845-0110 | Form Approved | U.S. Department of Education', {
    x: 48,
    y: height - 54,
    size: 8,
    font: fontRegular,
    color: rgb(0.85, 0.9, 1),
  });

  page1.drawText('APPLICATION FOR FORGIVENESS', {
    x: width - 210,
    y: height - 42,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Instructions bar
  page1.drawRectangle({
    x: 36,
    y: height - 90,
    width: width - 72,
    height: 24,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page1.drawText(
    'WARNING: Any person who knowingly makes a false statement or misrepresentation on this form may be subject to penalties.',
    {
      x: 44,
      y: height - 80,
      size: 7.5,
      font: fontBold,
      color: rgb(0.65, 0.15, 0.15),
    }
  );

  // SECTION 1: BORROWER INFORMATION
  let yPos = height - 120;

  page1.drawRectangle({
    x: 36,
    y: yPos - 6,
    width: width - 72,
    height: 20,
    color: slateDark,
  });

  page1.drawText('SECTION 1: BORROWER INFORMATION (PRE-FILLED)', {
    x: 44,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  yPos -= 28;

  // Box grid for Section 1
  page1.drawRectangle({
    x: 36,
    y: yPos - 85,
    width: width - 72,
    height: 100,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Row 1: Name and SSN Mask
  page1.drawText('1. Borrower Legal Name (Last, First, Middle Initial):', {
    x: 44,
    y: yPos,
    size: 7.5,
    font: fontRegular,
    color: slateGray,
  });
  page1.drawText(profile.borrowerName.toUpperCase(), {
    x: 44,
    y: yPos - 12,
    size: 10,
    font: fontBold,
    color: slateDark,
  });

  page1.drawText('2. Social Security Number (Masked):', {
    x: 320,
    y: yPos,
    size: 7.5,
    font: fontRegular,
    color: slateGray,
  });
  page1.drawText('XXX - XX - 6789', {
    x: 320,
    y: yPos - 12,
    size: 10,
    font: fontMono,
    color: slateDark,
  });

  page1.drawText('3. Date of Birth:', {
    x: 480,
    y: yPos,
    size: 7.5,
    font: fontRegular,
    color: slateGray,
  });
  page1.drawText('MM / DD / YYYY', {
    x: 480,
    y: yPos - 12,
    size: 9,
    font: fontRegular,
    color: slateGray,
  });

  // Row 2: Address & State
  yPos -= 36;
  page1.drawText('4. Street Address (City, State, Zip Code):', {
    x: 44,
    y: yPos,
    size: 7.5,
    font: fontRegular,
    color: slateGray,
  });
  page1.drawText(`100 Public Service Parkway, Suite 400 | State: ${profile.homeState || 'CA'}`, {
    x: 44,
    y: yPos - 12,
    size: 9,
    font: fontRegular,
    color: slateDark,
  });

  page1.drawText('5. Telephone (Primary):', {
    x: 360,
    y: yPos,
    size: 7.5,
    font: fontRegular,
    color: slateGray,
  });
  page1.drawText('(555) 019-2834', {
    x: 360,
    y: yPos - 12,
    size: 9,
    font: fontRegular,
    color: slateDark,
  });

  // Row 3: Email
  yPos -= 36;
  page1.drawText('6. Primary Email Address:', {
    x: 44,
    y: yPos,
    size: 7.5,
    font: fontRegular,
    color: slateGray,
  });
  page1.drawText(
    `${profile.borrowerName.toLowerCase().replace(/\s+/g, '.')}@publicservice.org`,
    {
      x: 44,
      y: yPos - 12,
      size: 9,
      font: fontRegular,
      color: slateDark,
    }
  );

  // SECTION 2: BORROWER REQUEST & CERTIFICATIONS
  yPos -= 50;
  page1.drawRectangle({
    x: 36,
    y: yPos - 6,
    width: width - 72,
    height: 20,
    color: slateDark,
  });

  page1.drawText('SECTION 2: BORROWER REQUEST, UNDERSTANDINGS, AND CERTIFICATIONS', {
    x: 44,
    y: yPos,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  yPos -= 28;
  page1.drawRectangle({
    x: 36,
    y: yPos - 80,
    width: width - 72,
    height: 94,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 1,
  });

  page1.drawRectangle({
    x: 46,
    y: yPos - 6,
    width: 10,
    height: 10,
    color: rgb(1, 1, 1),
    borderColor: slateDark,
    borderWidth: 1.5,
  });
  page1.drawText('X', {
    x: 48,
    y: yPos - 4.5,
    size: 8,
    font: fontBold,
    color: navy,
  });

  page1.drawText(
    'I request that the U.S. Department of Education evaluate my employment and loan records to determine my progress toward PSLF.',
    {
      x: 64,
      y: yPos - 4,
      size: 8,
      font: fontRegular,
      color: slateDark,
    }
  );

  page1.drawText(
    'I understand that: (1) To qualify for forgiveness, I must make 120 separate monthly payments under a qualifying repayment plan,',
    {
      x: 46,
      y: yPos - 22,
      size: 7.5,
      font: fontRegular,
      color: slateGray,
    }
  );
  page1.drawText(
    'while employed full-time by a qualifying public service employer; (2) Only Direct Loans are natively eligible; and (3) Forgiveness is tax-free.',
    {
      x: 46,
      y: yPos - 34,
      size: 7.5,
      font: fontRegular,
      color: slateGray,
    }
  );

  page1.drawText('Borrower Signature: _________________________________________', {
    x: 46,
    y: yPos - 62,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });
  page1.drawText('Date (MM/DD/YYYY): ____________________', {
    x: 360,
    y: yPos - 62,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });

  // Page 2: Section 4 (Employer Information & Certification)
  const page2 = pdfDoc.addPage([612, 792]);
  let y2 = height - 60;

  // Header Page 2
  page2.drawRectangle({
    x: 36,
    y: y2,
    width: width - 72,
    height: 28,
    color: navy,
  });

  page2.drawText('SECTION 4: EMPLOYER INFORMATION & CERTIFICATION (FOR AUTHORIZED OFFICIAL)', {
    x: 44,
    y: y2 + 10,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page2.drawText('OMB No. 1845-0110 | Page 2 of 2 | Official Employer Verification', {
    x: width - 230,
    y: y2 + 10,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.85, 0.9, 1),
  });

  y2 -= 30;

  // Instructions for Employer
  page2.drawRectangle({
    x: 36,
    y: y2 - 32,
    width: width - 72,
    height: 40,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page2.drawText(
    'INSTRUCTIONS FOR AUTHORIZED OFFICIAL: Complete this section to certify the employment of the borrower above.',
    {
      x: 44,
      y: y2 - 4,
      size: 8,
      font: fontBold,
      color: navy,
    }
  );
  page2.drawText(
    'You must be authorized to verify employment records (e.g., HR Director, Payroll Manager, or Principal). All fields must be completed.',
    {
      x: 44,
      y: y2 - 18,
      size: 7.5,
      font: fontRegular,
      color: slateGray,
    }
  );

  y2 -= 55;

  // Box grid for Section 4
  page2.drawRectangle({
    x: 36,
    y: y2 - 280,
    width: width - 72,
    height: 290,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Employer Name
  page2.drawText('1. Employer Name (Official Legal Entity):', {
    x: 44,
    y: y2,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });
  page2.drawText(primaryEmployer.employerName.toUpperCase(), {
    x: 44,
    y: y2 - 14,
    size: 10,
    font: fontBold,
    color: slateDark,
  });

  // Employer EIN
  page2.drawText('2. Federal Employer Identification Number (FEIN / W-2 Box b):', {
    x: 320,
    y: y2,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });
  page2.drawText(primaryEmployer.ein, {
    x: 320,
    y: y2 - 14,
    size: 12,
    font: fontMono,
    color: navy,
  });

  // Employer Classification
  y2 -= 40;
  page2.drawText('3. Employer Category / Tax Status:', {
    x: 44,
    y: y2,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });
  page2.drawText(
    `${primaryEmployer.category} (34 CFR § 685.219 Qualifying Public Service Entity)`,
    {
      x: 44,
      y: y2 - 14,
      size: 9,
      font: fontBold,
      color: slateDark,
    }
  );

  // Employment Dates
  y2 -= 40;
  page2.drawText('4. Employment Start Date:', {
    x: 44,
    y: y2,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });
  page2.drawText(primaryEmployer.startDate || '2020-08', {
    x: 44,
    y: y2 - 14,
    size: 10,
    font: fontMono,
    color: slateDark,
  });

  page2.drawText('5. Employment End Date:', {
    x: 200,
    y: y2,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });
  page2.drawText(primaryEmployer.endDate || 'Still Employed / Present', {
    x: 200,
    y: y2 - 14,
    size: 10,
    font: fontBold,
    color: slateDark,
  });

  // Status & Hours per week
  page2.drawText('6. Employment Status:', {
    x: 360,
    y: y2,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });
  const isFT = (primaryEmployer.hoursPerWeek || 0) >= 30;
  page2.drawText(isFT ? '[X] Full-Time (>= 30 hrs)' : '[ ] Part-Time', {
    x: 360,
    y: y2 - 14,
    size: 9,
    font: fontBold,
    color: isFT ? navy : slateDark,
  });

  page2.drawText('7. Weekly Average Hours:', {
    x: 470,
    y: y2,
    size: 8,
    font: fontRegular,
    color: slateGray,
  });
  page2.drawText(`${primaryEmployer.hoursPerWeek || 40} hrs/wk`, {
    x: 470,
    y: y2 - 14,
    size: 11,
    font: fontMono,
    color: navy,
  });

  // HR Sign-off Block
  y2 -= 55;
  page2.drawRectangle({
    x: 44,
    y: y2 - 120,
    width: width - 88,
    height: 120,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page2.drawText('CERTIFICATION BY AUTHORIZED OFFICIAL:', {
    x: 52,
    y: y2 - 12,
    size: 8,
    font: fontBold,
    color: slateDark,
  });
  page2.drawText(
    'I certify that the information provided in Section 4 is true, complete, and accurate based on official personnel records.',
    {
      x: 52,
      y: y2 - 24,
      size: 7.5,
      font: fontRegular,
      color: slateGray,
    }
  );

  page2.drawText('Official Signature: _________________________________________', {
    x: 52,
    y: y2 - 50,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });
  page2.drawText('Official Title: __________________________________', {
    x: 310,
    y: y2 - 50,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });

  page2.drawText('Printed Name: _____________________________________________', {
    x: 52,
    y: y2 - 75,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });
  page2.drawText('Official Phone: __________________________________', {
    x: 310,
    y: y2 - 75,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });

  page2.drawText('Official Email: _____________________________________________', {
    x: 52,
    y: y2 - 100,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });
  page2.drawText('Date Signed: ____________________________________', {
    x: 310,
    y: y2 - 100,
    size: 8.5,
    font: fontBold,
    color: slateDark,
  });

  // Footer
  page2.drawText('SUBMISSION INSTRUCTIONS: Submit digitally via StudentAid.gov PSLF Help Tool or mail/fax to MOHELA / Dept of Education.', {
    x: 44,
    y: 35,
    size: 7,
    font: fontBold,
    color: slateGray,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Browser download helper for generated PDF
 */
export function downloadPslfPdf(filename: string, pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
