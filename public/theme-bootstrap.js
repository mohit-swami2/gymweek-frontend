/**
 * Runs before React — prevents admin/user theme flash on first paint.
 * Keep in sync with src/context/themeConstants.js defaults.
 */
(function bootstrapGymWeekTheme() {
  var STORAGE_KEY = 'gymweek_themes_v1';
  var DEFAULTS = {
    admin: {
      targetPanel: 'admin',
      fontStyle: 'Inter',
      themeMode: 'dark',
      colors: { primary: '#3b82f6', secondary: '#1e293b', background: '#0f172a', surface: '#1e293b', accent: '#10b981' },
    },
    user: {
      targetPanel: 'user',
      fontStyle: 'Barlow',
      themeMode: 'dark',
      colors: { primary: '#c8ff00', secondary: '#111111', background: '#080808', surface: '#111111', accent: '#ff4d00' },
    },
  };

  var path = window.location.pathname;
  var panel = path.indexOf('/admin') === 0 ? 'admin'
    : (['/dashboard', '/planner', '/log', '/progress', '/profile', '/history'].some(function (p) {
      return path.indexOf(p) === 0;
    }) ? 'user' : 'website');

  if (panel === 'website') return;

  var themes = [];
  try {
    themes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    themes = [];
  }

  var theme = themes.find(function (t) { return t.targetPanel === panel; }) || DEFAULTS[panel];
  if (!theme) return;

  var c = theme.colors || DEFAULTS[panel].colors;
  var root = document.documentElement;
  root.style.setProperty('--color-primary', c.primary);
  root.style.setProperty('--color-secondary', c.secondary);
  root.style.setProperty('--color-background', c.background);
  root.style.setProperty('--color-surface', c.surface);
  root.style.setProperty('--color-accent', c.accent);
  root.style.setProperty('--primary', c.primary);
  root.style.setProperty('--background', c.background);
  root.style.setProperty('--card', c.surface);
  root.style.setProperty('--font-family', "'" + (theme.fontStyle || 'Barlow') + "', sans-serif");
  root.style.setProperty('--color-text', '#f0f0f0');
  root.style.setProperty('--color-text-muted', '#6b6b6b');
  root.style.setProperty('--foreground', '#f0f0f0');
  root.dataset.panel = panel;
  root.dataset.theme = theme.themeMode || 'dark';
})();
