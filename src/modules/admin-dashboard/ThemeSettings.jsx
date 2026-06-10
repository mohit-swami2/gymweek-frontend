import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeProvider.jsx';
import { PreviewPanel } from '../../common/components/PreviewPanel.jsx';

const PANELS = ['website', 'user', 'admin'];
const COLOR_KEYS = ['primary', 'secondary', 'background', 'surface', 'accent'];

export function ThemeSettings() {
  const { themes, updateTheme, setPreviewOverrides, activePanel, setPanel } = useTheme();
  const [panel, setLocalPanel] = useState('website');
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const current = themes.find((t) => t.targetPanel === panel) || {};

  const getVal = (field) => form[field] ?? current[field];
  const getColor = (key) => form.colors?.[key] ?? current.colors?.[key] ?? '#000';

  const buildPayload = () => ({
    fontStyle: getVal('fontStyle') || 'Barlow',
    themeMode: getVal('themeMode') || 'dark',
    colors: COLOR_KEYS.reduce((a, k) => ({ ...a, [k]: getColor(k) }), {}),
  });

  const applyPreview = () => {
    setPanel(panel);
    setPreviewOverrides({ targetPanel: panel, ...buildPayload() });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTheme(panel, buildPayload());
      setForm({});
      toast.success(`${panel} theme saved`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.75rem', marginBottom: '8px' }}>Theme Configuration</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>White-label branding for Website, User Panel, and Admin Panel with live preview.</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {PANELS.map((p) => (
          <button key={p} type="button" className={panel === p ? 'btn-primary' : 'btn-secondary'} onClick={() => { setLocalPanel(p); setForm({}); }} style={{ textTransform: 'capitalize' }}>
            {p} Panel
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Font Style</label>
            <select value={getVal('fontStyle') || 'Barlow'} onChange={(e) => { setForm({ ...form, fontStyle: e.target.value }); applyPreview(); }}>
              {['Barlow', 'Inter', 'Roboto', 'Poppins'].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Theme Mode</label>
            <select value={getVal('themeMode') || 'dark'} onChange={(e) => { setForm({ ...form, themeMode: e.target.value }); applyPreview(); }}>
              {['light', 'dark', 'system'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {COLOR_KEYS.map((key) => (
              <div key={key}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{key}</label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input type="color" value={getColor(key)} onChange={(e) => {
                    setForm({ ...form, colors: { ...form.colors, [key]: e.target.value } });
                    setPreviewOverrides({ targetPanel: panel, fontStyle: getVal('fontStyle'), themeMode: getVal('themeMode'), colors: { ...current.colors, ...form.colors, [key]: e.target.value } });
                    setPanel(panel);
                  }} style={{ width: '36px', height: '36px', padding: 0, border: 'none' }} />
                  <input value={getColor(key)} onChange={(e) => {
                    setForm({ ...form, colors: { ...form.colors, [key]: e.target.value } });
                    applyPreview();
                  }} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '20px' }}>
            {saving ? 'Saving...' : `Save ${panel} Theme`}
          </button>
        </div>

        <PreviewPanel title={`${panel} Panel Preview`} panel={panel}>
          <div style={{ padding: '24px', fontFamily: `'${getVal('fontStyle') || 'Barlow'}', sans-serif` }}>
            <div className="gymweek-logo" style={{ marginBottom: '20px' }}>GYM<span>WEEK</span></div>
            <h2 style={{ color: getColor('primary'), fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', marginBottom: '12px' }}>Preview Heading</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>This is how your {panel} panel will look with the current theme tokens.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: getColor('primary'), color: '#080808', fontWeight: 700 }}>Primary Button</button>
              <button type="button" style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${getColor('accent')}`, background: 'transparent', color: getColor('accent'), fontWeight: 600 }}>Accent Button</button>
            </div>
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', background: getColor('surface'), border: `1px solid ${getColor('secondary')}` }}>
              <div style={{ fontSize: '0.8rem', color: getColor('accent') }}>Surface Card</div>
              <div style={{ marginTop: '6px' }}>Sample dashboard card content</div>
            </div>
          </div>
        </PreviewPanel>
      </div>
    </div>
  );
}
