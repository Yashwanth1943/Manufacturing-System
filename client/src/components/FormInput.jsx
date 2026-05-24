import './FormInput.css';

function FormInput({ label, type = 'text', options, textarea = false, className = '', ...props }) {
  return (
    <label className={`form-input ${className}`}>
      <span>{label}</span>
      {textarea ? (
        <textarea {...props} />
      ) : options ? (
        <select {...props}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} {...props} />
      )}
    </label>
  );
}

export default FormInput;
