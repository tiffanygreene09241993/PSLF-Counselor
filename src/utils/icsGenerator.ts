/**
 * Generates an RFC 5545 compliant .ics calendar file for IDR Annual Recertification
 * Includes automated alarms at 90 days, 30 days, and 7 days prior to deadline.
 */
export function generateIdrRecertificationIcs(options: {
  borrowerName: string;
  servicerName: string;
  deadlineDate: Date;
}): string {
  const { borrowerName, servicerName, deadlineDate } = options;

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatDateDay = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  const now = new Date();
  const dtstamp = formatDate(now);
  const uid = `idr-recert-${Date.now()}@pslf-counselor.internal`;

  const endDate = new Date(deadlineDate);
  endDate.setDate(endDate.getDate() + 1);

  const dtstart = formatDateDay(deadlineDate);
  const dtend = formatDateDay(endDate);

  const title = `CRITICAL: Federal Student Loan IDR Recertification Deadline (${servicerName})`;
  const description = [
    `Annual Income-Driven Repayment (IDR) Recertification for ${borrowerName}.`,
    `Federal Servicer: ${servicerName}.`,
    `Failure to recertify by this date will cause your monthly payment to spike to the Standard 10-Year Repayment amount and stall your PSLF progress.`,
    `Action Link: Submit your renewal online via StudentAid.gov/idr/`,
    `Statutory Standard: 34 CFR § 685.209 & § 685.221`,
  ].join('\\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Independent PSLF Counselor//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'LOCATION:StudentAid.gov/idr',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',

    // Alarm 1: 90 Days Before
    'BEGIN:VALARM',
    'TRIGGER:-P90D',
    'ACTION:DISPLAY',
    `DESCRIPTION:REMINDER (90 Days): Retrieve IRS Form 1040 / Tax Return for IDR Renewal (${servicerName})`,
    'END:VALARM',

    // Alarm 2: 30 Days Before
    'BEGIN:VALARM',
    'TRIGGER:-P30D',
    'ACTION:DISPLAY',
    `DESCRIPTION:URGENT (30 Days): Submit IDR Annual Recertification on StudentAid.gov to avoid payment spike`,
    'END:VALARM',

    // Alarm 3: 7 Days Before
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:FINAL WARNING (7 Days): Ensure ${servicerName} has processed your IDR renewal documentation`,
    'END:VALARM',

    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

/**
 * Triggers a browser download of the generated .ics calendar file
 */
export function downloadIcsFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
