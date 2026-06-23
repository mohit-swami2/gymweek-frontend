/**
 * L4B — client-side recovery backup for the Live Workout Log.
 *
 * Uses native localStorage (synchronous, survives tab close + reload, no deps)
 * to persist the live "set matrix" after every change. If the network drops or
 * the tab is closed mid-session, the exact draft is restored on reload and any
 * unsynced changes are pushed to the backend once connectivity returns, after
 * which the local buffer is cleared.
 */
const keyFor = (sessionId) => `gymweek_live_draft_${sessionId}`;

export const saveLiveDraft = (sessionId, { exerciseLogs, pendingSync = false }) => {
  if (!sessionId) return;
  try {
    localStorage.setItem(keyFor(sessionId), JSON.stringify({
      sessionId,
      exerciseLogs,
      pendingSync,
      updatedAt: Date.now(),
    }));
  } catch {
    /* ignore quota / private-mode errors */
  }
};

export const loadLiveDraft = (sessionId) => {
  if (!sessionId) return null;
  try {
    const raw = localStorage.getItem(keyFor(sessionId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearLiveDraft = (sessionId) => {
  if (!sessionId) return;
  try {
    localStorage.removeItem(keyFor(sessionId));
  } catch {
    /* noop */
  }
};
