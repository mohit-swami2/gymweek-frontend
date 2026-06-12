export function LandingSkeleton() {
  return (
    <div className="gw-skeleton-page" aria-hidden="true" aria-busy="true">
      <div className="gw-container">
        <div className="gw-skeleton-hero">
          <div className="gw-skeleton gw-skeleton--badge" />

          <div className="gw-skeleton-hero__grid">
            <div className="gw-skeleton-hero__side">
              <div className="gw-skeleton gw-skeleton--dash" />
              <div className="gw-skeleton gw-skeleton--equipment" />
            </div>
            <div className="gw-skeleton-hero__center">
              <div className="gw-skeleton gw-skeleton--title" />
              <div className="gw-skeleton gw-skeleton--subtitle" />
              <div className="gw-skeleton gw-skeleton--subtitle gw-skeleton--subtitle-short" />
              <div className="gw-skeleton-hero__cta">
                <div className="gw-skeleton gw-skeleton--cta" />
                <div className="gw-skeleton gw-skeleton--cta gw-skeleton--cta-ghost" />
              </div>
            </div>
            <div className="gw-skeleton-hero__side">
              <div className="gw-skeleton gw-skeleton--dash" />
              <div className="gw-skeleton gw-skeleton--equipment" />
            </div>
          </div>

          <div className="gw-skeleton-hero__stats">
            <div className="gw-skeleton gw-skeleton--stat" />
            <div className="gw-skeleton gw-skeleton--stat" />
            <div className="gw-skeleton gw-skeleton--stat" />
          </div>
        </div>

        <div className="gw-skeleton-section">
          <div className="gw-skeleton gw-skeleton--section-title" />
          <div className="gw-skeleton gw-skeleton--section-sub" />
          <div className="gw-skeleton-features">
            <div className="gw-skeleton gw-skeleton--feature" />
            <div className="gw-skeleton gw-skeleton--feature" />
            <div className="gw-skeleton gw-skeleton--feature" />
          </div>
        </div>

        <div className="gw-skeleton-section gw-skeleton-section--compact">
          <div className="gw-skeleton gw-skeleton--testimonial-title" />
          <div className="gw-skeleton gw-skeleton--testimonial" />
        </div>
      </div>
    </div>
  );
}
