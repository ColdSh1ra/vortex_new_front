type SelectComponentProps = {
  id: string;
  label: string;
  selected: boolean;
  onChange?: (selected: boolean) => void;
  readOnly?: boolean;
};

function SelectComponent({
  id,
  label,
  selected,
  onChange,
  readOnly = false,
}: SelectComponentProps) {
  return (
    <button
      id={id}
      className={`default-select-row${selected ? ' is-selected' : ''}`}
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-readonly={readOnly}
      onClick={() => {
        if (!readOnly) {
          onChange?.(!selected);
        }
      }}
    >
      <span className="default-select-indicator" aria-hidden="true"><i /></span>
      <span>{label}</span>
    </button>
  );
}

export default SelectComponent;
