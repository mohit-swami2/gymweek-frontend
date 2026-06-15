import { Modal } from '../../common/components/Modal.jsx';

const STAT_COPY = {
  totalWorkouts: {
    title: 'Total workouts',
    description: 'Every completed session you have logged — live tracking and post-gym logs combined.',
  },
  lifetimeVolume: {
    title: 'Lifetime volume',
    description: 'Total weight moved across all completed sets (weight × reps), in kilograms.',
  },
  thisWeek: {
    title: 'This week',
    description: 'Sessions and volume from the last 7 days compared to the previous week.',
  },
  personalRecords: {
    title: 'Personal records',
    description: 'Tracked lifts where you hit a new max weight or estimated 1RM.',
  },
  adherence: {
    title: 'Adherence score',
    description: 'How closely your logged workouts matched your plan — sets completed vs planned.',
  },
};

export function ProgressStatDetailModal({ open, onClose, statId, summary, adherence, prs }) {
  const meta = STAT_COPY[statId];
  if (!meta) return null;

  let body = null;

  if (statId === 'totalWorkouts') {
    body = (
      <>
        <p className="progress-stat-detail__lead">{summary?.totalWorkouts ?? 0} sessions logged all time.</p>
        <ul className="progress-stat-detail__list">
          <li><strong>Current streak:</strong> {summary?.currentStreak ?? 0} days</li>
          <li><strong>Longest streak:</strong> {summary?.longestStreak ?? 0} days</li>
          <li><strong>This week:</strong> {summary?.thisWeek?.count ?? 0} workouts</li>
        </ul>
      </>
    );
  } else if (statId === 'lifetimeVolume') {
    const vol = summary?.totalVolume ?? 0;
    body = (
      <>
        <p className="progress-stat-detail__lead">{(vol / 1000).toFixed(1)}K kg moved across your training history.</p>
        <ul className="progress-stat-detail__list">
          <li><strong>This week:</strong> {((summary?.thisWeek?.volume ?? 0) / 1000).toFixed(1)}K kg</li>
          <li><strong>Last week:</strong> {((summary?.lastWeek?.volume ?? 0) / 1000).toFixed(1)}K kg</li>
          <li><strong>Week-over-week:</strong> {summary?.improvementPercent >= 0 ? '+' : ''}{summary?.improvementPercent ?? 0}%</li>
        </ul>
      </>
    );
  } else if (statId === 'thisWeek') {
    body = (
      <>
        <p className="progress-stat-detail__lead">{summary?.thisWeek?.count ?? 0} workouts in the last 7 days.</p>
        <ul className="progress-stat-detail__list">
          <li><strong>Volume this week:</strong> {((summary?.thisWeek?.volume ?? 0) / 1000).toFixed(1)}K kg</li>
          <li><strong>Volume last week:</strong> {((summary?.lastWeek?.volume ?? 0) / 1000).toFixed(1)}K kg</li>
          <li><strong>Change:</strong> {summary?.improvementPercent >= 0 ? '+' : ''}{summary?.improvementPercent ?? 0}% vs prior week</li>
        </ul>
      </>
    );
  } else if (statId === 'personalRecords') {
    body = (
      <>
        <p className="progress-stat-detail__lead">{summary?.prCount ?? prs?.length ?? 0} personal records on file.</p>
        {prs?.length > 0 ? (
          <ul className="progress-stat-detail__list progress-stat-detail__list--prs">
            {prs.slice(0, 6).map((pr) => (
              <li key={pr._id}>
                <strong>{pr.exerciseId?.name}</strong>
                <span>{pr.maxWeight} kg · est. 1RM {Math.round(pr.estimatedORM)} kg</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="progress-stat-detail__muted">Log workouts and hit new maxes to build your PR list.</p>
        )}
      </>
    );
  } else if (statId === 'adherence') {
    body = (
      <>
        <p className="progress-stat-detail__lead">Average adherence score: {adherence?.avgAdherenceScore ?? '—'}</p>
        <ul className="progress-stat-detail__list">
          <li><strong>Avg completion:</strong> {adherence?.avgCompletionPercent ?? 0}% of planned sets</li>
          <li><strong>Sessions in range:</strong> {adherence?.sessionCount ?? 0}</li>
          <li><strong>Skipped sets:</strong> {adherence?.totalSkippedSets ?? 0}</li>
          <li><strong>Missed sets:</strong> {adherence?.totalMissedSets ?? 0}</li>
        </ul>
      </>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={meta.title} size="md" footer={<button type="button" className="btn-primary" onClick={onClose}>Got it</button>}>
      <p className="progress-stat-detail__desc">{meta.description}</p>
      {body}
    </Modal>
  );
}
