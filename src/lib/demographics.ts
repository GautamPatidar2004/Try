/**
 * Shared constants & helpers for creator demographic / lifestyle filters.
 */

export type Generation = 'gen_z' | 'millennial' | 'gen_x' | 'boomer';

export const GENERATION_LABELS: Record<Generation, string> = {
  gen_z: 'Gen Z',
  millennial: 'Millennial',
  gen_x: 'Gen X',
  boomer: 'Boomer',
};

export const GENERATION_OPTIONS: { value: Generation; label: string; range: string }[] = [
  { value: 'gen_z', label: 'Gen Z', range: '1997–2012' },
  { value: 'millennial', label: 'Millennial', range: '1981–1996' },
  { value: 'gen_x', label: 'Gen X', range: '1965–1980' },
  { value: 'boomer', label: 'Boomer', range: '1946–1964' },
];

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]['value'];

export const GENDER_LABELS: Record<string, string> = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label]),
);

export type LifestyleTag = 'pet_owner' | 'fitness' | 'active_sports' | 'parent';

export const LIFESTYLE_OPTIONS: { value: LifestyleTag; label: string }[] = [
  { value: 'pet_owner', label: 'Pet Owner' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'active_sports', label: 'Active in Gym / Sports' },
  { value: 'parent', label: 'Parent' },
];

export const LIFESTYLE_LABELS: Record<string, string> = Object.fromEntries(
  LIFESTYLE_OPTIONS.map((o) => [o.value, o.label]),
);

/**
 * Compute generation from date of birth (ISO date string or Date).
 * Returns null when DOB is missing or outside the supported buckets.
 */
export const getGeneration = (dob: string | Date | null | undefined): Generation | null => {
  if (!dob) return null;
  const d = typeof dob === 'string' ? new Date(dob) : dob;
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  if (year >= 1997 && year <= 2012) return 'gen_z';
  if (year >= 1981 && year <= 1996) return 'millennial';
  if (year >= 1965 && year <= 1980) return 'gen_x';
  if (year >= 1946 && year <= 1964) return 'boomer';
  return null;
};