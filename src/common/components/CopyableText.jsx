import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function CopyableText({ value, className = '' }) {
  if (!value) return '—';

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(value)).then(
      () => toast.success('Copied to clipboard'),
      () => toast.error('Could not copy')
    );
  };

  return (
    <span className={`copyable-text ${className}`.trim()}>
      <span className="copyable-text__value">{value}</span>
      <button type="button" className="copyable-text__btn" onClick={handleCopy} title="Copy">
        <Copy size={12} />
      </button>
    </span>
  );
}
