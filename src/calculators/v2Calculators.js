import { calculateSalaryTakeHome } from "./salaryTakeHome.js";
import { FILING_STATUSES, PAY_FREQUENCIES, STATE_TAX, TAX_DISCLAIMER } from "../data/taxConfig.js";
import { clampNumber, formatCurrency, formatPercent } from "../utils/format.js";

const payFrequencyOptions = Object.entries(PAY_FREQUENCIES).map(([value, frequency]) => ({
  value,
  label: frequency.label,
}));

const filingStatusOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
  value,
  label,
}));

const stateTaxOptions = [
  { value: "ca", label: STATE_TAX.ca.label },
  { value: "none", label: STATE_TAX.none.label },
];

function pct(value) {
  return clampNumber(value) / 100;
}

function currencyRow(label, value, emphasis = false) {
  return { label, value: formatCurrency(value), emphasis };
}

function textRow(label, value, emphasis = false) {
  return { label, value, emphasis };
}

function yearsMonths(totalMonths) {
  if (!Number.isFinite(totalMonths)) return "No payoff";
  const months = Math.max(0, Math.ceil(totalMonths));
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (!years) return `${remaining} months`;
  if (!remaining) return `${years} years`;
  return `${years} years, ${remaining} months`;
}

function futureValueOfAnnualContributions(contribution, years, annualReturn) {
  if (years <= 0) return 0;
  if (annualReturn <= 0) return contribution * years;
  return contribution * (((1 + annualReturn) ** years - 1) / annualReturn);
}

function monthlyPayment(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate <= 0) return principal / months;
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

function payoffWithPayment(startBalance, annualRate, payment, maxMonths = 600) {
  let balance = startBalance;
  let months = 0;
  let totalInterest = 0;
  const monthlyRate = annualRate / 12;

  if (balance <= 0) return { months: 0, totalInterest: 0, totalPaid: 0, paidOff: true };
  if (payment <= 0) return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, paidOff: false };
  if (monthlyRate > 0 && payment <= balance * monthlyRate) {
    return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, paidOff: false };
  }

  while (balance > 0.01 && months < maxMonths) {
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, payment - interest);
    if (principal <= 0) break;
    balance -= principal;
    totalInterest += interest;
    months += 1;
  }

  return {
    months: balance <= 0.01 ? months : Infinity,
    totalInterest,
    totalPaid: startBalance + totalInterest,
    paidOff: balance <= 0.01,
  };
}

