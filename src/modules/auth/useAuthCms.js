import { useWebsiteCms } from '../website/hooks/useWebsiteCms.js';

export function useAuthCms(sectionKey) {
  const { getSection, loading } = useWebsiteCms();
  const section = getSection(sectionKey);
  const content = section?.content || {};
  return { section, content, loading };
}
