import { toast } from 'sonner';

const providers = [
  { id: 'google', label: 'Continue with Google', color: '#ea4335', letter: 'G' },
  { id: 'github', label: 'Continue with Github', color: '#24292e', letter: 'GH' },
];

export function SocialAuth() {
  const handleSocial = (provider) => {
    toast.info(`${provider} OAuth integration ready — connect your OAuth credentials in production.`);
  };

  return (
    <div className="social-auth">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          className="social-auth__btn"
          onClick={() => handleSocial(p.label)}
        >
          <span className="social-auth__icon" style={{ background: p.color }}>
            {p.letter}
          </span>
          {p.label}
        </button>
      ))}
    </div>
  );
}