export const v2CalculatorDefinitions = {
  overtime: {
    id: "overtime",
    storageKey: "wms-overtime-inputs",
    categoryLabel: "Work Time",
    title: "Overtime Calculator",
    description: "Estimate regular pay, overtime pay, total gross pay, and blended hourly rate.",
    assumptions: "Uses a simple overtime multiplier. It does not determine whether overtime is legally required.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      hourlyRate: 32,
      regularHours: 40,
      overtimeHours: 6,
      overtimeMultiplier: 1.5,
    },
    fields: [
      { id: "hourlyRate", label: "Hourly rate", type: "number", min: 0, step: 0.25 },
      { id: "regularHours", label: "Regular hours", type: "number", min: 0, step: 0.25 },
      { id: "overtimeHours", label: "Overtime hours", type: "number", min: 0, step: 0.25 },
      { id: "overtimeMultiplier", label: "Overtime multiplier", type: "number", min: 1, step: 0.1 },
    ],
    calculate(inputs) {
      const hourlyRate = clampNumber(inputs.hourlyRate);
      const regularHours = clampNumber(inputs.regularHours);
      const overtimeHours = clampNumber(inputs.overtimeHours);
      const overtimeMultiplier = clampNumber(inputs.overtimeMultiplier, 1, 5);
      const regularPay = hourlyRate * regularHours;
      const overtimePay = hourlyRate * overtimeMultiplier * overtimeHours;
      const grossPay = regularPay + overtimePay;
      const totalHours = regularHours + overtimeHours;
      const blendedRate = totalHours ? grossPay / totalHours : 0;

      return {
        primary: formatCurrency(grossPay),
        subtitle: "Estimated gross pay",
        rows: [
          currencyRow("Regular pay", regularPay),
          currencyRow("Overtime pay", overtimePay),
          currencyRow("Total gross pay", grossPay, true),
          textRow("Total hours", totalHours.toFixed(2)),
          currencyRow("Blended hourly rate", blendedRate),
        ],
        metrics: [
          { label: "Overtime rate", value: formatCurrency(hourlyRate * overtimeMultiplier) },
          { label: "Overtime share", value: formatPercent(totalHours ? overtimeHours / totalHours : 0) },
        ],
        summary: `${formatCurrency(grossPay)} gross pay with ${overtimeHours} overtime hours.`,
      };
    },
  },
  "hourly-paycheck": {
    id: "hourly-paycheck",
    storageKey: "wms-hourly-paycheck-inputs",
    categoryLabel: "Paychecks",
    title: "Hourly Paycheck Calculator",
    description: "Estimate gross pay, payroll taxes, pretax deductions, and net pay from hourly work and overtime.",
    assumptions:
      "Annualizes weekly hourly and overtime wages over 52 weeks, then applies the same 2026 federal, FICA, and California estimate model used by the salary calculator. It does not model full W-4 logic, California SDI, local taxes, credits, wage-limit edge cases, or variable weekly schedules.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      hourlyRate: 28,
      regularHoursPerWeek: 40,
      overtimeHoursPerWeek: 3,
      overtimeMultiplier: 1.5,
      payFrequency: "biweekly",
      filingStatus: "single",
      state: "ca",
      annual401k: 3000,
      healthInsurance: 80,
      hsaFsa: 0,
      additionalWithholding: 0,
    },
    fields: [
      { id: "hourlyRate", label: "Hourly rate", type: "number", min: 0, step: 0.25 },
      { id: "regularHoursPerWeek", label: "Regular hours per week", type: "number", min: 0, step: 0.25 },
      { id: "overtimeHoursPerWeek", label: "Overtime hours per week", type: "number", min: 0, step: 0.25 },
      { id: "overtimeMultiplier", label: "Overtime multiplier", type: "number", min: 1, step: 0.1 },
      { id: "payFrequency", label: "Pay frequency", type: "select", options: payFrequencyOptions },
      { id: "filingStatus", label: "Filing status", type: "select", options: filingStatusOptions },
      { id: "state", label: "State", type: "select", options: stateTaxOptions, hint: "California is implemented in this release." },
      { id: "annual401k", label: "401(k), annual", type: "number", min: 0, step: 50 },
      { id: "healthInsurance", label: "Health insurance, per paycheck", type: "number", min: 0, step: 5 },
      { id: "hsaFsa", label: "HSA/FSA, annual", type: "number", min: 0, step: 50 },
      { id: "additionalWithholding", label: "Additional withholding, per paycheck", type: "number", min: 0, step: 5 },
    ],
    calculate(inputs) {
      const hourlyRate = clampNumber(inputs.hourlyRate);
      const regularHours = clampNumber(inputs.regularHoursPerWeek);
      const overtimeHours = clampNumber(inputs.overtimeHoursPerWeek);
      const multiplier = clampNumber(inputs.overtimeMultiplier, 1, 5);
      const periods = PAY_FREQUENCIES[inputs.payFrequency]?.periods ?? 26;
      const annualRegularPay = hourlyRate * regularHours * 52;
      const annualOvertimePay = hourlyRate * multiplier * overtimeHours * 52;
      const annualGross = annualRegularPay + annualOvertimePay;
      const payroll = calculateSalaryTakeHome({
        annualSalary: annualGross,
        payFrequency: inputs.payFrequency,
        filingStatus: inputs.filingStatus,
        state: inputs.state,
        annual401k: inputs.annual401k,
        healthInsurance: inputs.healthInsurance,
        hsaFsa: inputs.hsaFsa,
        additionalWithholding: inputs.additionalWithholding,
      });
      const overtimeRate = hourlyRate * multiplier;

      return {
        primary: formatCurrency(payroll.perPay.netPay),
        subtitle: `${PAY_FREQUENCIES[inputs.payFrequency]?.label ?? "Estimated"} estimated net pay`,
        rows: [
          currencyRow("Regular pay", annualRegularPay / periods),
          currencyRow("Overtime pay", annualOvertimePay / periods),
          currencyRow("Gross pay", payroll.perPay.grossPay),
          currencyRow("Federal withholding estimate", payroll.perPay.federalTax),
          currencyRow("State estimate", payroll.perPay.stateTax),
          currencyRow("Social Security", payroll.perPay.socialSecurity),
          currencyRow("Medicare", payroll.perPay.medicare),
          currencyRow("Pretax deductions", payroll.perPay.pretaxDeductions),
          currencyRow("Additional withholding", payroll.perPay.additionalWithholding),
          currencyRow("Total deductions", payroll.perPay.totalDeductions),
          currencyRow("Estimated net pay", payroll.perPay.netPay, true),
          currencyRow("Annualized gross", annualGross),
        ],
        metrics: [
          { label: "Overtime rate", value: formatCurrency(overtimeRate) },
          { label: "Effective deduction rate", value: formatPercent(payroll.effectiveRate) },
          { label: "Annualized net", value: formatCurrency(payroll.annualNetPay) },
          { label: "Total weekly hours", value: (regularHours + overtimeHours).toFixed(2) },
        ],
        summary: `${formatCurrency(payroll.perPay.netPay)} estimated net per ${
          PAY_FREQUENCIES[inputs.payFrequency]?.label ?? "paycheck"
        } paycheck from ${formatCurrency(annualGross)} annualized gross.`,
      };
    },
  },
  raise: {
    id: "raise",
    storageKey: "wms-raise-inputs",
    categoryLabel: "Paychecks",
    title: "Raise Calculator",
    description: "Compare current pay with proposed pay and estimate the after-deduction increase.",
    assumptions: "Uses a flat marginal deduction estimate for the raise amount.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      currentSalary: 75000,
      newSalary: 84000,
      payFrequency: "biweekly",
      marginalDeductionRate: 28,
    },
    fields: [
      { id: "currentSalary", label: "Current annual salary", type: "number", min: 0, step: 500 },
      { id: "newSalary", label: "New annual salary", type: "number", min: 0, step: 500 },
      { id: "payFrequency", label: "Pay frequency", type: "select", options: payFrequencyOptions },
      { id: "marginalDeductionRate", label: "Estimated marginal deduction rate %", type: "number", min: 0, max: 100, step: 0.5 },
    ],
    calculate(inputs) {
      const currentSalary = clampNumber(inputs.currentSalary);
      const newSalary = clampNumber(inputs.newSalary);
      const periods = PAY_FREQUENCIES[inputs.payFrequency]?.periods ?? 26;
      const raise = newSalary - currentSalary;
      const raisePct = currentSalary ? raise / currentSalary : 0;
      const grossIncreasePerPay = raise / periods;
      const netIncreasePerPay = grossIncreasePerPay * (1 - pct(inputs.marginalDeductionRate));

      return {
        primary: formatCurrency(netIncreasePerPay),
        subtitle: "Estimated net increase per paycheck",
        rows: [
          currencyRow("Annual raise", raise, true),
          textRow("Raise percentage", formatPercent(raisePct)),
          currencyRow("Gross increase per paycheck", grossIncreasePerPay),
          currencyRow("Estimated net increase per paycheck", netIncreasePerPay, true),
          currencyRow("New annual salary", newSalary),
        ],
        metrics: [
          { label: "Monthly gross increase", value: formatCurrency(raise / 12) },
          { label: "Estimated annual net increase", value: formatCurrency(netIncreasePerPay * periods) },
        ],
        summary: `${formatCurrency(raise)} annual raise, about ${formatCurrency(netIncreasePerPay)} net per paycheck.`,
      };
    },
  },
  "pto-value": {
    id: "pto-value",
    storageKey: "wms-pto-value-inputs",
    categoryLabel: "Work Time",
    title: "PTO Value Calculator",
    description: "Estimate the gross and after-deduction value of paid time off.",
    assumptions: "Uses hourly value and a flat estimated deduction rate. Employer PTO policies vary.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      hourlyRate: 35,
      ptoHours: 80,
      hoursPerDay: 8,
      estimatedDeductionRate: 25,
    },
    fields: [
      { id: "hourlyRate", label: "Hourly rate", type: "number", min: 0, step: 0.25 },
      { id: "ptoHours", label: "PTO hours", type: "number", min: 0, step: 1 },
      { id: "hoursPerDay", label: "Hours per workday", type: "number", min: 1, step: 0.5 },
      { id: "estimatedDeductionRate", label: "Estimated deduction rate %", type: "number", min: 0, max: 100, step: 0.5 },
    ],
    calculate(inputs) {
      const hourlyRate = clampNumber(inputs.hourlyRate);
      const ptoHours = clampNumber(inputs.ptoHours);
      const hoursPerDay = clampNumber(inputs.hoursPerDay, 1, 24);
      const grossValue = hourlyRate * ptoHours;
      const afterDeductionValue = grossValue * (1 - pct(inputs.estimatedDeductionRate));

      return {
        primary: formatCurrency(grossValue),
        subtitle: "Estimated gross PTO value",
        rows: [
          textRow("Equivalent workdays", `${(ptoHours / hoursPerDay).toFixed(1)} days`),
          currencyRow("Gross PTO value", grossValue, true),
          currencyRow("Estimated deductions", grossValue - afterDeductionValue),
          currencyRow("Estimated after-deduction value", afterDeductionValue, true),
        ],
        metrics: [
          { label: "PTO hours", value: ptoHours.toFixed(1) },
          { label: "Hourly value", value: formatCurrency(hourlyRate) },
        ],
        summary: `${ptoHours} PTO hours are worth about ${formatCurrency(grossValue)} gross.`,
      };
    },
  },
  "bonus-tax": {
    id: "bonus-tax",
    storageKey: "wms-bonus-tax-inputs",
    categoryLabel: "Paychecks",
    title: "Bonus Tax Calculator",
    description: "Estimate supplemental withholding and take-home bonus pay.",
    assumptions:
      "Defaults use common supplemental withholding assumptions: 22% federal, 10.23% California, and 7.65% employee FICA. Actual payroll withholding can differ.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      bonusAmount: 10000,
      federalRate: 22,
      stateRate: 10.23,
      ficaRate: 7.65,
      otherWithholding: 0,
    },
    fields: [
      { id: "bonusAmount", label: "Gross bonus", type: "number", min: 0, step: 100 },
      { id: "federalRate", label: "Federal supplemental rate %", type: "number", min: 0, max: 100, step: 0.1 },
      { id: "stateRate", label: "State supplemental rate %", type: "number", min: 0, max: 100, step: 0.1 },
      { id: "ficaRate", label: "FICA estimate %", type: "number", min: 0, max: 100, step: 0.1 },
      { id: "otherWithholding", label: "Other withholding", type: "number", min: 0, step: 25 },
    ],
    calculate(inputs) {
      const bonus = clampNumber(inputs.bonusAmount);
      const federal = bonus * pct(inputs.federalRate);
      const state = bonus * pct(inputs.stateRate);
      const fica = bonus * pct(inputs.ficaRate);
      const other = clampNumber(inputs.otherWithholding);
      const totalWithheld = federal + state + fica + other;
      const netBonus = Math.max(0, bonus - totalWithheld);

      return {
        primary: formatCurrency(netBonus),
        subtitle: "Estimated take-home bonus",
        rows: [
          currencyRow("Gross bonus", bonus),
          currencyRow("Federal withholding", federal),
          currencyRow("State withholding", state),
          currencyRow("FICA estimate", fica),
          currencyRow("Other withholding", other),
          currencyRow("Total withheld", totalWithheld),
          currencyRow("Net bonus", netBonus, true),
        ],
        metrics: [
          { label: "Effective withholding", value: formatPercent(bonus ? totalWithheld / bonus : 0) },
          { label: "Kept from bonus", value: formatPercent(bonus ? netBonus / bonus : 0) },
        ],
        summary: `${formatCurrency(netBonus)} estimated net bonus from ${formatCurrency(bonus)} gross.`,
      };
    },
  },
  "401k-match": {
    id: "401k-match",
    storageKey: "wms-401k-match-inputs",
    categoryLabel: "Benefits",
    title: "401(k) Match Calculator",
    description: "Estimate employee contributions, employer matching dollars, and vested annual value.",
    assumptions: "Uses a simple match rate up to a salary percentage cap. Plan rules and IRS limits are not enforced.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      annualSalary: 90000,
      employeeContributionPct: 6,
      employerMatchRate: 50,
      matchLimitPct: 6,
      vestingPct: 100,
    },
    fields: [
      { id: "annualSalary", label: "Annual salary", type: "number", min: 0, step: 500 },
      { id: "employeeContributionPct", label: "Your contribution %", type: "number", min: 0, max: 100, step: 0.25 },
      { id: "employerMatchRate", label: "Employer match rate %", type: "number", min: 0, max: 100, step: 1 },
      { id: "matchLimitPct", label: "Match applies up to salary %", type: "number", min: 0, max: 100, step: 0.25 },
      { id: "vestingPct", label: "Vested %", type: "number", min: 0, max: 100, step: 1 },
    ],
    calculate(inputs) {
      const salary = clampNumber(inputs.annualSalary);
      const employeeContribution = salary * pct(inputs.employeeContributionPct);
      const eligibleContribution = Math.min(employeeContribution, salary * pct(inputs.matchLimitPct));
      const employerMatch = eligibleContribution * pct(inputs.employerMatchRate);
      const vestedMatch = employerMatch * pct(inputs.vestingPct);
      const totalAnnual = employeeContribution + employerMatch;

      return {
        primary: formatCurrency(employerMatch),
        subtitle: "Estimated annual employer match",
        rows: [
          currencyRow("Your annual contribution", employeeContribution),
          currencyRow("Employer match", employerMatch, true),
          currencyRow("Vested employer match", vestedMatch),
          currencyRow("Total annual retirement contribution", totalAnnual, true),
        ],
        metrics: [
          { label: "Match captured", value: formatPercent(salary * pct(inputs.matchLimitPct) ? eligibleContribution / (salary * pct(inputs.matchLimitPct)) : 0) },
          { label: "Monthly employer match", value: formatCurrency(employerMatch / 12) },
        ],
        summary: `${formatCurrency(employerMatch)} estimated annual employer match.`,
      };
    },
  },
  "roth-vs-traditional": {
    id: "roth-vs-traditional",
    storageKey: "wms-roth-traditional-inputs",
    categoryLabel: "Benefits",
    title: "Roth vs Traditional Calculator",
    description: "Compare after-tax retirement outcomes for Roth and pre-tax contributions.",
    assumptions:
      "Uses the same gross contribution budget each year, annual compounding, and simplified current and retirement tax rates.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      annualGrossContributionBudget: 7000,
      years: 25,
      annualReturn: 6,
      currentTaxRate: 24,
      retirementTaxRate: 18,
    },
    fields: [
      { id: "annualGrossContributionBudget", label: "Annual gross contribution budget", type: "number", min: 0, step: 100 },
      { id: "years", label: "Years invested", type: "number", min: 0, step: 1 },
      { id: "annualReturn", label: "Annual return %", type: "number", min: 0, step: 0.25 },
      { id: "currentTaxRate", label: "Current tax rate %", type: "number", min: 0, max: 100, step: 0.5 },
      { id: "retirementTaxRate", label: "Retirement tax rate %", type: "number", min: 0, max: 100, step: 0.5 },
    ],
    calculate(inputs) {
      const grossBudget = clampNumber(inputs.annualGrossContributionBudget);
      const years = clampNumber(inputs.years, 0, 80);
      const annualReturn = pct(inputs.annualReturn);
      const rothContribution = grossBudget * (1 - pct(inputs.currentTaxRate));
      const rothFuture = futureValueOfAnnualContributions(rothContribution, years, annualReturn);
      const traditionalFuture = futureValueOfAnnualContributions(grossBudget, years, annualReturn);
      const traditionalAfterTax = traditionalFuture * (1 - pct(inputs.retirementTaxRate));
      const advantage = rothFuture - traditionalAfterTax;

      return {
        primary: formatCurrency(Math.max(rothFuture, traditionalAfterTax)),
        subtitle: advantage >= 0 ? "Roth projected higher" : "Traditional projected higher",
        rows: [
          currencyRow("Roth annual contribution after current tax", rothContribution),
          currencyRow("Projected Roth value", rothFuture, advantage >= 0),
          currencyRow("Projected Traditional value before tax", traditionalFuture),
          currencyRow("Traditional value after retirement tax", traditionalAfterTax, advantage < 0),
          currencyRow("Projected difference", Math.abs(advantage), true),
        ],
        metrics: [
          { label: "Years invested", value: years.toFixed(0) },
          { label: "Assumed return", value: formatPercent(annualReturn) },
        ],
        summary: `${advantage >= 0 ? "Roth" : "Traditional"} is ahead by about ${formatCurrency(Math.abs(advantage))}.`,
      };
    },
  },
  "credit-card-payoff": {
    id: "credit-card-payoff",
    storageKey: "wms-credit-card-payoff-inputs",
    categoryLabel: "Debt",
    title: "Credit Card Payoff Calculator",
    description: "Estimate payoff time, interest cost, and total paid for a credit card balance.",
    assumptions: "Assumes a fixed APR and fixed monthly payment with no new charges.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      balance: 6500,
      apr: 24.99,
      monthlyPayment: 350,
    },
    fields: [
      { id: "balance", label: "Current balance", type: "number", min: 0, step: 50 },
      { id: "apr", label: "APR %", type: "number", min: 0, step: 0.1 },
      { id: "monthlyPayment", label: "Monthly payment", type: "number", min: 0, step: 25 },
    ],
    affiliateBlock: {
      title: "Balance transfer options to compare",
      description:
        "If your payoff timeline is long, a 0% intro APR balance transfer card may reduce interest while you pay down the balance. These are placeholder placements for future affiliate links.",
      disclosure:
        "Sample sponsored placement only. Replace with approved affiliate links and current issuer terms before launch. Offers, fees, APRs, eligibility, and intro periods change often. Work & Money Suite does not issue credit or guarantee approval.",
      offers: [
        {
          kicker: "Sample issuer",
          name: "Citi",
          summary: "0% intro APR balance transfer card sample",
          transferFee: "Intro fee varies",
          introPeriod: "Example: 12-21 months",
          bestFor: "Longer payoff windows",
          cta: "Apply",
          href: "https://www.citi.com/credit-cards/balance-transfer-credit-cards",
        },
        {
          kicker: "Sample issuer",
          name: "Discover",
          summary: "Balance transfer comparison placeholder",
          transferFee: "Usually 3%-5%",
          introPeriod: "Example: 12-18 months",
          bestFor: "Simple payoff plan",
          cta: "Compare",
          href: "https://www.discover.com/credit-cards/balance-transfer/",
        },
        {
          kicker: "Sample issuer",
          name: "Wells Fargo",
          summary: "Intro balance transfer placeholder",
          transferFee: "Check terms",
          introPeriod: "Example: 15-21 months",
          bestFor: "Existing bank customers",
          cta: "Compare",
          href: "https://creditcards.wellsfargo.com/balance-transfer-credit-cards/",
        },
        {
          kicker: "Sample issuer",
          name: "Bank of America",
          summary: "Low intro APR transfer placeholder",
          transferFee: "Check terms",
          introPeriod: "Example: 15-18 months",
          bestFor: "Relationship rewards",
          cta: "Compare",
          href: "https://www.bankofamerica.com/credit-cards/balance-transfer-credit-cards/",
        },
      ],
    },
    calculate(inputs) {
      const balance = clampNumber(inputs.balance);
      const apr = pct(inputs.apr);
      const payment = clampNumber(inputs.monthlyPayment);
      const payoff = payoffWithPayment(balance, apr, payment);

      return {
        primary: payoff.paidOff ? yearsMonths(payoff.months) : "Increase payment",
        subtitle: payoff.paidOff ? "Estimated payoff time" : "Payment does not cover monthly interest",
        rows: [
          currencyRow("Current balance", balance),
          currencyRow("Monthly payment", payment),
          textRow("Payoff time", yearsMonths(payoff.months), true),
          payoff.paidOff ? currencyRow("Total interest", payoff.totalInterest) : textRow("Total interest", "Not available"),
          payoff.paidOff ? currencyRow("Total paid", payoff.totalPaid, true) : textRow("Total paid", "Not available", true),
        ],
        metrics: [
          { label: "APR", value: formatPercent(apr) },
          { label: "Interest share", value: payoff.paidOff ? formatPercent(payoff.totalPaid ? payoff.totalInterest / payoff.totalPaid : 0) : "Payment too low" },
        ],
        summary: payoff.paidOff
          ? `Debt paid off in ${yearsMonths(payoff.months)} with about ${formatCurrency(payoff.totalInterest)} interest.`
          : "Payment is too low to pay off the balance under these assumptions.",
      };
    },
  },
  "loan-payoff": {
    id: "loan-payoff",
    storageKey: "wms-loan-payoff-inputs",
    categoryLabel: "Debt",
    title: "Loan Payoff Calculator",
    description: "Estimate loan payment, payoff time, and interest saved from extra payments.",
    assumptions: "Assumes a fixed-rate amortizing loan with monthly payments.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      principal: 30000,
      apr: 7.5,
      termYears: 5,
      extraPayment: 100,
    },
    fields: [
      { id: "principal", label: "Loan balance", type: "number", min: 0, step: 100 },
      { id: "apr", label: "APR %", type: "number", min: 0, step: 0.1 },
      { id: "termYears", label: "Remaining term years", type: "number", min: 0, step: 0.5 },
      { id: "extraPayment", label: "Extra monthly payment", type: "number", min: 0, step: 25 },
    ],
    calculate(inputs) {
      const principal = clampNumber(inputs.principal);
      const apr = pct(inputs.apr);
      const months = Math.max(1, Math.round(clampNumber(inputs.termYears) * 12));
      const basePayment = monthlyPayment(principal, apr, months);
      const extraPayment = clampNumber(inputs.extraPayment);
      const basePayoff = payoffWithPayment(principal, apr, basePayment, months + 1);
      const acceleratedPayoff = payoffWithPayment(principal, apr, basePayment + extraPayment);
      const interestSaved = Math.max(0, basePayoff.totalInterest - acceleratedPayoff.totalInterest);

      return {
        primary: formatCurrency(basePayment + extraPayment),
        subtitle: "Monthly payment with extra",
        rows: [
          currencyRow("Required monthly payment", basePayment),
          currencyRow("Extra monthly payment", extraPayment),
          currencyRow("Total monthly payment", basePayment + extraPayment, true),
          textRow("Payoff time with extra", yearsMonths(acceleratedPayoff.months), true),
          currencyRow("Estimated interest saved", interestSaved),
          currencyRow("Total interest with extra", acceleratedPayoff.totalInterest),
        ],
        metrics: [
          { label: "Original term", value: yearsMonths(months) },
          { label: "Months saved", value: Number.isFinite(acceleratedPayoff.months) ? String(Math.max(0, months - acceleratedPayoff.months)) : "0" },
        ],
        summary: `${formatCurrency(extraPayment)} extra monthly may save about ${formatCurrency(interestSaved)} interest.`,
      };
    },
  },
  fire: {
    id: "fire",
    storageKey: "wms-fire-inputs",
    categoryLabel: "Retirement",
    title: "FIRE Calculator",
    description: "Project how long it may take to reach financial independence.",
    assumptions: "Uses annual contributions, annual compounding, constant spending, and a simplified withdrawal rule.",
    disclaimer: TAX_DISCLAIMER,
    defaults: {
      currentSavings: 75000,
      annualIncome: 110000,
      annualSpending: 52000,
      annualSavings: 30000,
      annualReturn: 6,
      withdrawalRate: 4,
    },
    fields: [
      { id: "currentSavings", label: "Current invested savings", type: "number", min: 0, step: 1000 },
      { id: "annualIncome", label: "Annual income", type: "number", min: 0, step: 1000 },
      { id: "annualSpending", label: "Annual spending", type: "number", min: 0, step: 1000 },
      { id: "annualSavings", label: "Annual savings", type: "number", min: 0, step: 1000 },
      { id: "annualReturn", label: "Annual return %", type: "number", min: 0, step: 0.25 },
      { id: "withdrawalRate", label: "Withdrawal rate %", type: "number", min: 0.1, step: 0.1 },
    ],
    calculate(inputs) {
      const currentSavings = clampNumber(inputs.currentSavings);
      const annualIncome = clampNumber(inputs.annualIncome);
      const annualSpending = clampNumber(inputs.annualSpending);
      const annualSavings = clampNumber(inputs.annualSavings);
      const annualReturn = pct(inputs.annualReturn);
      const withdrawalRate = Math.max(0.001, pct(inputs.withdrawalRate));
      const target = annualSpending / withdrawalRate;
      let portfolio = currentSavings;
      let years = 0;

      while (portfolio < target && years < 100) {
        portfolio = portfolio * (1 + annualReturn) + annualSavings;
        years += 1;
      }

      const reached = portfolio >= target;
      const currentYear = new Date().getFullYear();

      return {
        primary: reached ? `${years} years` : "100+ years",
        subtitle: "Estimated time to financial independence",
        rows: [
          currencyRow("FI target", target, true),
          currencyRow("Current invested savings", currentSavings),
          currencyRow("Projected portfolio", portfolio),
          textRow("Estimated FI year", reached ? String(currentYear + years) : "Beyond model range", true),
          textRow("Savings rate", formatPercent(annualIncome ? annualSavings / annualIncome : 0)),
        ],
        metrics: [
          { label: "Withdrawal rate", value: formatPercent(withdrawalRate) },
          { label: "Annual savings", value: formatCurrency(annualSavings) },
        ],
        summary: reached
          ? `Estimated FI in ${years} years at a ${formatCurrency(target)} target.`
          : "FI target is beyond the 100-year model range with these inputs.",
      };
    },
  },
};

export function getV2CalculatorDefinition(id) {
  return v2CalculatorDefinitions[id];
}
