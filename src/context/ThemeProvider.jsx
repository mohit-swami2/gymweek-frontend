import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { websiteApi, adminApi } from '../common/api/client.js';
import {
  applyThemeToDocument,
  bootstrapThemeForPath,
  getThemeForPanel,
  loadCachedThemes,
  mergeThemesWithDefaults,
  resolvePanel,
  saveCachedThemes,
} from './themeConstants.js';

export { resolvePanel };

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const initialPanel = bootstrapThemeForPath();
  const [themes, setThemes] = useState(() => loadCachedThemes());
  const [activePanel, setActivePanelState] = useState(initialPanel);
  const themesRef = useRef(themes);
  const activePanelRef = useRef(activePanel);
  themesRef.current = themes;
  activePanelRef.current = activePanel;

  const applyPanelTheme = useCallback((panel, list = themesRef.current) => {
    if (panel === 'website') return;
    applyThemeToDocument(getThemeForPanel(list, panel), panel);
  }, []);

  const setPanel = useCallback((panel) => {
    setActivePanelState(panel);
    applyPanelTheme(panel);
  }, [applyPanelTheme]);

  useLayoutEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await websiteApi.get('/settings/themes');
        if (cancelled) return;
        const merged = mergeThemesWithDefaults(res.data || []);
        saveCachedThemes(merged);
        setThemes(merged);
        applyPanelTheme(activePanelRef.current, merged);
      } catch (err) {
        console.warn('Theme load failed:', err.message);
      }
    })();

    return () => { cancelled = true; };
  }, [applyPanelTheme]);

  useLayoutEffect(() => {
    applyPanelTheme(activePanel);
  }, [activePanel, themes, applyPanelTheme]);

  const activeTheme = useMemo(
    () => getThemeForPanel(themes, activePanel),
    [themes, activePanel]
  );

  const updateTheme = async (panel, updates) => {
    const res = await adminApi.patch(`/settings/themes/${panel}`, updates);
    const updated = res.data[0];
    setThemes((prev) => {
      const next = prev.map((t) => (t.targetPanel === panel ? updated : t));
      saveCachedThemes(next);
      return next;
    });
    if (activePanel === panel) {
      applyThemeToDocument(updated, panel);
    }
    return updated;
  };

  const refreshThemes = async () => {
    const res = await websiteApi.get('/settings/themes');
    const merged = mergeThemesWithDefaults(res.data || []);
    saveCachedThemes(merged);
    setThemes(merged);
    applyPanelTheme(activePanel, merged);
    return merged;
  };

  return (
    <ThemeContext.Provider value={{
      themes, activeTheme, activePanel, setPanel,
      updateTheme, refreshThemes,
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
