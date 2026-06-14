import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider.jsx';
import { PreviewPanel } from '../../common/components/PreviewPanel.jsx';
import { THEME_PRESETS } from './themePresets.js';
import { adminApi } from '../../common/api/client.js';
import './quotes.css';

const PANELS = ['website', 'user', 'admin'];

function ExportSheetThemes() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/export/themes')
      .then((res) => setThemes(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (t) => {
    try {
      await adminApi.patch(`/export/themes/${t._id}`, { isActive: !t.isActive });
      setThemes((prev) => prev.map((x) => (x._id === t._id ? { ...x, isActive: !x.isActive } : x)));
      toast.success(t.isActive ? 'Theme disabled' : 'Theme enabled');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p className="admin-page__loading">Loading sheet themes…</p>;

  return (
    <div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        Muted palettes for PDF and printable workout sheets. Toggle availability for users.
      </p>
      <div className="export-themes-grid">
        {themes.map((t) => (
          <div
            key={t._id}
            className="export-theme-card card"
            style={{
              background: t.colors?.background,
              color: t.colors?.text,
              borderColor: t.colors?.border,
              opacity: t.isActive ? 1 : 0.55,
            }}
          >
            <strong>{t.name}</strong>
            <span style={{ color: t.colors?.textMuted, fontSize: '0.8rem' }}>{t.description}</span>
            <div className="export-theme-card__swatches">
              {['background', 'text', 'accent', 'border'].map((k) => (
                <span key={k} title={k} style={{ background: t.colors?.[k] }} />
              ))}
            </div>
            <button type="button" className="btn-secondary btn-sm" onClick={() => toggle(t)}>
              {t.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ThemeSettings() {
  const { themes, updateTheme } = useTheme();
  const [section, setSection] = useState('panels');
  const [panel, setLocalPanel] = useState('website');
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [fontStyle, setFontStyle] = useState('');
  const [themeMode, setThemeMode] = useState('');
  const [colors, setColors] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = themes.find((t) => t.targetPanel === panel) || {};
  const presets = THEME_PRESETS[panel] || [];

  const activePreset = presets.find((p) => p.id === selectedPresetId);
  const previewFont = fontStyle || activePreset?.fontStyle || current.fontStyle || 'Barlow';
  const previewMode = themeMode || activePreset?.themeMode || current.themeMode || 'dark';
  const previewColors = colors || activePreset?.colors || current.colors || {};

  const applyPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setFontStyle(preset.fontStyle);
    setThemeMode(preset.themeMode);
    setColors(preset.colors);
  };

  const buildPayload = () => ({
    fontStyle: previewFont,
    themeMode: previewMode,
    colors: previewColors,
  });

  const handleSave = async () => {
    if (!activePreset && !colors) {
      toast.error('Select a theme preset first');
      return;
    }
    setSaving(true);
    try {
      await updateTheme(panel, buildPayload());
      setSelectedPresetId(null);
      setFontStyle('');
      setThemeMode('');
      setColors(null);
      toast.success(`${panel} theme saved`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getColor = (key) => previewColors[key] || '#000';

  return (
    <div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.75rem', marginBottom: '8px' }}>Theme Configuration</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        App panel branding and workout sheet export designs.
      </p>

      <div className="theme-settings__tabs">
        <button type="button" className={section === 'panels' ? 'active' : ''} onClick={() => setSection('panels')}>
          App Panels
        </button>
        <button type="button" className={section === 'sheets' ? 'active' : ''} onClick={() => setSection('sheets')}>
          Workout Sheet Themes
        </button>
      </div>

      {section === 'sheets' ? (
        <ExportSheetThemes />
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {PANELS.map((p) => (
              <button
                key={p}
                type="button"
                className={panel === p ? 'btn-primary' : 'btn-secondary'}
                onClick={() => {
                  setLocalPanel(p);
                  setSelectedPresetId(null);
                  setFontStyle('');
                  setThemeMode('');
                  setColors(null);
                }}
                style={{ textTransform: 'capitalize' }}
              >
                {p} Panel
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card theme-presets">
              <h3 className="theme-presets__title">Choose a preset</h3>
              <p className="theme-presets__subtitle">{presets.length} curated themes for the {panel} panel</p>
              <div className="theme-presets__grid">
                {presets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`theme-preset-card${isSelected ? ' theme-preset-card--active' : ''}`}
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="theme-preset-card__swatches">
                        {['primary', 'background', 'surface', 'accent'].map((key) => (
                          <span key={key} className="theme-preset-card__swatch" style={{ background: preset.colors[key] }} />
                        ))}
                      </div>
                      <div className="theme-preset-card__info">
                        <strong>{preset.name}</strong>
                        <span>{preset.fontStyle} · {preset.themeMode}</span>
                      </div>
                      {isSelected && (
                        <span className="theme-preset-card__check">
                          <Check size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="btn-primary" onClick={handleSave} disabled={saving || !activePreset} style={{ marginTop: '20px' }}>
                {saving ? 'Saving...' : `Save ${panel} Theme`}
              </button>
            </div>

            <PreviewPanel title={`${panel} Panel Preview`} panel={panel} themeColors={previewColors} fontStyle={previewFont}>
              <div style={{ padding: '24px', fontFamily: `'${previewFont}', sans-serif` }}>
                <div className="gymweek-logo" style={{ marginBottom: '20px' }}>GYM<span>WEEK</span></div>
                <h2 style={{ color: getColor('primary'), fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', marginBottom: '12px' }}>
                  {activePreset?.name || 'Current Theme'}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>This is how your {panel} panel will look with the selected preset.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: getColor('primary'), color: '#080808', fontWeight: 700, cursor: 'pointer' }}>Primary Button</button>
                  <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${getColor('accent')}`, background: 'transparent', color: getColor('accent'), fontWeight: 600, cursor: 'pointer' }}>Accent Button</button>
                </div>
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', background: getColor('surface'), border: `1px solid ${getColor('secondary')}` }}>
                  <div style={{ fontSize: '0.8rem', color: getColor('accent') }}>Surface Card</div>
                  <div style={{ marginTop: '6px' }}>Sample dashboard card content</div>
                </div>
              </div>
            </PreviewPanel>
          </div>
        </>
      )}
    </div>
  );
}
