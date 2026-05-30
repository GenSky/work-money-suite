import { Link } from "react-router-dom";
import { CalculatorIcon, StarIcon } from "./icons.jsx";

export default function CalculatorCard({ calculator, isFavorite, onToggleFavorite }) {
  const isLive = calculator.status === "Live";
  const content = (
    <>
      <div className="card-topline">
        <span className={isLive ? "status-pill live" : "status-pill"}>{calculator.status}</span>
        <button
          className="icon-button quiet"
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onToggleFavorite(calculator.id);
          }}
          aria-label={isFavorite ? `Remove ${calculator.title} from favorites` : `Favorite ${calculator.title}`}
        >
          <StarIcon filled={isFavorite} />
        </button>
      </div>
      <div className="card-icon">
        <CalculatorIcon />
      </div>
      <h3>{calculator.title}</h3>
      <p>{calculator.summary}</p>
      <div className="tag-row">
        {calculator.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </>
  );

  if (!isLive) {
    return <article className="calculator-card disabled">{content}</article>;
  }

  return (
    <Link className="calculator-card" to={calculator.path}>
      {content}
    </Link>
  );
}
