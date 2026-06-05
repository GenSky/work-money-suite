import { calculateSalaryTakeHome } from "../src/calculators/salaryTakeHome.js";
import { calculateWorkday } from "../src/calculators/workday.js";
import { FICA_2026 } from "../src/data/taxConfig.js";
import { v2CalculatorDefinitions } from "../src/calculators/v2Calculators.js";

const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`FAIL ${name}`);
    console.error(`  ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function approx(actual, expected, tolerance = 0.01, message = "Values differ") {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}. Expected ${expected}, got ${actual}`);
  }
}

function money(value) {
  if (typeof value === "number") return value;
  const normalized = String(value).replace(/[$,%\s,]/g, "");
  if (normalized === "" || normalized === "Notavailable") return NaN;
  return Number(normalized);
}

function row(result, label) {
  const match = result.rows.find((item) => item.label === label);
  assert(match, `Missing result row: ${label}`);
  return match.value;
}

function currencyRow(result, label) {
  return money(row(result, label));
}

function calculate(id, inputs) {
  const definition = v2CalculatorDefinitions[id];
  assert(definition, `Unknown calculator ${id}`);
  return definition.calculate({ ...definition.defaults, ...inputs });
}

test("workday normal shift with meal", () => {
  const result = calculateWorkday({
    loginTime: "09:00",
    mealLogout: "13:00",
    mealLogin: "13:30",
    requiredHours: 8,
    requiredMinutes: 0,
  });
  assert(result.ok, "Expected valid workday");
  assert(result.logoutTime === "5:30 PM", `Expected 5:30 PM, got ${result.logoutTime}`);
});

test("workday no meal and overnight logout", () => {
  const result = calculateWorkday({
    loginTime: "22:15",
    mealLogout: "",
    mealLogin: "",
    requiredHours: 8,
    requiredMinutes: 15,
  });
  assert(result.ok, "Expected valid overnight workday");
  assert(result.logoutTime === "6:30 AM", `Expected 6:30 AM, got ${result.logoutTime}`);
});

test("workday catches implausible meal", () => {
  const result = calculateWorkday({
    loginTime: "08:00",
    mealLogout: "10:00",
    mealLogin: "15:30",
    requiredHours: 8,
    requiredMinutes: 0,
  });
  assert(!result.ok, "Expected invalid meal duration");
  assert(result.errors.some((error) => error.includes("longer than 4 hours")), "Expected long meal error");
});

test("salary federal, CA, FICA known scenario", () => {
  const result = calculateSalaryTakeHome({
    annualSalary: 100000,
    payFrequency: "biweekly",
    filingStatus: "single",
    state: "ca",
    annual401k: 0,
    healthInsurance: 0,
    hsaFsa: 0,
    additionalWithholding: 0,
  });

  approx(result.perPay.grossPay, 3846.1538, 0.01, "Gross pay mismatch");
  approx(result.annual.federalTax, 13170, 0.01, "Federal tax mismatch");
  approx(result.perPay.federalTax, 506.5385, 0.01, "Federal per-pay mismatch");
  approx(result.annual.stateTax, 5728.781, 0.02, "CA tax mismatch");
  approx(result.perPay.socialSecurity, 238.4615, 0.01, "Social Security mismatch");
  approx(result.perPay.medicare, 55.7692, 0.01, "Medicare mismatch");
  approx(result.perPay.netPay, 2825.031, 0.02, "Net pay mismatch");
});

test("salary Social Security wage base cap applies", () => {
  const result = calculateSalaryTakeHome({
    annualSalary: 250000,
    payFrequency: "monthly",
    filingStatus: "single",
    state: "none",
    annual401k: 0,
    healthInsurance: 0,
    hsaFsa: 0,
    additionalWithholding: 0,
  });
  approx(
    result.annual.socialSecurity,
    FICA_2026.socialSecurityWageBase * FICA_2026.socialSecurityRate,
    0.01,
    "Social Security cap mismatch",
  );
  assert(result.annual.medicare > 250000 * FICA_2026.medicareRate, "Additional Medicare should apply");
});

test("salary pretax deductions reduce federal taxable income", () => {
  const noPretax = calculateSalaryTakeHome({
    annualSalary: 90000,
    payFrequency: "biweekly",
    filingStatus: "single",
    state: "none",
    annual401k: 0,
    healthInsurance: 0,
    hsaFsa: 0,
    additionalWithholding: 0,
  });
  const withPretax = calculateSalaryTakeHome({
    annualSalary: 90000,
    payFrequency: "biweekly",
    filingStatus: "single",
    state: "none",
    annual401k: 10000,
    healthInsurance: 100,
    hsaFsa: 1000,
    additionalWithholding: 0,
  });
  assert(withPretax.annual.federalTax < noPretax.annual.federalTax, "Pretax should reduce federal tax");
  approx(withPretax.annual.pretaxDeductions, 13600, 0.01, "Pretax total mismatch");
});

test("overtime known pay math", () => {
  const result = calculate("overtime", {
    hourlyRate: 20,
    regularHours: 40,
    overtimeHours: 10,
    overtimeMultiplier: 1.5,
  });
  approx(currencyRow(result, "Regular pay"), 800, 0.01);
  approx(currencyRow(result, "Overtime pay"), 300, 0.01);
  approx(currencyRow(result, "Total gross pay"), 1100, 0.01);
  approx(currencyRow(result, "Blended hourly rate"), 22, 0.01);
});

