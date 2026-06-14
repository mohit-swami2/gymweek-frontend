export function PlannerSkeleton() {
  return (
    <div className="planner planner-skeleton" aria-hidden="true" aria-busy="true">
      <div className="planner-skeleton__header">
        <div className="planner-skeleton__bar planner-skeleton__bar--title" />
        <div className="planner-skeleton__bar planner-skeleton__bar--btn" />
      </div>
      <div className="planner-skeleton__card card">
        <div className="planner-skeleton__bar planner-skeleton__bar--subtitle" />
        <div className="planner-skeleton__table">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="planner-skeleton__row">
              <div className="planner-skeleton__cell" />
              <div className="planner-skeleton__cell planner-skeleton__cell--sm" />
              <div className="planner-skeleton__cell planner-skeleton__cell--sm" />
              <div className="planner-skeleton__cell planner-skeleton__cell--xs" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
