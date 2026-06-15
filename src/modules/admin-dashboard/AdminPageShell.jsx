import { Pagination } from '../../common/components/Pagination.jsx';
import { AdminTableSkeleton } from './AdminSkeleton.jsx';

export function AdminPageShell({
  title,
  actions,
  filters,
  loading,
  meta,
  onPageChange,
  children,
  bodyClassName = '',
}) {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">{title}</h1>
        {actions}
      </div>

      {filters && <div className="admin-page__filters">{filters}</div>}

      <div className={`admin-page__body ${bodyClassName}`.trim()}>
        {loading ? (
          <AdminTableSkeleton />
        ) : (
          <>
            <div className="admin-page__table-scroll">{children}</div>
            <Pagination meta={meta} onPageChange={onPageChange} />
          </>
        )}
      </div>
    </div>
  );
}
