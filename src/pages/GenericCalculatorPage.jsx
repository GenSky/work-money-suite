import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getV2CalculatorDefinition } from "../calculators/v2Calculators.js";
import AffiliateOfferBlock from "../components/AffiliateOfferBlock.jsx";
import { InputField, SelectField } from "../components/InputField.jsx";
import ResultPanel, { ResultActions } from "../components/ResultPanel.jsx";
import { useHistory } from "../hooks/useHistory.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { copyText } from "../utils/clipboard.js";
import { downloadCsv } from "../utils/csv.js";
import { calculatorSchema } from "../utils/schema.js";
import NotFound from "./NotFound.jsx";

function CalculatorField({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <SelectField
        id={field.id}
        label={field.label}
        hint={field.hint}
        value={value}
        onChange={(event) => onChange(field.id, event.target.value)}
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
    );
  }

  return (
    <InputField
      id={field.id}
      label={field.label}
      hint={field.hint}
      type={field.type || "number"}
      min={field.min}
      max={field.max}
      step={field.step}
      value={value}
      onChange={(event) => onChange(field.id, event.target.value)}
    />
  );
}

export default function GenericCalculatorPage() {
  const { calculatorId } = useParams();
  const definition = getV2CalculatorDefinition(calculatorId);

  if (!definition) {
    return <NotFound />;
  }

  return <ConfiguredCalculatorPage definition={definition} />;
}

function ConfiguredCalculatorPage({ definition }) {
  const path = `/calculators/${definition.id}`;
  usePageMeta(definition.title, definition.description, {
    path,
    type: "article",
    schema: calculatorSchema({
      title: definition.title,
      description: definition.description,
      path,
    }),
  });

  const [inputs, setInputs] = useLocalStorage(definition.storageKey, definition.defaults);
  const [message, setMessage] = useState("");
  const { addHistory } = useHistory();
  const effectiveInputs = useMemo(() => ({ ...definition.defaults, ...inputs }), [definition, inputs]);
  const result = useMemo(() => definition.calculate(effectiveInputs), [definition, effectiveInputs]);

  function updateField(field, value) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  async function copyResults() {
    await copyText(result.rows.map((row) => `${row.label}: ${row.value}`).join("\n"));
    setMessage("Results copied.");
  }

  function exportResults() {
    downloadCsv(`${definition.id}.csv`, [["Metric", "Value"], ...result.rows.map((row) => [row.label, row.value])]);
    setMessage("CSV exported.");
  }

  function saveRun() {
    addHistory({
      calculatorId: definition.id,
      summary: result.summary,
      result,
    });
    setMessage("Calculation saved to recent history.");
  }

  return (
    <div className="calculator-page">
      <section className="page-intro">
        <p className="eyebrow">{definition.categoryLabel}</p>
        <h1>{definition.title}</h1>
        <p>{definition.description}</p>
      </section>

      <section className="calculator-workspace">
        <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            {definition.fields.map((field) => (
              <CalculatorField
                key={field.id}
                field={field}
                value={effectiveInputs[field.id] ?? ""}
                onChange={updateField}
              />
            ))}
          </div>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={saveRun}>
              Save calculation
            </button>
            <button className="secondary-button" type="button" onClick={() => setInputs(definition.defaults)}>
              Reset
            </button>
          </div>
          <div className="assumption-box">
            <strong>Assumptions</strong>
            <p>{definition.assumptions}</p>
          </div>
        </form>

        <ResultPanel
          title={result.primary}
          subtitle={result.subtitle}
          rows={result.rows}
          statusMessage={message}
          actions={<ResultActions onCopy={copyResults} onExport={exportResults} onPrint={() => window.print()} />}
        >
          {result.metrics?.length ? (
            <div className="mini-metrics">
              {result.metrics.map((metric) => (
                <div key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
          <p className="disclaimer">{definition.disclaimer}</p>
        </ResultPanel>
      </section>
      <AffiliateOfferBlock {...definition.affiliateBlock} />
    </div>
  );
}
