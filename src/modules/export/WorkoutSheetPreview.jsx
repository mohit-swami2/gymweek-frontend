const THEME_FALLBACK = {
  minimal: { background: '#fafafa', surface: '#fff', text: '#1f2937', textMuted: '#9ca3af', accent: '#6b7280', border: '#e5e7eb' },
  dark_gym: { background: '#1c1c1e', surface: '#2c2c2e', text: '#e8e8ed', textMuted: '#98989d', accent: '#a3b18a', border: '#3a3a3c' },
  premium: { background: '#f5f3ef', surface: '#faf8f5', text: '#2d2a26', textMuted: '#8b8580', accent: '#8b7355', border: '#ddd8d0' },
  slate: { background: '#f0f4f8', surface: '#fff', text: '#334155', textMuted: '#94a3b8', accent: '#64748b', border: '#cbd5e1' },
  forest: { background: '#f7f9f7', surface: '#fff', text: '#2f3e2f', textMuted: '#7a8f7a', accent: '#5c7a5c', border: '#d4ddd4' },
  printable: { background: '#fff', surface: '#fff', text: '#000', textMuted: '#444', accent: '#000', border: '#ccc' },
  midnight: { background: '#141820', surface: '#1c2230', text: '#e2e8f0', textMuted: '#94a3b8', accent: '#c9a962', border: '#2d3748' },
  sand: { background: '#f4efe8', surface: '#faf7f2', text: '#3d3630', textMuted: '#9a8f82', accent: '#b8956c', border: '#ddd4c8' },
  ocean: { background: '#eef4f4', surface: '#f8fbfb', text: '#2c4040', textMuted: '#7a9494', accent: '#5a8a8a', border: '#c8dada' },
  lavender: { background: '#f3f1f6', surface: '#faf9fc', text: '#3a3545', textMuted: '#8b8499', accent: '#7c6b8a', border: '#dcd6e4' },
  rust: { background: '#f5f0ec', surface: '#faf7f4', text: '#3d2e28', textMuted: '#9a8578', accent: '#a65d45', border: '#ddd0c8' },
  mono: { background: '#f2f2f2', surface: '#fafafa', text: '#2a2a2a', textMuted: '#777', accent: '#555', border: '#d4d4d4' },
  copper: { background: '#1a1918', surface: '#252422', text: '#eceae6', textMuted: '#9c9890', accent: '#b87333', border: '#3a3835' },
  ice: { background: '#eef2f7', surface: '#f8fafc', text: '#1e293b', textMuted: '#94a3b8', accent: '#4a7c9b', border: '#cbd5e1' },
  olive: { background: '#f2f1ec', surface: '#f9f8f4', text: '#2f2e28', textMuted: '#7a7768', accent: '#6b705c', border: '#d5d2c8' },
};

export function WorkoutSheetPreview({ data, themeSlug, themes = [] }) {
  const theme = themes.find((t) => t.slug === themeSlug)?.colors || THEME_FALLBACK[themeSlug] || THEME_FALLBACK.minimal;
  const c = theme;

  return (
    <div className="sheet-preview" style={{ background: c.background, color: c.text, borderColor: c.border }}>
      <div className="sheet-preview__brand" style={{ color: c.accent }}>GYM WEEK</div>
      <h2 className="sheet-preview__title">{data?.planLabel || 'Workout Sheet'}</h2>

      {(data?.days || []).map((day) => (
        <div key={day.dayOfWeek} className="sheet-preview__day" style={{ borderColor: c.border }}>
          <h3 style={{ color: c.accent }}>{day.dayLabel} — {day.focus}</h3>

          {(day.exercises || []).map((ex) => (
            <div key={ex.name} className="sheet-preview__exercise-block">
              <div className="sheet-preview__exercise-name">{ex.name}</div>
              <table className="sheet-preview__table" style={{ borderColor: c.border }}>
                <thead>
                  <tr style={{ background: c.surface, color: c.textMuted }}>
                    <th>Set</th>
                    <th>Weight (kg)</th>
                    <th>Reps</th>
                    <th>Done</th>
                  </tr>
                </thead>
                <tbody>
                  {(ex.sets || []).map((s, idx) => (
                    <tr key={s.setIndex ?? idx} style={{ borderColor: c.border }}>
                      <td>{s.setIndex ?? idx + 1}</td>
                      <td>{s.targetWeight ?? '—'}</td>
                      <td>{s.targetReps ?? '—'}</td>
                      <td className="sheet-preview__check">☐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
