import { useMemo, useState } from "react";
import { InputField, SelectField } from "../components/InputField.jsx";
import ResultPanel, { ResultActions } from "../components/ResultPanel.jsx";
import { calculateSalaryTakeHome } from "../calculators/salaryTakeHome.js";
import { FILING_STATUSES, PAY_FREQUENCIES, STATE_TAX, TAX_DISCLAIMER } from "../data/taxConfig.js";
import { useHistory } from "../hooks/useHistory.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { copyText } from "../utils/clipboard.js";
import { downloadCsv } from "../utils/csv.js";
import { formatCurrency, formatPercent } from "../utils/format.js";
import { calculatorSchema } from "../utils/schema.js";

const defaults = {
  annualSalary: 85000,
  payFrequency: "biweekly",
  filingStatus: "single",
  state: "ca",
  annual401k: 6000,
  healthInsurance: 125,
  hsaFsa: 0,
  additionalWithholding: 0,
};

export default function SalaryTakeHomePage() {
  usePageMeta(
    "Salary Take-Home Calculator",
    "Estimate federal tax, California tax, FICA, deductions, and net pay by paycheck.",
    {
      path: "/calculators/salary-take-home",
      type: "article",
      schema: calculatorSchema({
        title: "Salary Take-Home Calculator",
        description: "Estimate federal tax, California tax, FICA, deductions, and net pay by paycheck.",
        path: "/calculators/salary-take-home",
      }),
    },
  );
  const [inputs, setInputs] = useLocalStorage("wms-salary-inputs", defaults);
  const [message, setMessage] = useState("");
  const { addHistory } = useHistory();
  const result = useMemo(() => calculateSalaryTakeHome(inputs), [inputs]);

  function updateField(field, value) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  const rows = [
    { label: "Gross pay", value: formatCurrency(result.perPay.grossPay) },
    { label: "Federal withholding estimate", value: formatCurrency(result.perPay.federalTax) },
    { label: "State estimate", value: formatCurrency(result.perPay.stateTax) },
    { label: "Social Security", value: formatCurrency(result.perPay.socialSecurity) },
    { label: "Medicare", value: formatCurrency(result.perPay.medicare) },
    { label: "Pretax deductions", value: formatCurrency(result.perPay.pretaxDeductions) },
    { label: "Additional withholding", value: formatCurrency(result.perPay.additionalWithholding) },
    { label: "Total deductions", value: formatCurrency(result.perPay.totalDeductions) },
    { label: "Net pay", value: formatCurrency(result.perPay.netPay), emphasis: true },
  ];

  const csvRows = [
    ["Metric", "Per Paycheck", "Annual"],
    ["Gross pay", result.perPay.grossPay, result.annual.gross],
    ["Federal tax estimate", result.perPay.federalTax, result.annual.federalTax],
    ["State tax estimate", result.perPay.stateTax, result.annual.stateTax],
    ["Social Security", result.perPay.socialSecurity, result.annual.socialSecurity],
    ["Medicare", result.perPay.medicare, result.annual.medicare],
    ["Pretax deductions", result.perPay.pretaxDeductions, result.annual.pretaxDeductions],
    ["Additional withholding", result.perPay.additionalWithholding, result.annual.additionalWithholding],
    ["Total deductions", result.perPay.totalDeductions, result.annual.totalDeductions],
    ["Net pay", result.perPay.netPay, result.annualNetPay],
  ];

  async function copyResults() {
    await copyText(
      rows.map((row) => `${row.label}: ${row.value}`).join("\n") +
        `\nEffective deduction rate: ${formatPercent(result.effectiveRate)}`,
    );
    setMessage("Results copied.");
  }

  function exportResults() {
    downloadCsv("salary-take-home-estimate.csv", csvRows);
    setMessage("CSV exported.");
  }

  function saveRun() {
    addHistory({
      calculatorId: "salary-take-home",
      summary: `${formatCurrency(result.perPay.netPay)} net per ${
        PAY_FREQUENCIES[inputs.payFrequency].label
      } paycheck.`,
      result,
    });
    setMessage("Calculation saved to recent history.");
  }

  return (
    <div className="calculator-page">
      <section className="page-intro">
        <p className="eyebrow">Paychecks</p>
        <h1>Salary Take-Home Calculator</h1>
        <p>
          Estimate federal income tax, California income tax, Social Security, Medicare, deductions,
          and net pay by paycheck.
        </p>
      </section>

      <section className="calculator-workspace">
        <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <InputField
              id="annualSalary"
              label="Annual salary"
              type="number"
              min="0"
              step="100"
              value={inputs.annualSalary}
              onChange={(event) => updateField("annualSalary", event.target.value)}
            />
            <SelectField
              id="payFrequency"
              label="Pay frequency"
              value={inputs.payFrequency}
              onChange={(event) => updateField("payFrequency", event.target.value)}
            >
              {Object.entries(PAY_FREQUENCIES).map(([key, frequency]) => (
                <option key={key} value={key}>
                  {frequency.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="filingStatus"
              label="Filing status"
              value={inputs.filingStatus}
              onChange={(event) => updateField("filingStatus", event.target.value)}
            >
              {Object.entries(FILING_STATUSES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </SelectField>
            <SelectField
              id="state"
              label="State"
              hint="California is implemented in this release."
              value={inputs.state}
              onChange={(event) => updateField("state", event.target.value)}
            >
              <option value="ca">California</option>
              <option value="none">No state estimate</option>
            </SelectField>
            <InputField
              id="annual401k"
              label="401(k), annual"
              type="number"
              min="0"
              step="50"
              value={inputs.annual401k}
              onChange={(event) => updateField("annual401k", event.target.value)}
            />
            <InputField
              id="healthInsurance"
              label="Health insurance, per paycheck"
              type="number"
              min="0"
              step="5"
              value={inputs.healthInsurance}
              onChange={(event) => updateField("healthInsurance", event.target.value)}
            />
            <InputField
              id="hsaFsa"
              label="HSA/FSA, annual"
              type="number"
              min="0"
              step="50"
              value={inputs.hsaFsa}
              onChange={(event) => updateField("hsaFsa", event.target.value)}
            />
            <InputField
              id="additionalWithholding"
              label="Additional withholding, per paycheck"
              type="number"
              min="0"
              step="5"
              value={inputs.additionalWithholding}
              onChange={(event) => updateField("additionalWithholding", event.target.value)}
            />
          </div>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={saveRun}>
              Save calculation
            </button>
            <button className="secondary-button" type="button" onClick={() => setInputs(defaults)}>
              Reset
            </button>
          </div>
          <div className="assumption-box">
            <strong>Assumptions</strong>
            <p>
              Uses {result.taxYear} annual tax brackets, standard deductions, employee FICA rates, and
              {inputs.state === "ca" ? ` ${STATE_TAX.ca.label}` : " no"} state estimate. Credits,
              itemized deductions, local taxes, wage limits for retirement plans, and full W-4 logic are not modeled.
            </p>
          </div>
        </form>

        <ResultPanel
          title={formatCurrency(result.perPay.netPay)}
          subtitle={`${PAY_FREQUENCIES[inputs.payFrequency].label} estimated net pay`}
          rows={rows}
          statusMessage={message}
          actions={<ResultActions onCopy={copyResults} onExport={exportResults} onPrint={() => window.print()} />}
        >
          <div className="mini-metrics">
            <div>
              <span>Annual net</span>
              <strong>{formatCurrency(result.annualNetPay)}</strong>
            </div>
            <div>
              <span>Effective deduction rate</span>
              <strong>{formatPercent(result.effectiveRate)}</strong>
            </div>
          </div>
          <p className="disclaimer">{TAX_DISCLAIMER}</p>
        </ResultPanel>
      </section>
    </div>
  );
}
