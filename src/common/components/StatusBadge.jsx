const STATUS_LABELS = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
  pending: 'Pending',
  in_progress: 'In Progress',
  fulfilled: 'Fulfilled',
  active: 'Active',
  restricted: 'Restricted',
  inactive: 'Inactive',
};

export function StatusBadge({ status }) {
  const key = (status || 'draft').toLowerCase().replace(' ', '_');
  const cls = `badge badge-${key}`;
  return <span className={cls}>{STATUS_LABELS[key] || status}</span>;
}
