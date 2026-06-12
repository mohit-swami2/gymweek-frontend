export function Pagination({ meta, onPageChange }) {
  if (meta?.total == null) return null;

  const page = meta.page || 1;
  const totalPages = meta.totalPages || 1;
  const showNav = totalPages > 1;

  return (
    <div className="admin-pagination">
      <span>
        {meta.total} record{meta.total === 1 ? '' : 's'}
        {showNav ? ` · Page ${page} of ${totalPages}` : ''}
      </span>
      {showNav && (
        <div className="admin-pagination__nav">
          <button type="button" className="btn-icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</button>
          <button type="button" className="btn-icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
