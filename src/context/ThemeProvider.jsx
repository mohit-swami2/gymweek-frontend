import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { websiteApi, adminApi } from '../common/api/client.js';

const ThemeContext = createContext(null);

export const resolvePanel = (pathname) => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (['/dashboard', '/planner', '/log', '/progress', '/profile'].some((p) => pathname.startsWith(p))) return 'user';
  return 'website';
};

const applyTheme = (theme, panel) => {
  if (!theme) return;
  const root = document.documentElement;
  const { colors, fontStyle, themeMode } = theme;

  root.style.setProperty('--color-primary', colors?.primary || '#c8ff00');
  root.style.setProperty('--color-secondary', colors?.secondary || '#111111');
  root.style.setProperty('--color-background', colors?.background || '#080808');
  root.style.setProperty('--color-surface', colors?.surface || '#111111');
  root.style.setProperty('--color-accent', colors?.accent || '#ff4d00');
  root.style.setProperty('--primary', colors?.primary || '#c8ff00');
  root.style.setProperty('--background', colors?.background || '#080808');
  root.style.setProperty('--card', colors?.surface || '#111111');
  root.style.setProperty('--font-family', `'${fontStyle || 'Barlow'}', sans-serif`);
  root.dataset.panel = panel;

  let mode = themeMode;
  if (themeMode === 'system') {
    mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.dataset.theme = mode;
};

export function ThemeProvider({ children }) {
  const [themes, setThemes] = useState([]);
  const [activePanel, setActivePanel] = useState('website');
  const [previewOverrides, setPreviewOverrides] = useState(null);

  const fetchThemes = async () => {
    try {
      const res = await websiteApi.get('/settings/themes');
      setThemes(res.data);
    } catch (err) {
      console.warn('Theme load failed:', err.message);
    }
  };

  useEffect(() => { fetchThemes(); }, []);

  useEffect(() => {
    const theme = previewOverrides || themes.find((t) => t.targetPanel === activePanel);
    applyTheme(theme, activePanel);
  }, [themes, activePanel, previewOverrides]);

  const activeTheme = useMemo(
    () => previewOverrides || themes.find((t) => t.targetPanel === activePanel),
    [themes, activePanel, previewOverrides]
  );

  const updateTheme = async (panel, updates) => {
    const res = await adminApi.patch(`/settings/themes/${panel}`, updates);
    setThemes((prev) => prev.map((t) => (t.targetPanel === panel ? res.data[0] : t)));
    setPreviewOverrides(null);
    return res.data[0];
  };

  return (
    <ThemeContext.Provider value={{
      themes, activeTheme, activePanel, setPanel: setActivePanel,
      updateTheme, previewOverrides, setPreviewOverrides, refreshThemes: fetchThemes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
