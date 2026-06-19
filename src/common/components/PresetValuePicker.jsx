import { useState } from 'react';

export function PresetValuePicker({
  presets,
  value,
  onChange,
  disabled,
  unit = '',
  customLabel = 'Custom',
  customPlaceholder = '0',
}) {
  const [customMode, setCustomMode] = useState(() => {
    const n = Number(value);
    return value !== '' && value != null && !presets.includes(n);
  });

  const activePreset = presets.includes(Number(value)) ? Number(value) : null;

  const selectPreset = (preset) => {
    setCustomMode(false);
    onChange(preset);
  };

  const enableCustom = () => {
    setCustomMode(true);
    if (activePreset != null) onChange('');
  };

  return (
    <div className="preset-picker">
      <div className="preset-picker__chips">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`preset-picker__chip${activePreset === preset && !customMode ? ' preset-picker__chip--active' : ''}`}
            disabled={disabled}
            onClick={() => selectPreset(preset)}
          >
            {preset}{unit}
          </button>
        ))}
        <button
          type="button"
          className={`preset-picker__chip preset-picker__chip--custom${customMode ? ' preset-picker__chip--active' : ''}`}
          disabled={disabled}
          onClick={enableCustom}
        >
          {customLabel}
        </button>
      </div>
      {customMode && (
        <input
          type="number"
          className="preset-picker__input"
          placeholder={customPlaceholder}
          value={value === 0 ? '' : value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
      )}
    </div>
  );
}

export const WEIGHT_PRESETS = [5, 7.5, 10, 12.5, 15, 17.5, 20];
export const REP_PRESETS = [6, 8, 10, 12, 15, 20];
