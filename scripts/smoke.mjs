import { calculateSalaryTakeHome } from "../src/calculators/salaryTakeHome.js";
import { calculateWorkday } from "../src/calculators/workday.js";
import { v2CalculatorDefinitions } from "../src/calculators/v2Calculators.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const workday = calculateWorkday({
  loginTime: "09:00",
  mealLogout: "13:00",
  mealLogin: "13:30",
  requiredHours: 8,
  requiredMinutes: 0,
});

assert(workday.ok, "Workday calculator should return a valid result.");
assert(workday.logoutTime === "17:30", "Workday calculator default expectation changed.");

const salary = calculateSalaryTakeHome({
  annualSalary: 85000,
  payFrequency: "biweekly",
  filingStatus: "single",
  state: "ca",
  annual401k: 6000,
  healthInsurance: 125,
  hsaFsa: 0,
  additionalWithholding: 0,
});

assert(salary.perPay.netPay > 0, "Salary calculator should produce positive net pay.");
assert(salary.perPay.federalTax > 0, "Salary calculator should estimate federal tax.");

for (const [id, definition] of Object.entries(v2CalculatorDefinitions)) {
  const result = definition.calculate(definition.defaults);
  assert(result.primary, `${id} should provide a primary result.`);
  assert(result.rows?.length, `${id} should provide result rows.`);
  assert(result.summary, `${id} should provide a history summary.`);
}

console.log(`Smoke checks passed for ${Object.keys(v2CalculatorDefinitions).length + 2} calculators.`);
