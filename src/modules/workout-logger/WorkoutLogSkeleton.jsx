import '../user-dashboard/view-skeletons.css';

export function WorkoutLogSkeleton() {
  return (
    <div className="workout-log workout-log--page workout-log-skeleton" aria-hidden="true" aria-busy="true">
      <div className="workout-log-skeleton__toolbar">
        <div className="view-skeleton workout-log-skeleton__tab" />
        <div className="view-skeleton workout-log-skeleton__tab" />
      </div>
      <div className="view-skeleton view-skeleton--header-title" style={{ marginBottom: 12 }} />
      <div className="view-skeleton view-skeleton--header-sub" style={{ marginBottom: 20, width: 320 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="view-skeleton view-skeleton--row" />
      ))}
    </div>
  );
}
