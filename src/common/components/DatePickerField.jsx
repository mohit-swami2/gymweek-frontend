import { useRef } from 'react';
import { Calendar } from 'lucide-react';

const openNativePicker = (el) => {
  if (el && typeof el.showPicker === 'function') {
    try { el.showPicker(); } catch { /* not user-activated or unsupported */ }
  }
};

export function DatePickerField({ value, onChange, label, className = '', ...props }) {
  const inputRef = useRef(null);
  return (
    <label className={`date-picker-field ${className}`.trim()}>
      {label && <span className="date-picker-field__label">{label}</span>}
      <span
        className="date-picker-field__wrap"
        onClick={() => openNativePicker(inputRef.current)}
      >
        <Calendar size={15} className="date-picker-field__icon" aria-hidden />
        <input
          ref={inputRef}
          type="date"
          className="date-picker-field__input"
          value={value}
          onChange={onChange}
          onFocus={(e) => openNativePicker(e.currentTarget)}
          {...props}
        />
      </span>
    </label>
  );
}
