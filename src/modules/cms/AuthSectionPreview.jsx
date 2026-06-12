import { AuthLayout } from '../auth/AuthLayout.jsx';

const inputStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-background)',
  color: 'var(--color-text)',
  fontSize: '0.9rem',
  width: '100%',
};

const btnStyle = {
  padding: '14px',
  borderRadius: '10px',
  border: 'none',
  background: 'var(--color-primary)',
  color: '#080808',
  fontWeight: 700,
  cursor: 'default',
  width: '100%',
};

const linkStyle = { color: 'var(--color-primary)', textDecoration: 'none' };

function MockInput({ placeholder }) {
  return <input type="text" placeholder={placeholder} readOnly style={inputStyle} />;
}

export function AuthSectionPreview({ type, section }) {
  const content = section?.content || {};
  const title = section?.title || '';
  const subtitle = section?.subtitle || '';

  const defaults = {
    login: {
      title: 'Sign In',
      subtitle: 'Access your GymWeek workspace',
    },
    register: {
      title: 'Create Account',
      subtitle: 'Start your GymWeek fitness journey',
    },
    forgot: {
      title: 'Reset Password',
      subtitle: "We'll send you a recovery link",
    },
    reset: {
      title: 'Set New Password',
      subtitle: 'Choose a strong password',
    },
  };

  const d = defaults[type] || defaults.login;

  return (
    <AuthLayout title={title || d.title} subtitle={subtitle || d.subtitle}>
      {type === 'login' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <MockInput placeholder={content.emailPlaceholder || 'Email'} />
            <MockInput placeholder={content.passwordPlaceholder || 'Password'} />
            <button type="button" style={btnStyle}>{content.submitLabel || 'Sign In'}</button>
          </div>
          <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
            <span style={linkStyle}>{content.forgotLink || 'Forgot password?'}</span>
            {' · '}
            <span style={linkStyle}>{content.registerLink || 'Create account'}</span>
          </p>
          <div className="btn-secondary" style={{ display: 'block', marginTop: 16, textAlign: 'center', padding: 12 }}>
            {content.adminLink || 'Login as Admin'}
          </div>
        </>
      )}

      {type === 'register' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MockInput placeholder={content.namePlaceholder || 'Full Name'} />
            <MockInput placeholder={content.emailPlaceholder || 'Email'} />
            <MockInput placeholder={content.passwordPlaceholder || 'Password (min 6 chars)'} />
            <button type="button" style={btnStyle}>{content.submitLabel || 'Create Account'}</button>
          </div>
          <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            {content.loginPrompt || 'Already have an account?'}{' '}
            <span style={linkStyle}>{content.loginLink || 'Sign in'}</span>
          </p>
          <div className="btn-secondary" style={{ display: 'block', marginTop: 16, textAlign: 'center', padding: 12 }}>
            {content.adminLink || 'Login as Admin'}
          </div>
        </>
      )}

      {type === 'forgot' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MockInput placeholder={content.emailPlaceholder || 'Email'} />
            <button type="button" style={btnStyle}>{content.submitLabel || 'Send Reset Link'}</button>
          </div>
          <p style={{ marginTop: 16, fontSize: '0.875rem', textAlign: 'center' }}>
            <span style={linkStyle}>{content.backLink || 'Back to login'}</span>
          </p>
        </>
      )}

      {type === 'reset' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MockInput placeholder={content.passwordPlaceholder || 'New password'} />
            <MockInput placeholder={content.confirmPlaceholder || 'Confirm password'} />
            <button type="button" style={btnStyle}>{content.submitLabel || 'Update Password'}</button>
          </div>
          <p style={{ marginTop: 16, fontSize: '0.875rem', textAlign: 'center' }}>
            <span style={linkStyle}>{content.backLink || 'Back to login'}</span>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
