import { EmployerCategory } from '../types/counselor';

export interface VerifiedEmployerRecord {
  ein: string;
  name: string;
  category: EmployerCategory;
  sector: 'K-12 School District' | 'Higher Education' | 'Healthcare / Hospital' | 'Charity / Non-Profit' | 'Government Agency';
  location: string;
  pslfStatus: 'Likely Eligible' | 'Conditional';
  verificationSource: string;
}

export const MOCK_VERIFIED_EMPLOYERS: VerifiedEmployerRecord[] = [
  // School Districts
  {
    ein: '13-1628123',
    name: 'New York City Department of Education (District 1-32)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'K-12 School District',
    location: 'New York, NY',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Public School Registry (NCES #3600077)',
  },
  {
    ein: '95-6001923',
    name: 'Los Angeles Unified School District (LAUSD)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'K-12 School District',
    location: 'Los Angeles, CA',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Public School Registry (NCES #0622710)',
  },
  {
    ein: '36-6001249',
    name: 'Chicago Public Schools (District #299)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'K-12 School District',
    location: 'Chicago, IL',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Public School Registry (NCES #1709930)',
  },
  {
    ein: '59-6000530',
    name: 'Miami-Dade County Public Schools',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'K-12 School District',
    location: 'Miami, FL',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Public School Registry (NCES #1200390)',
  },
  {
    ein: '47-0892144',
    name: 'Lincoln Unified Public School District (District #401)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'K-12 School District',
    location: 'Lincoln, NE',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Public School Registry (NCES #3173800)',
  },
  {
    ein: '88-6000021',
    name: 'Clark County School District (CCSD)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'K-12 School District',
    location: 'Las Vegas, NV',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Public School Registry (NCES #3200060)',
  },
  {
    ein: '74-6000100',
    name: 'Houston Independent School District (HISD)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'K-12 School District',
    location: 'Houston, TX',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Public School Registry (NCES #4823640)',
  },

  // Major Healthcare Non-Profits (501c3)
  {
    ein: '41-6011702',
    name: 'Mayo Clinic Foundation & Hospitals',
    category: '501(c)(3) Non-Profit',
    sector: 'Healthcare / Hospital',
    location: 'Rochester, MN',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) Determination (Exempt Org Database)',
  },
  {
    ein: '36-2198042',
    name: 'St. Jude Children’s Research Hospital / ALSAC',
    category: '501(c)(3) Non-Profit',
    sector: 'Healthcare / Hospital',
    location: 'Memphis, TN',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) Determination (Exempt Org Database)',
  },
  {
    ein: '34-0714585',
    name: 'Cleveland Clinic Foundation',
    category: '501(c)(3) Non-Profit',
    sector: 'Healthcare / Hospital',
    location: 'Cleveland, OH',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) Determination (Exempt Org Database)',
  },
  {
    ein: '04-2797302',
    name: 'Massachusetts General Hospital / Mass General Brigham',
    category: '501(c)(3) Non-Profit',
    sector: 'Healthcare / Hospital',
    location: 'Boston, MA',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) Determination (Exempt Org Database)',
  },
  {
    ein: '94-1105628',
    name: 'Kaiser Foundation Hospitals (Non-Profit Entity)',
    category: '501(c)(3) Non-Profit',
    sector: 'Healthcare / Hospital',
    location: 'Oakland, CA',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) Determination (Exempt Org Database)',
  },

  // Higher Education (Public Universities & 501c3 Colleges)
  {
    ein: '94-6002123',
    name: 'University of California System (Regents of UC)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'Higher Education',
    location: 'Oakland, CA',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'State Constitution / Public University System',
  },
  {
    ein: '74-6000203',
    name: 'The University of Texas at Austin',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'Higher Education',
    location: 'Austin, TX',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'State Higher Education Board Verification',
  },
  {
    ein: '31-6401098',
    name: 'The Ohio State University (OSU)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'Higher Education',
    location: 'Columbus, OH',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Public Higher Education Charter',
  },
  {
    ein: '13-6400434',
    name: 'City University of New York (CUNY)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'Higher Education',
    location: 'New York, NY',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Municipal & State Public University Charter',
  },

  // Major Charities & Non-Profits (501c3)
  {
    ein: '53-0196605',
    name: 'American National Red Cross',
    category: '501(c)(3) Non-Profit',
    sector: 'Charity / Non-Profit',
    location: 'Washington, DC',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Congressional Charter / IRS 501(c)(3) Database',
  },
  {
    ein: '13-3544520',
    name: 'Teach For America, Inc.',
    category: '501(c)(3) Non-Profit',
    sector: 'Charity / Non-Profit',
    location: 'New York, NY',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) National Database',
  },
  {
    ein: '13-1635294',
    name: 'Boys & Girls Clubs of America',
    category: '501(c)(3) Non-Profit',
    sector: 'Charity / Non-Profit',
    location: 'Atlanta, GA',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) National Database',
  },
  {
    ein: '36-2167732',
    name: 'YMCA of the USA (National Council)',
    category: '501(c)(3) Non-Profit',
    sector: 'Charity / Non-Profit',
    location: 'Chicago, IL',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) National Database',
  },
  {
    ein: '84-1928371',
    name: 'Youth Horizons Learning Academy (501c3)',
    category: '501(c)(3) Non-Profit',
    sector: 'Charity / Non-Profit',
    location: 'Denver, CO',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'IRS 501(c)(3) National Database',
  },

  // Government Entities
  {
    ein: '74-6000001',
    name: 'City of Austin / Department of Public Works',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'Government Agency',
    location: 'Austin, TX',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Municipal Government Entity Verification',
  },
  {
    ein: '10-0000001',
    name: 'U.S. Department of Veterans Affairs (VA Healthcare)',
    category: 'Government (Federal/State/Local/Tribal)',
    sector: 'Government Agency',
    location: 'Washington, DC',
    pslfStatus: 'Likely Eligible',
    verificationSource: 'Federal Cabinet Agency Verification',
  },
];

/**
 * Searches the verified mock database by employer name or EIN
 */
export function searchVerifiedEmployers(query: string): VerifiedEmployerRecord[] {
  const clean = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return [];

  return MOCK_VERIFIED_EMPLOYERS.filter((emp) => {
    const cleanEin = emp.ein.replace(/[^a-z0-9]/g, '').toLowerCase();
    const cleanName = emp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSector = emp.sector.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLocation = emp.location.toLowerCase().replace(/[^a-z0-9]/g, '');

    return (
      cleanEin.includes(clean) ||
      cleanName.includes(clean) ||
      cleanSector.includes(clean) ||
      cleanLocation.includes(clean)
    );
  });
}

/**
 * Check if a given EIN directly matches an entry in the verified database
 */
export function lookupVerifiedEmployerByEin(ein: string): VerifiedEmployerRecord | undefined {
  const normalized = ein.trim().replace(/[^0-9]/g, '');
  if (!normalized) return undefined;

  return MOCK_VERIFIED_EMPLOYERS.find((emp) => {
    const target = emp.ein.replace(/[^0-9]/g, '');
    return target === normalized;
  });
}
