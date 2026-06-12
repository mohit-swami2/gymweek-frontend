import { getByPath, setByPath, SECTION_DEFINITIONS } from './sectionRegistry.js';

function FieldRow({ label, help, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      {children}
      {help && <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{help}</p>}
    </div>
  );
}

function LinkListEditor({ value = [], onChange }) {
  const update = (index, field, val) => {
    const next = value.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onChange(next);
  };
  const add = () => onChange([...value, { label: '', href: '' }]);
  const remove = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.map((link, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
          <input placeholder="Label" value={link.label || ''} onChange={(e) => update(i, 'label', e.target.value)} />
          <input placeholder="href (#features or /terms)" value={link.href || ''} onChange={(e) => update(i, 'href', e.target.value)} />
          <button type="button" className="btn-danger" onClick={() => remove(i)}>×</button>
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={add} style={{ alignSelf: 'flex-start' }}>+ Add link</button>
    </div>
  );
}

function StatListEditor({ value = [], onChange }) {
  const update = (index, field, val) => {
    onChange(value.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };
  const add = () => onChange([...value, { label: '', value: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.map((stat, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
          <input placeholder="Label" value={stat.label || ''} onChange={(e) => update(i, 'label', e.target.value)} />
          <input placeholder="Value (e.g. 50K+)" value={stat.value || ''} onChange={(e) => update(i, 'value', e.target.value)} />
          <button type="button" className="btn-danger" onClick={() => remove(i)}>×</button>
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={add} style={{ alignSelf: 'flex-start' }}>+ Add stat</button>
    </div>
  );
}

function FeatureListEditor({ value = [], onChange }) {
  const update = (index, field, val) => {
    onChange(value.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };
  const add = () => onChange([...value, { title: '', desc: '', badge: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {value.map((item, i) => (
        <div key={i} className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ fontSize: '0.8rem' }}>Feature {i + 1}</strong>
            <button type="button" className="btn-danger" onClick={() => remove(i)}>Remove</button>
          </div>
          <input placeholder="Title" value={item.title || ''} onChange={(e) => update(i, 'title', e.target.value)} style={{ marginBottom: 6 }} />
          <input placeholder="Badge" value={item.badge || ''} onChange={(e) => update(i, 'badge', e.target.value)} style={{ marginBottom: 6 }} />
          <textarea placeholder="Description" rows={2} value={item.desc || item.description || ''} onChange={(e) => update(i, 'desc', e.target.value)} />
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={add} style={{ alignSelf: 'flex-start' }}>+ Add feature</button>
    </div>
  );
}

export function CmsSectionEditor({ sectionKey, form, onChange, showJson }) {
  const def = SECTION_DEFINITIONS[sectionKey];
  if (!def?.fields) {
    return (
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
        This section is managed in a dedicated admin page.
      </p>
    );
  }

  const sectionData = {
    title: form.title,
    subtitle: form.subtitle,
    content: typeof form.content === 'object' ? form.content : {},
  };

  const setField = (path, value) => {
    if (path === 'title') {
      onChange({ ...form, title: value });
      return;
    }
    if (path === 'subtitle') {
      onChange({ ...form, subtitle: value });
      return;
    }
    const contentPath = path.startsWith('content.') ? path.slice(8) : path;
    const content = typeof form.content === 'object' ? { ...form.content } : {};
    const updated = setByPath({ content }, `content.${contentPath}`, value).content;
    onChange({ ...form, content: updated });
  };

  if (showJson) {
    return (
      <textarea
        rows={14}
        value={typeof form.content === 'string' ? form.content : JSON.stringify(form.content, null, 2)}
        onChange={(e) => onChange({ ...form, content: e.target.value })}
        style={{ fontFamily: 'monospace', fontSize: '0.8rem', width: '100%' }}
      />
    );
  }

  return (
    <div>
      {def.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          {def.description}
        </p>
      )}
      {def.fields.map((field) => {
        const val = field.key.startsWith('content.')
          ? getByPath(sectionData, field.key)
          : sectionData[field.key];

        if (field.type === 'linkList') {
          return (
            <FieldRow key={field.key} label={field.label} help={field.help}>
              <LinkListEditor value={val || []} onChange={(v) => setField(field.key, v)} />
            </FieldRow>
          );
        }
        if (field.type === 'statList') {
          return (
            <FieldRow key={field.key} label={field.label} help={field.help}>
              <StatListEditor value={val || []} onChange={(v) => setField(field.key, v)} />
            </FieldRow>
          );
        }
        if (field.type === 'featureList') {
          return (
            <FieldRow key={field.key} label={field.label} help={field.help}>
              <FeatureListEditor value={val || []} onChange={(v) => setField(field.key, v)} />
            </FieldRow>
          );
        }
        if (field.type === 'textarea') {
          return (
            <FieldRow key={field.key} label={field.label} help={field.help}>
              <textarea rows={3} value={val || ''} onChange={(e) => setField(field.key, e.target.value)} />
            </FieldRow>
          );
        }
        return (
          <FieldRow key={field.key} label={field.label} help={field.help}>
            <input type="text" value={val || ''} onChange={(e) => setField(field.key, e.target.value)} />
          </FieldRow>
        );
      })}
    </div>
  );
}
