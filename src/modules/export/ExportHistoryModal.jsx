import { useEffect, useMemo, useState } from 'react';
import { Download, X, CalendarRange, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../common/components/Modal.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { getMondayOfWeek, toLocalDateString, formatWeekRange } from '../../common/utils/dateUtils.js';
import './export.css';

export function ExportHistoryModal({ open, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);
  const [theme, setTheme] = useState('minimal');
  const [selected, setSelected] = useState(() => new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fitnessApi.getExportThemes().then((res) => setThemes(res.data || [])).catch(() => {});
    fitnessApi.getSessions({ status: 'completed', limit: 200, sortBy: 'sessionDate', sortOrder: 'desc' })
      .then((res) => setSessions(res.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  const weeks = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const start = getMondayOfWeek(new Date(s.sessionDate));
      const key = toLocalDateString(start);
      if (!map.has(key)) map.set(key, { key, start, count: 0, volume: 0 });
      const w = map.get(key);
      w.count += 1;
      w.volume += s.totalVolume || 0;
    }
    return [...map.values()].sort((a, b) => b.start - a.start);
  }, [sessions]);

  // Default-select every week once they load.
  useEffect(() => {
    if (weeks.length) setSelected(new Set(weeks.map((w) => w.key)));
  }, [weeks]);

  const allSelected = weeks.length > 0 && selected.size === weeks.length;

  const toggleWeek = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(weeks.map((w) => w.key)));
  };

  const handleDownload = async () => {
    if (!selected.size) { toast.error('Select at least one week'); return; }
    setDownloading(true);
    try {
      await fitnessApi.exportReport({
        weeks: [...selected].join(','),
        theme,
        format: 'pdf',
        filename: 'gymweek-history.pdf',
      });
      toast.success('History exported');
      onClose?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const totalSelectedSessions = weeks
    .filter((w) => selected.has(w.key))
    .reduce((sum, w) => sum + w.count, 0);

  return (
    <Modal open={open} onClose={onClose} title="Export Workout History" scrollBody>
      <div className="export-modal">
        <p className="export-modal__hint">
          Choose which weeks to include — the export combines all selected weeks into one PDF.
        </p>

        {loading ? (
          <div className="export-history__loading">Loading your history…</div>
        ) : weeks.length === 0 ? (
          <div className="export-history__empty">
            <CalendarRange size={32} />
            <p>No logged sessions yet to export.</p>
          </div>
        ) : (
          <>
            <button type="button" className="export-history__select-all" onClick={toggleAll}>
              {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              {allSelected ? 'Clear all' : 'Select all'}
              <span>{totalSelectedSessions} session{totalSelectedSessions === 1 ? '' : 's'} selected</span>
            </button>

            <div className="export-history__weeks">
              {weeks.map((w) => {
                const isOn = selected.has(w.key);
                return (
                  <button
                    key={w.key}
                    type="button"
                    className={`export-history__week${isOn ? ' export-history__week--on' : ''}`}
                    onClick={() => toggleWeek(w.key)}
                  >
                    <span className="export-history__week-check">
                      {isOn ? <CheckSquare size={16} /> : <Square size={16} />}
                    </span>
                    <span className="export-history__week-info">
                      <strong>{formatWeekRange(w.start)}</strong>
                      <span>{w.count} session{w.count === 1 ? '' : 's'} · {w.volume.toLocaleString()} kg</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="export-modal__row">
              <label>Design theme</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                {(themes.length ? themes : [{ slug: 'minimal', name: 'Minimal' }]).map((t) => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="export-modal__actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            disabled={downloading || loading || selected.size === 0}
          >
            <Download size={14} /> {downloading ? 'Generating…' : 'Download PDF'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}><X size={14} /> Close</button>
        </div>
      </div>
    </Modal>
  );
}
