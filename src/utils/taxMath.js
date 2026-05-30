export function calculateProgressiveTax(taxableIncome, brackets = []) {
  const income = Math.max(0, taxableIncome);
  const bracket = brackets.find((row) => income >= row.min && income <= row.max);
  if (!bracket) return 0;
  return bracket.base + (income - bracket.min) * bracket.rate;
}
