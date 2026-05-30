import { FEDERAL_2026, FICA_2026, PAY_FREQUENCIES, STATE_TAX, TAX_YEAR } from "../data/taxConfig.js";
import { clampNumber } from "../utils/format.js";
import { calculateProgressiveTax } from "../utils/taxMath.js";

export function calculateSalaryTakeHome(inputs) {
  const salary = clampNumber(inputs.annualSalary);
  const periods = PAY_FREQUENCIES[inputs.payFrequency]?.periods ?? 26;
  const filingStatus = inputs.filingStatus || "single";
  const state = inputs.state || "ca";
  const annual401k = clampNumber(inputs.annual401k);
  const healthPerPay = clampNumber(inputs.healthInsurance);
  const annualHsaFsa = clampNumber(inputs.hsaFsa);
  const additionalWithholding = clampNumber(inputs.additionalWithholding);

  const pretaxAnnual = annual401k + annualHsaFsa + healthPerPay * periods;
  const taxableFederalWages = Math.max(0, salary - pretaxAnnual);
  const federalTaxableIncome = Math.max(
    0,
    taxableFederalWages - FEDERAL_2026.standardDeduction[filingStatus],
  );
  const annualFederalTax = calculateProgressiveTax(
    federalTaxableIncome,
    FEDERAL_2026.brackets[filingStatus],
  );

  const socialSecurity = Math.min(salary, FICA_2026.socialSecurityWageBase) * FICA_2026.socialSecurityRate;
  const medicare = salary * FICA_2026.medicareRate;
  const additionalMedicare =
    Math.max(0, salary - FICA_2026.additionalMedicareThresholds[filingStatus]) *
    FICA_2026.additionalMedicareRate;
  const fica = socialSecurity + medicare + additionalMedicare;

  const stateConfig = STATE_TAX[state];
  const stateTaxableIncome =
    state === "ca"
      ? Math.max(0, salary - pretaxAnnual - stateConfig.standardDeduction[filingStatus])
      : 0;
  const annualStateTax =
    state === "ca" ? calculateProgressiveTax(stateTaxableIncome, stateConfig.brackets[filingStatus]) : 0;

  const annualAdditionalWithholding = additionalWithholding * periods;
  const totalAnnualDeductions =
    pretaxAnnual + annualFederalTax + annualStateTax + fica + annualAdditionalWithholding;
  const annualNetPay = Math.max(0, salary - totalAnnualDeductions);
  const grossPay = salary / periods;
  const netPay = annualNetPay / periods;

  return {
    taxYear: TAX_YEAR,
    periods,
    grossPay,
    netPay,
    annualNetPay,
    effectiveRate: salary > 0 ? totalAnnualDeductions / salary : 0,
    annual: {
      gross: salary,
      federalTax: annualFederalTax,
      stateTax: annualStateTax,
      socialSecurity,
      medicare: medicare + additionalMedicare,
      pretaxDeductions: pretaxAnnual,
      additionalWithholding: annualAdditionalWithholding,
      totalDeductions: totalAnnualDeductions,
      taxableFederalWages,
      federalTaxableIncome,
      stateTaxableIncome,
    },
    perPay: {
      grossPay,
      federalTax: annualFederalTax / periods,
      stateTax: annualStateTax / periods,
      socialSecurity: socialSecurity / periods,
      medicare: (medicare + additionalMedicare) / periods,
      pretaxDeductions: pretaxAnnual / periods,
      additionalWithholding,
      totalDeductions: totalAnnualDeductions / periods,
      netPay,
    },
  };
}
