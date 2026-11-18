type ChevronCircleProps = { className?: string };

/** The HTML circle owns its color; the SVG contains only the chevrons. */
export default function ChevronCircle({ className = '' }: ChevronCircleProps) {
  return (
    <div className={`chevron-circle${className ? ` ${className}` : ''}`} aria-hidden="true">
      <img className="chevron-right-icon" src="/icons/double-chevron-right.svg" alt="" width="20" height="20" />
    </div>
  );
}
