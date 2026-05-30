import { CopyIcon, DownloadIcon, PrintIcon } from "./icons.jsx";
import Tooltip from "./Tooltip.jsx";

export default function ResultPanel({ title, subtitle, rows, actions, children, statusMessage }) {
  return (
    <aside className="result-panel" aria-live="polite">
      <div className="result-header">
        <div>
          <p className="eyebrow">Results</p>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="result-actions">{actions}</div> : null}
      </div>
      {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
      {rows?.length ? (
        <dl className="result-list">
          {rows.map((row) => (
            <div className={row.emphasis ? "result-row emphasis" : "result-row"} key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
    </aside>
  );
}

export function ResultActions({ onCopy, onExport, onPrint }) {
  return (
    <>
      <Tooltip text="Copy results">
        <button className="icon-button" type="button" onClick={onCopy} aria-label="Copy results">
          <CopyIcon />
        </button>
      </Tooltip>
      <Tooltip text="Export CSV">
        <button className="icon-button" type="button" onClick={onExport} aria-label="Export CSV">
          <DownloadIcon />
        </button>
      </Tooltip>
      <Tooltip text="Print">
        <button className="icon-button" type="button" onClick={onPrint} aria-label="Print page">
          <PrintIcon />
        </button>
      </Tooltip>
    </>
  );
}
