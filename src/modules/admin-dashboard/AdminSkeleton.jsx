export function AdminDashboardSkeleton() {
  return (
    <div className="admin-dashboard admin-dashboard--skeleton" aria-hidden="true" aria-busy="true">
      <div className="admin-dashboard__head">
        <div>
          <div className="admin-skeleton admin-skeleton--title" />
          <div className="admin-skeleton admin-skeleton--subtitle" />
        </div>
        <div className="admin-skeleton admin-skeleton--btn" />
      </div>

      <div className="admin-dashboard__stats">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="card admin-skeleton admin-skeleton--stat" />
        ))}
      </div>

      <div className="admin-dashboard__highlights card">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="admin-skeleton admin-skeleton--highlight" />
        ))}
      </div>

      <div className="admin-dashboard__charts">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card admin-skeleton admin-skeleton--chart" />
        ))}
      </div>

      <div className="admin-dashboard__tables">
        <div className="card admin-skeleton admin-skeleton--table" />
        <div className="card admin-skeleton admin-skeleton--table" />
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 8 }) {
  return (
    <div className="admin-table-skeleton" aria-hidden="true" aria-busy="true">
      <div className="admin-table-skeleton__toolbar">
        <div className="admin-skeleton admin-skeleton--filter" />
        <div className="admin-skeleton admin-skeleton--filter" />
        <div className="admin-skeleton admin-skeleton--filter admin-skeleton--filter-wide" />
      </div>
      <div className="admin-table-skeleton__head">
        <div className="admin-skeleton admin-skeleton--th" />
        <div className="admin-skeleton admin-skeleton--th" />
        <div className="admin-skeleton admin-skeleton--th" />
        <div className="admin-skeleton admin-skeleton--th admin-skeleton--th-sm" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="admin-table-skeleton__row">
          <div className="admin-skeleton admin-skeleton--td" />
          <div className="admin-skeleton admin-skeleton--td admin-skeleton--td-sm" />
          <div className="admin-skeleton admin-skeleton--td admin-skeleton--td-sm" />
          <div className="admin-skeleton admin-skeleton--td admin-skeleton--td-xs" />
        </div>
      ))}
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="admin-shell admin-shell--skeleton" aria-hidden="true" aria-busy="true">
      <aside className="admin-sidebar">
        <div className="admin-skeleton admin-skeleton--logo" />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="admin-skeleton admin-skeleton--nav" />
        ))}
      </aside>
      <main className="admin-main">
        <AdminDashboardSkeleton />
      </main>
    </div>
  );
}
