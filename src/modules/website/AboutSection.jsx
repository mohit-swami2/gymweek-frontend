export function AboutSection({ section, features }) {
  const blocks = section?.content?.blocks || [];
  const featureItems = features?.content?.items || [];

  return (
    <section id="about" style={{ padding: '80px 24px', background: 'var(--color-surface)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 900 }}>
            {section?.title || 'Built for Serious Lifters'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '12px', fontSize: '1.05rem' }}>
            {section?.subtitle}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {blocks.map((block) => (
            <div
              key={block.heading}
              style={{
                padding: '28px',
                borderRadius: '12px',
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '10px', color: 'var(--color-primary)' }}>
                {block.heading}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{block.body}</p>
            </div>
          ))}
        </div>
        {featureItems.length > 0 && (
          <div style={{ marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {featureItems.map((item) => (
              <div key={item.title} style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                  {item.icon === 'flame' ? '🔥' : item.icon === 'chart' ? '📊' : '📅'}
                </div>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
