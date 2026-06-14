export function PreviewPanel({ title = 'Live Preview', children, panel = 'website', themeColors = null, fontStyle = null }) {
  const scopedStyle = themeColors ? {
    '--color-primary': themeColors.primary,
    '--color-secondary': themeColors.secondary,
    '--color-background': themeColors.background,
    '--color-surface': themeColors.surface,
    '--color-accent': themeColors.accent,
    '--color-text': themeColors.background === '#f8fafc' || themeColors.background === '#f1f5f9' ? '#0f172a' : '#f0f0f0',
    '--color-text-muted': themeColors.background === '#f8fafc' || themeColors.background === '#f1f5f9' ? '#64748b' : '#6b6b6b',
    '--color-border': 'rgba(255,255,255,0.08)',
    '--primary': themeColors.primary,
    '--background': themeColors.background,
    '--card': themeColors.surface,
    fontFamily: fontStyle ? `'${fontStyle}', sans-serif` : undefined,
  } : undefined;

  return (
    <div className="preview-frame" data-panel={panel} style={scopedStyle}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--color-border)',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        background: 'var(--color-surface)',
      }}>
        <span>{title}</span>
        <span style={{ textTransform: 'capitalize' }}>{panel} panel</span>
      </div>
      <div className="preview-content">{children}</div>
    </div>
  );
}

export function HtmlPreview({ html }) {
  return (
    <div
      className="preview-content"
      style={{ padding: '24px', lineHeight: 1.7 }}
      dangerouslySetInnerHTML={{ __html: html || '<p style="color:var(--color-text-muted)">Nothing to preview yet.</p>' }}
    />
  );
}
