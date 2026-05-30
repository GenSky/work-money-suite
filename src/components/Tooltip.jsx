export default function Tooltip({ text, children }) {
  return (
    <span className="tooltip">
      {children}
      <span role="tooltip" className="tooltip-content">
        {text}
      </span>
    </span>
  );
}
