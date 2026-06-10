import { StatusBadge } from './StatusBadge.jsx';

export function DataTable({ columns, data, onRowClick, emptyMessage = 'No records found' }) {
  if (!data?.length) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{emptyMessage}</div>;
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'var(--color-secondary)' }}>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default', borderBottom: '1px solid var(--color-border)' }}
              onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = 'var(--color-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '12px 16px' }}>
                  {col.key === 'status' && !col.render ? <StatusBadge status={row.status} /> : col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
