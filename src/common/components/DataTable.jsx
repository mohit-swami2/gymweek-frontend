import { StatusBadge } from './StatusBadge.jsx';

export function DataTable({ columns, data, onRowClick, emptyMessage = 'No records found', compact = false }) {
  if (!data?.length) {
    return <div className="data-table-empty">{emptyMessage}</div>;
  }

  return (
    <div className={`data-table-wrap${compact ? ' data-table-wrap--compact' : ''}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'data-table__row--clickable' : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>
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
