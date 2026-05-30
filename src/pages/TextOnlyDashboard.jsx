import { Link } from "react-router-dom";
import { calculatorCategories, calculators } from "../data/calculators.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function TextOnlyDashboard() {
  usePageMeta(
    "Text-Only Work & Money Suite",
    "A fast text-only version of Work & Money Suite calculators for accessibility, low bandwidth, and focused use.",
    { path: "/text" },
  );

  return (
    <div className="text-only-page">
      <section className="text-only-intro">
        <h1>Text-only calculator suite</h1>
        <p>
          This clone keeps the same calculator logic as the full site, but strips the experience down
          to readable text, tables, forms, and links.
        </p>
      </section>

      {calculatorCategories.map((category) => (
        <section
          className="text-only-table-section"
          id={category.id}
          key={category.id}
          aria-labelledby={`${category.id}-heading`}
        >
          <h2 id={`${category.id}-heading`}>{category.label}</h2>
          <p>{category.description}</p>
          <div className="text-only-table-wrap">
            <table className="text-only-table">
              <thead>
                <tr>
                  <th scope="col">Calculator</th>
                  <th scope="col">Status</th>
                  <th scope="col">Summary</th>
                </tr>
              </thead>
              <tbody>
                {calculators
                  .filter((calculator) => calculator.category === category.id)
                  .map((calculator) => {
                    const isLive = calculator.status === "Live";

                    return (
                      <tr key={calculator.id}>
                        <th scope="row">
                          {isLive ? (
                            <Link to={`/text${calculator.path}`}>{calculator.title}</Link>
                          ) : (
                            calculator.title
                          )}
                        </th>
                        <td>{calculator.status}</td>
                        <td>{calculator.summary}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="text-only-notes">
        <h2>Notes</h2>
        <ul>
          <li>Results are estimates only and are not tax, payroll, legal, or financial advice.</li>
          <li>Inputs are saved locally in this browser when a calculator supports saved inputs.</li>
          <li>The full visual version remains available from the top navigation.</li>
        </ul>
      </section>
    </div>
  );
}
