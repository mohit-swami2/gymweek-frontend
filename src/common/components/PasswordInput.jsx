import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordInput({ style, inputStyle, className = '', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-input ${className}`.trim()} style={style}>
      <input {...props} type={visible ? 'text' : 'password'} className="password-input__field" style={inputStyle} />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
