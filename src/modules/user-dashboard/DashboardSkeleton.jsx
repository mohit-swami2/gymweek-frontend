import './view-skeletons.css';

export function DashboardSkeleton() {
  return (
    <div className="dashboard-page dashboard-skeleton" aria-hidden="true" aria-busy="true">
      <div className="dashboard-skeleton__header">
        <div className="view-skeleton view-skeleton--header-title" />
        <div className="view-skeleton view-skeleton--header-sub" />
      </div>
      <div className="view-skeleton view-skeleton--card" style={{ marginBottom: 20, height: 140 }} />
      <div className="dashboard-skeleton__stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="view-skeleton view-skeleton--stat" />
        ))}
      </div>
      <div className="dashboard-skeleton__charts">
        <div className="view-skeleton view-skeleton--chart" />
        <div className="view-skeleton view-skeleton--chart" />
      </div>
      <div className="view-skeleton view-skeleton--card" />
    </div>
  );
}
