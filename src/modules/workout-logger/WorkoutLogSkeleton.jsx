import '../user-dashboard/view-skeletons.css';

export function WorkoutLogSkeleton() {
  return (
    <div className="workout-log workout-log--page" aria-hidden="true" aria-busy="true">
      <div className="workout-log__toolbar">
        <div className="bulk-log__mode-tabs">
          <div className="view-skeleton workout-log-skeleton__tab" />
          <div className="view-skeleton workout-log-skeleton__tab" />
        </div>
        <div className="view-skeleton workout-log-skeleton__weekbar" />
      </div>
      <div className="workout-log__content">
        <div className="workout-log-panel">
          <div className="view-skeleton workout-log-skeleton__hero" />
          <div className="view-skeleton workout-log-skeleton__bar" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="view-skeleton workout-log-skeleton__card" />
          ))}
        </div>
      </div>
    </div>
  );
}
