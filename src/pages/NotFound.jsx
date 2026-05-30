import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function NotFound() {
  usePageMeta("Calculator not found", "The requested Work & Money Suite calculator is not available.");

  return (
    <section className="page-intro">
      <p className="eyebrow">404</p>
      <h1>Calculator not found</h1>
      <p>The calculator route you opened is not available yet.</p>
      <Link className="primary-button inline-link" to="/">
        Back to dashboard
      </Link>
    </section>
  );
}
