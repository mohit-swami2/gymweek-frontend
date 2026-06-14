export function ComparisonPanel({ comparison }) {
  if (!comparison) return null;

  return (
    <div className="comparison-panel card">
      <h2>Planned vs Actual</h2>
      <div className="comparison-panel__scores">
        <div className="comparison-panel__score">
          <span>Completion</span>
          <strong>{comparison.completionPercent}%</strong>
        </div>
        <div className="comparison-panel__score">
          <span>Adherence</span>
          <strong>{comparison.adherenceScore}</strong>
        </div>
        <div className="comparison-panel__score">
          <span>Skipped sets</span>
          <strong>{comparison.skippedSets}</strong>
        </div>
        <div className="comparison-panel__score">
          <span>Missed sets</span>
          <strong>{comparison.missedSets}</strong>
        </div>
      </div>

      {comparison.overallNote && (
        <p className="comparison-panel__note"><em>{comparison.overallNote}</em></p>
      )}

      <div className="comparison-panel__exercises">
        {comparison.exercises?.map((ex) => (
          <div key={ex.exerciseId || ex.name} className="comparison-panel__exercise">
            <div className="comparison-panel__exercise-head">
              <strong>{ex.name}</strong>
              <span>{ex.skipped ? 'Skipped' : `${ex.completionPercent}%`}</span>
            </div>
            {!ex.skipped && ex.sets?.map((s) => (
              <div key={s.setIndex} className="comparison-panel__set-row">
                <span>Set {s.setIndex}</span>
                <span>{s.skipped ? 'Skipped' : `${s.actualWeight}kg × ${s.actualReps}`}</span>
                <span className={s.weightDiff < 0 ? 'comparison-panel__down' : ''}>
                  {s.weightDiff !== 0 && !s.skipped ? `${s.weightDiff > 0 ? '+' : ''}${s.weightDiff}kg` : ''}
                </span>
              </div>
            ))}
            {ex.note && <p className="comparison-panel__ex-note">{ex.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
