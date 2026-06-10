import { ResponsiveContainer } from 'recharts';

export function ChartCard({ title, subtitle, children, height = 220 }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      {title && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
