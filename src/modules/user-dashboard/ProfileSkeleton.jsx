import './view-skeletons.css';

export function ProfileSkeleton() {
  return (
    <div className="profile-skeleton profile-page" aria-hidden="true" aria-busy="true">
      <div className="view-skeleton view-skeleton--header-title" style={{ marginBottom: 24 }} />
      <div className="card">
        <div className="profile-skeleton__hero">
          <div className="view-skeleton view-skeleton--avatar" />
          <div style={{ flex: 1 }}>
            <div className="view-skeleton view-skeleton--header-sub" style={{ width: 180, marginBottom: 8 }} />
            <div className="view-skeleton view-skeleton--header-sub" style={{ width: 240 }} />
          </div>
        </div>
        <div className="profile-skeleton__stats">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="view-skeleton view-skeleton--stat" style={{ height: 72 }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="view-skeleton view-skeleton--field" />
        ))}
      </div>
    </div>
  );
}
