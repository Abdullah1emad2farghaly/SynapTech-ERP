// src/utils/countryFlag.ts

// ASSUMPTION: backend `country` field format (ISO-2 code vs full name) is unconfirmed.
// This helper supports both; unrecognized values fall back to null so the UI can
// render a generic Globe icon instead of a flag.
const NAME_TO_ISO2: Record<string, string> = {
  egypt: 'EG',
  'united states': 'US',
  'united arab emirates': 'AE',
  'saudi arabia': 'SA',
  'united kingdom': 'GB',
  germany: 'DE',
  france: 'FR',
  // extend as needed
};

export function getFlagEmoji(country: string | undefined | null): string | null {
  if (!country) return null;
  const trimmed = country.trim();

  let iso2: string | undefined;
  if (/^[a-zA-Z]{2}$/.test(trimmed)) {
    iso2 = trimmed.toUpperCase();
  } else {
    iso2 = NAME_TO_ISO2[trimmed.toLowerCase()];
  }

  if (!iso2) return null;

  const codePoints = iso2
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
