import { USRegion } from '../types/counselor';

/**
 * Official Federal Poverty Guidelines (HHS)
 * Base (Family of 1) and increment per additional member.
 */
export const HHS_POVERTY_GUIDELINES: Record<USRegion, { base: number; perAdditional: number }> = {
  lower48: {
    base: 15650,
    perAdditional: 5380,
  },
  alaska: {
    base: 19570,
    perAdditional: 6730,
  },
  hawaii: {
    base: 18000,
    perAdditional: 6190,
  },
};

/**
 * Returns annual poverty guideline for a given family size and region
 */
export function getPovertyGuideline(familySize: number, region: USRegion = 'lower48'): number {
  const config = HHS_POVERTY_GUIDELINES[region] || HHS_POVERTY_GUIDELINES.lower48;
  const clampedSize = Math.max(1, familySize);
  return config.base + (clampedSize - 1) * config.perAdditional;
}