test("hourly paycheck matches salary model for equivalent annual gross", () => {
  const hourly = calculate("hourly-paycheck", {
    hourlyRate: 20,
    regularHoursPerWeek: 40,
    overtimeHoursPerWeek: 0,
    overtimeMultiplier: 1.5,
    payFrequency: "biweekly",
    filingStatus: "single",
    state: "none",
    annual401k: 0,
    healthInsurance: 0,
    hsaFsa: 0,
    additionalWithholding: 0,
  });
  const salary = calculateSalaryTakeHome({
    annualSalary: 41600,
    payFrequency: "biweekly",
    filingStatus: "single",
    state: "none",
    annual401k: 0,
    healthInsurance: 0,
    hsaFsa: 0,
    additionalWithholding: 0,
  });
  approx(currencyRow(hourly, "Gross pay"), salary.perPay.grossPay, 0.01, "Hourly gross mismatch");
  approx(currencyRow(hourly, "Estimated net pay"), salary.perPay.netPay, 0.01, "Hourly net mismatch");
});

test("raise known net increase", () => {
  const result = calculate("raise", {
    currentSalary: 75000,
    newSalary: 84000,
    payFrequency: "biweekly",
    marginalDeductionRate: 28,
  });
  approx(currencyRow(result, "Annual raise"), 9000, 0.01);
  approx(currencyRow(result, "Gross increase per paycheck"), 346.1538, 0.01);
  approx(currencyRow(result, "Estimated net increase per paycheck"), 249.2308, 0.01);
});

test("pto value known scenario", () => {
  const result = calculate("pto-value", {
    hourlyRate: 35,
    ptoHours: 80,
    hoursPerDay: 8,
    estimatedDeductionRate: 25,
  });
  assert(row(result, "Equivalent workdays") === "10.0 days", "PTO days mismatch");
  approx(currencyRow(result, "Gross PTO value"), 2800, 0.01);
  approx(currencyRow(result, "Estimated after-deduction value"), 2100, 0.01);
});

test("bonus withholding known scenario", () => {
  const result = calculate("bonus-tax", {
    bonusAmount: 10000,
    federalRate: 22,
    stateRate: 10.23,
    ficaRate: 7.65,
    otherWithholding: 0,
  });
  approx(currencyRow(result, "Federal withholding"), 2200, 0.01);
  approx(currencyRow(result, "State withholding"), 1023, 0.01);
  approx(currencyRow(result, "FICA estimate"), 765, 0.01);
  approx(currencyRow(result, "Net bonus"), 6012, 0.01);
});

test("401k match caps employer match at plan limit", () => {
  const result = calculate("401k-match", {
    annualSalary: 90000,
    employeeContributionPct: 10,
    employerMatchRate: 50,
    matchLimitPct: 6,
    vestingPct: 75,
  });
  approx(currencyRow(result, "Your annual contribution"), 9000, 0.01);
  approx(currencyRow(result, "Employer match"), 2700, 0.01);
  approx(currencyRow(result, "Vested employer match"), 2025, 0.01);
});

test("roth and traditional tie when tax rates are zero", () => {
  const result = calculate("roth-vs-traditional", {
    annualGrossContributionBudget: 1000,
    years: 10,
    annualReturn: 0,
    currentTaxRate: 0,
    retirementTaxRate: 0,
  });
  approx(currencyRow(result, "Projected Roth value"), 10000, 0.01);
  approx(currencyRow(result, "Traditional value after retirement tax"), 10000, 0.01);
  approx(currencyRow(result, "Projected difference"), 0, 0.01);
});

test("credit card zero APR pays off linearly", () => {
  const result = calculate("credit-card-payoff", {
    balance: 1200,
    apr: 0,
    monthlyPayment: 100,
  });
  assert(row(result, "Payoff time") === "1 years", `Unexpected payoff time: ${row(result, "Payoff time")}`);
  approx(currencyRow(result, "Total interest"), 0, 0.01);
  approx(currencyRow(result, "Total paid"), 1200, 0.01);
});

test("credit card payment too low is flagged", () => {
  const result = calculate("credit-card-payoff", {
    balance: 1000,
    apr: 12,
    monthlyPayment: 5,
  });
  assert(result.primary === "Increase payment", "Expected low-payment warning");
  assert(row(result, "Total paid") === "Not available", "Expected unavailable total paid");
});

test("loan payoff zero APR known scenario", () => {
  const result = calculate("loan-payoff", {
    principal: 12000,
    apr: 0,
    termYears: 1,
    extraPayment: 0,
  });
  approx(currencyRow(result, "Required monthly payment"), 1000, 0.01);
  assert(row(result, "Payoff time with extra") === "1 years", "Loan payoff time mismatch");
  approx(currencyRow(result, "Total interest with extra"), 0, 0.01);
});

test("FIRE immediately reached when savings equals target", () => {
  const result = calculate("fire", {
    currentSavings: 1000000,
    annualIncome: 100000,
    annualSpending: 40000,
    annualSavings: 0,
    annualReturn: 5,
    withdrawalRate: 4,
  });
  assert(result.primary === "0 years", `Expected 0 years, got ${result.primary}`);
  approx(currencyRow(result, "FI target"), 1000000, 0.01);
  assert(row(result, "Estimated FI year") === String(new Date().getFullYear()), "FI year mismatch");
});

test("all calculator defaults produce finite display output", () => {
  for (const [id, definition] of Object.entries(v2CalculatorDefinitions)) {
    const result = definition.calculate(definition.defaults);
    assert(result.primary, `${id} missing primary`);
    for (const item of [...result.rows, ...(result.metrics || [])]) {
      assert(!String(item.value).includes("NaN"), `${id} produced NaN for ${item.label}`);
      assert(!String(item.value).includes("Infinity"), `${id} produced Infinity for ${item.label}`);
    }
  }
});

if (failures.length) {
  console.error(`\n${failures.length} stress test(s) failed.`);
  process.exit(1);
}

console.log("\nAll calculator stress tests passed.");
