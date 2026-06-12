import { useEffect, useState, useCallback } from 'react';
import { websiteApi } from '../../../common/api/client.js';

let cachedSections = null;
let fetchPromise = null;

async function loadSections(force = false) {
  if (!force && cachedSections) return cachedSections;
  if (!force && fetchPromise) return fetchPromise;
  fetchPromise = websiteApi.get('/cms/sections').then((res) => {
    cachedSections = res.data || [];
    return cachedSections;
  }).finally(() => {
    fetchPromise = null;
  });
  return fetchPromise;
}

export function useWebsiteCms({ enabled = true } = {}) {
  const [sections, setSections] = useState(cachedSections || []);
  const [loading, setLoading] = useState(enabled && !cachedSections);

  useEffect(() => {
    if (!enabled) return undefined;
    if (cachedSections) {
      setSections(cachedSections);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    loadSections().then((data) => {
      if (!cancelled) {
        setSections(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [enabled]);

  const getSection = useCallback(
    (key) => sections.find((s) => s.sectionKey === key),
    [sections]
  );

  return { sections, getSection, loading, refresh: () => loadSections(true).then(setSections) };
}

export function invalidateCmsCache() {
  cachedSections = null;
}
