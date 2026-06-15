/** Human-readable planned sets summary for one exercise log */
export function plannedSummary(ex) {
  const sets = ex.setLogs || [];
  if (!sets.length) return 'No sets planned';
  const w = sets[0].targetWeight ?? 0;
  const r = sets[0].targetReps ?? 0;
  const n = sets.length;
  const uniform = sets.every((s) => s.targetWeight === w && s.targetReps === r);
  if (uniform) return `${n} set${n === 1 ? '' : 's'} · ${w}kg × ${r}`;
  return `${n} sets planned`;
}

/** Map stored session logs → simple checkbox UI state */
export function deriveSimpleEntries(exerciseLogs) {
  return (exerciseLogs || []).map((ex) => {
    if (ex.skipped) {
      return { doneAsPlanned: false, adherencePercent: 0, note: ex.note || '', skipped: true };
    }
    const sets = ex.setLogs || [];
    const allCompleted = sets.length > 0 && sets.every((s) => s.completed && !s.skipped);
    const allAsPlanned = allCompleted && sets.every(
      (s) => s.actualWeight === s.targetWeight && s.actualReps === s.targetReps
    );
    if (allAsPlanned) {
      return { doneAsPlanned: true, adherencePercent: 100, note: ex.note || '', skipped: false };
    }

    let plannedVol = 0;
    let actualVol = 0;
    for (const s of sets) {
      plannedVol += (s.targetWeight || 0) * (s.targetReps || 0);
      if (s.completed) actualVol += (s.actualWeight || 0) * (s.actualReps || 0);
    }
    const pct = plannedVol > 0
      ? Math.round((actualVol / plannedVol) * 100)
      : (allCompleted ? 100 : 80);

    return {
      doneAsPlanned: false,
      adherencePercent: Math.min(100, Math.max(1, pct)),
      note: ex.note || '',
      skipped: false,
    };
  });
}

/** Apply simple UI state back to exercise logs for API save */
export function buildExerciseLogsFromSimple(exerciseLogs, simpleEntries) {
  return exerciseLogs.map((ex, i) => {
    const entry = simpleEntries[i] || { doneAsPlanned: true, adherencePercent: 100, note: '', skipped: false };

    if (entry.skipped) {
      return {
        ...ex,
        skipped: true,
        note: entry.note.trim(),
        setLogs: (ex.setLogs || []).map((s) => ({ ...s, skipped: true, completed: false })),
      };
    }

    const pct = entry.doneAsPlanned
      ? 100
      : Math.min(100, Math.max(0, Number(entry.adherencePercent) || 0));
    const factor = pct / 100;

    return {
      ...ex,
      skipped: false,
      note: entry.note.trim(),
      setLogs: (ex.setLogs || []).map((s) => {
        const tw = s.targetWeight ?? 0;
        const tr = s.targetReps ?? 0;
        if (pct === 0) {
          return { ...s, completed: false, skipped: false, actualWeight: 0, actualReps: 0 };
        }
        if (entry.doneAsPlanned) {
          return { ...s, completed: true, skipped: false, actualWeight: tw, actualReps: tr };
        }
        return {
          ...s,
          completed: true,
          skipped: false,
          actualWeight: Math.round(tw * factor * 10) / 10,
          actualReps: Math.max(1, Math.round(tr * factor)),
        };
      }),
    };
  });
}
