export function Pagination({ meta, onPageChange }) {
  if (!meta?.totalPages || meta.totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
      <span>{meta.total} records · Page {meta.page} of {meta.totalPages}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" className="btn-icon" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>Prev</button>
        <button type="button" className="btn-icon" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>Next</button>
      </div>
    </div>
  );
}
