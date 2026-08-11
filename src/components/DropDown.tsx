
import "../css/dropdown.css";
type dropDownProp = {
  label?: "Select" | string;
  options: string[];
  name?: string;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
};

function DropDown({
  label,
  options,
  name = "servicetype",
  required,
  onChange,
}: dropDownProp) {
  return (
    <select
      name={name}
      className="selection"
      required={required}
      onChange={onChange}
      defaultValue=""
    >
      <option value="" disabled>
        {label}
      </option>

      {options.map((ops, index) => (
        <option key={index} value={ops}>
          {ops}
        </option>
      ))}
    </select>
  );
}

export default DropDown;
