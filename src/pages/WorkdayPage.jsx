import { useMemo, useState } from "react";
import { InputField } from "../components/InputField.jsx";
import ResultPanel, { ResultActions } from "../components/ResultPanel.jsx";
import { calculateWorkday } from "../calculators/workday.js";
import { TAX_DISCLAIMER } from "../data/taxConfig.js";
import { useHistory } from "../hooks/useHistory.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { copyText } from "../utils/clipboard.js";
import { downloadCsv } from "../utils/csv.js";
import { calculatorSchema } from "../utils/schema.js";

const defaults = {
  loginTime: "09:00",
  mealLogout: "13:00",
  mealLogin: "13:30",
  requiredHours: 8,
  requiredMinutes: 0,
};

export default function WorkdayPage() {
  usePageMeta(
    "Workday Calculator",
    "Calculate the clock-out time needed to complete a required workday after a meal break.",
    {
      path: "/calculators/workday",
      type: "article",
      schema: calculatorSchema({
        title: "Workday Calculator",
        description: "Calculate the clock-out time needed to complete a required workday after a meal break.",
        path: "/calculators/workday",
      }),
    },
  );
  const [inputs, setInputs] = useLocalStorage("wms-workday-inputs", defaults);
  const [message, setMessage] = useState("");
  const { addHistory } = useHistory();
  const result = useMemo(() => calculateWorkday(inputs), [inputs]);

  function updateField(field, value) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  const rows = result.ok
    ? result.rows.map(([label, value]) => ({
        label,
        value,
        emphasis: label === "Estimated logout",
      }))
    : [];

  async function copyResults() {
    if (!result.ok) return;
    await copyText(result.rows.map((row) => row.join(": ")).join("\n"));
    setMessage("Results copied.");
  }

  function exportResults() {
    if (!result.ok) return;
    downloadCsv("workday-calculation.csv", [["Metric", "Value"], ...result.rows]);
    setMessage("CSV exported.");
  }

  function saveRun() {
    if (!result.ok) return;
    addHistory({
      calculatorId: "workday",
      summary: `Logout at ${result.logoutTime} after ${result.rows[2][1]} of work.`,
      result,
    });
    setMessage("Calculation saved to recent history.");
  }

  return (
    <div className="calculator-page">
      <section className="page-intro">
        <p className="eyebrow">Work Time</p>
        <h1>Workday Calculator</h1>
        <p>Calculate the clock-out time needed to complete a required shift after a meal break.</p>
      </section>

      <section className="calculator-workspace">
        <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <InputField
              id="loginTime"
              label="Login time"
              type="time"
              value={inputs.loginTime}
              onChange={(event) => updateField("loginTime", event.target.value)}
            />
            <InputField
              id="mealLogout"
              label="Meal logout"
              type="time"
              value={inputs.mealLogout}
              onChange={(event) => updateField("mealLogout", event.target.value)}
            />
            <InputField
              id="mealLogin"
              label="Meal login"
              type="time"
              value={inputs.mealLogin}
              onChange={(event) => updateField("mealLogin", event.target.value)}
            />
            <InputField
              id="requiredHours"
              label="Required hours"
              type="number"
              min="0"
              max="24"
              value={inputs.requiredHours}
              onChange={(event) => updateField("requiredHours", event.target.value)}
            />
            <InputField
              id="requiredMinutes"
              label="Required minutes"
              type="number"
              min="0"
              max="59"
              value={inputs.requiredMinutes}
              onChange={(event) => updateField("requiredMinutes", event.target.value)}
            />
          </div>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={saveRun} disabled={!result.ok}>
              Save calculation
            </button>
            <button className="secondary-button" type="button" onClick={() => setInputs(defaults)}>
              Reset
            </button>
          </div>
          {!result.ok ? (
            <div className="alert error" role="alert">
              {result.errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </form>

        <ResultPanel
          title={result.ok ? result.logoutTime : "Enter shift details"}
          subtitle={result.ok ? "Estimated logout time" : "Results update when inputs are valid."}
          rows={rows}
          statusMessage={message}
          actions={<ResultActions onCopy={copyResults} onExport={exportResults} onPrint={() => window.print()} />}
        >
          <p className="disclaimer">{TAX_DISCLAIMER}</p>
        </ResultPanel>
      </section>
    </div>
  );
}
