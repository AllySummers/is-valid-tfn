const LEGACY_EIGHT_DIGIT_WEIGHTS = [10, 7, 8, 4, 6, 3, 5, 1];
const NINE_DIGIT_WEIGHTS = [1, 4, 3, 7, 5, 8, 6, 9, 10];
const SUBSTITUTE_REPORTING_CODES = new Set([
  '000000000',
  '111111111',
  '333333333',
  '444444444',
  '987654321',
]);

function normalizeTFN(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  if (text === '' || !/^[0-9 ]+$/.test(text)) {
    return null;
  }

  return text.replace(/ /g, '');
}

function checksumPasses(tfn: string, weights: number[]): boolean {
  let sum = 0;

  for (const [index, weight] of weights.entries()) {
    sum += (tfn.charCodeAt(index) - 48) * weight;
  }

  return sum % 11 === 0;
}

export default function isValidTFN(value: unknown): boolean {
  const tfn = normalizeTFN(value);

  if (!tfn) {
    return false;
  }

  if (SUBSTITUTE_REPORTING_CODES.has(tfn)) {
    return false;
  }

  if (tfn.length === LEGACY_EIGHT_DIGIT_WEIGHTS.length) {
    return checksumPasses(tfn, LEGACY_EIGHT_DIGIT_WEIGHTS);
  }

  if (tfn.length === NINE_DIGIT_WEIGHTS.length) {
    return checksumPasses(tfn, NINE_DIGIT_WEIGHTS);
  }

  return false;
}
