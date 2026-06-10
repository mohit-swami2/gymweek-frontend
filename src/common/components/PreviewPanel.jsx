export function PreviewPanel({ title = 'Live Preview', children, panel = 'website' }) {
  return (
    <div className="preview-frame" data-panel={panel}>
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
