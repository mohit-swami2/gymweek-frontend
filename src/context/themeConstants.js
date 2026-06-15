export const THEME_STORAGE_KEY = 'gymweek_themes_v1';

export const DEFAULT_THEMES = {
  website: {
    targetPanel: 'website',
    fontStyle: 'Inter',
    themeMode: 'dark',
    colors: {
      primary: '#7eb09a',
      secondary: '#111520',
      background: '#0a0c12',
      surface: '#141820',
      accent: '#9b8ec4',
    },
  },
  user: {
    targetPanel: 'user',
    fontStyle: 'Barlow',
    themeMode: 'dark',
    colors: {
      primary: '#c8ff00',
      secondary: '#111111',
      background: '#080808',
      surface: '#111111',
      accent: '#ff4d00',
    },
  },
  admin: {
    targetPanel: 'admin',
    fontStyle: 'Inter',
    themeMode: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e293b',
      background: '#0f172a',
      surface: '#1e293b',
      accent: '#10b981',
    },
  },
};

export const resolvePanel = (pathname) => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (['/dashboard', '/planner', '/log', '/progress', '/profile', '/history'].some((p) => pathname.startsWith(p))) {
    return 'user';
  }
  return 'website';
};

const hexToRgb = (hex) => {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return null;
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
};

export const isLightBackground = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 160;
};

export const getThemeForPanel = (themes, panel) => {
  if (panel === 'website') return null;
  return themes.find((t) => t.targetPanel === panel) || DEFAULT_THEMES[panel];
};

export const mergeThemesWithDefaults = (apiThemes = []) => {
  const byPanel = Object.fromEntries((apiThemes || []).map((t) => [t.targetPanel, t]));
  return Object.keys(DEFAULT_THEMES).map((panel) => byPanel[panel] || DEFAULT_THEMES[panel]);
};

export const applyThemeToDocument = (theme, panel) => {
  if (!theme || panel === 'website') return;
  const root = document.documentElement;
  const colors = theme.colors || DEFAULT_THEMES[panel]?.colors || {};
  const fontStyle = theme.fontStyle || DEFAULT_THEMES[panel]?.fontStyle || 'Barlow';
  let mode = theme.themeMode || 'dark';
  if (mode === 'system') {
    mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const themeKey = JSON.stringify({ panel, colors, fontStyle, mode });
  if (root.dataset.themeApplied === themeKey) return;
  root.dataset.themeApplied = themeKey;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--card', colors.surface);
  root.style.setProperty('--font-family', `'${fontStyle}', sans-serif`);

  const light = isLightBackground(colors.background);
  root.style.setProperty('--color-text', light ? '#0f172a' : '#f0f0f0');
  root.style.setProperty('--color-text-muted', light ? '#64748b' : '#6b6b6b');
  root.style.setProperty('--foreground', light ? '#0f172a' : '#f0f0f0');
  root.style.setProperty('--muted-foreground', light ? '#64748b' : '#6b6b6b');
  root.style.setProperty('--border', light ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)');

  root.dataset.panel = panel;
  root.dataset.theme = mode;
};

export const loadCachedThemes = () => {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return mergeThemesWithDefaults([]);
    return mergeThemesWithDefaults(JSON.parse(raw));
  } catch {
    return mergeThemesWithDefaults([]);
  }
};

export const saveCachedThemes = (themes) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themes));
  } catch {
    /* ignore quota errors */
  }
};

/** Apply panel theme before React paints (also used by public/theme-bootstrap.js). */
export const bootstrapThemeForPath = (pathname = window.location.pathname) => {
  const panel = resolvePanel(pathname);
  if (panel === 'website') return panel;
  const themes = loadCachedThemes();
  applyThemeToDocument(getThemeForPanel(themes, panel), panel);
  return panel;
};
