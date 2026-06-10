import { toast } from 'sonner';

const providers = [
  { id: 'google', label: 'Continue with Google', color: '#ea4335' },
  { id: 'github', label: 'Continue with GitHub', color: '#333' },
];

export function SocialAuth() {
  const handleSocial = (provider) => {
    toast.info(`${provider} OAuth integration ready — connect your OAuth credentials in production.`);
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Or sign in with social auth
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSocial(p.label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: p.color,
              display: 'inline-block',
            }} />
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
