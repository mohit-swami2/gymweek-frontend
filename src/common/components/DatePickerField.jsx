import { Calendar } from 'lucide-react';

export function DatePickerField({ value, onChange, label, className = '', ...props }) {
  return (
    <label className={`date-picker-field ${className}`.trim()}>
      {label && <span className="date-picker-field__label">{label}</span>}
      <span className="date-picker-field__wrap">
        <Calendar size={15} className="date-picker-field__icon" aria-hidden />
        <input
          type="date"
          className="date-picker-field__input"
          value={value}
          onChange={onChange}
          {...props}
        />
      </span>
    </label>
  );
}
