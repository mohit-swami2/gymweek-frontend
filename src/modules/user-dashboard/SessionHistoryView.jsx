import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, Copy, Download, Calendar, Dumbbell, ChevronRight, History, TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { ComparisonPanel } from '../workout-logger/ComparisonPanel.jsx';
import { ExportSheetModal } from '../export/ExportSheetModal.jsx';
import { Modal } from '../../common/components/Modal.jsx';
import { DatePickerField } from '../../common/components/DatePickerField.jsx';
import './session-history.css';
import './view-skeletons.css';

const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
};

export function SessionHistoryView() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', dayOfWeek: '', search: '' });
  const [exportOpen, setExportOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [useSplitPane, setUseSplitPane] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => setUseSplitPane(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50, sortBy: 'sessionDate', sortOrder: 'desc', status: 'completed' };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.dayOfWeek) params.dayOfWeek = filters.dayOfWeek;
      if (filters.search) params.search = filters.search;
      const res = await fitnessApi.getSessions(params);
      setSessions(res.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const openSession = useCallback(async (session) => {
    setSelected(session);
    if (!useSplitPane) setDetailOpen(true);
    setDetailLoading(true);
    setComparison(null);
    try {
      const res = await fitnessApi.getSessionComparison(session._id);
      setComparison(res.data[0]);
    } catch {
      toast.error('Could not load comparison');
    } finally {
      setDetailLoading(false);
    }
  }, [useSplitPane]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  useEffect(() => {
    if (!useSplitPane || loading || sessions.length === 0) return;
    if (!selected || !sessions.some((s) => s._id === selected._id)) {
      openSession(sessions[0]);
    }
  }, [useSplitPane, loading, sessions, selected, openSession]);

  const closeDetail = () => {
    setDetailOpen(false);
    setSelected(null);
    setComparison(null);
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await fitnessApi.duplicateSession(id);
      toast.success('Workout duplicated — ready to log');
      closeDetail();
      navigate('/log', { state: { bulkSession: res.data[0], mode: 'bulk' } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExportReport = async (sessionId) => {
    try {
      await fitnessApi.exportReport({ sessionId, format: 'pdf' });
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalVolume = sessions.reduce((s, x) => s + (x.totalVolume || 0), 0);

  return (
    <div className="session-history">
      <div className="session-history__top">
      <motion.header
        className="session-history__header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="session-history__header-text">
          <div className="session-history__eyebrow">
            <History size={16} /> Training archive
          </div>
          <h1>Workout History</h1>
          <p>Every logged session — planned vs actual, notes, and exports</p>
        </div>
        <button type="button" className="btn-secondary session-history__export-btn" onClick={() => setExportOpen(true)}>
          <Download size={14} /> Export Sheet
        </button>
      </motion.header>

      <motion.div
        className={`session-history__stats${loading ? ' session-history__stats--loading' : ''}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="session-history__stat session-history__stat-skeleton view-skeleton" />
            ))}
          </>
        ) : (
          <>
            <div className="session-history__stat">
              <Calendar size={18} />
              <strong>{sessions.length}</strong>
              <span>Sessions</span>
            </div>
            <div className="session-history__stat">
              <Dumbbell size={18} />
              <strong>{(totalVolume / 1000).toFixed(1)}K</strong>
              <span>Total kg</span>
            </div>
            <div className="session-history__stat">
              <TrendingUp size={18} />
              <strong>{sessions.filter((s) => s.loggingMode === 'bulk').length}</strong>
              <span>Post-gym logs</span>
            </div>
          </>
        )}
      </motion.div>

      <motion.div
        className="session-history__filters card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Filter size={14} aria-hidden />
        <DatePickerField value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} aria-label="From date" />
        <DatePickerField value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} aria-label="To date" />
        <select value={filters.dayOfWeek} onChange={(e) => setFilters({ ...filters, dayOfWeek: e.target.value })} aria-label="Day filter">
          <option value="">All days</option>
          {Object.entries(DAY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="session-history__search">
          <Search size={14} />
          <input placeholder="Search notes…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
      </motion.div>
      </div>

      <div className={`session-history__body${useSplitPane ? ' session-history__body--split' : ''}`}>
      <div className="session-history__list-wrap">
        {loading && (
          <div className="session-history__loading">
            {[0, 1, 2, 3].map((i) => (
              <motion.div key={i} className="session-history__skeleton" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }} />
            ))}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <motion.div className="session-history__empty card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <Dumbbell size={40} color="var(--color-primary)" />
            <h3>No workouts yet</h3>
            <p>Log your first session after the gym — it will appear here with full comparison data.</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/log')}>Log a Workout</button>
          </motion.div>
        )}

        {!loading && sessions.length > 0 && (
          <motion.div className="session-history__list" variants={listVariants} initial="hidden" animate="show">
            {sessions.map((s) => (
              <motion.button
                key={s._id}
                type="button"
                className={`session-history__item${selected?._id === s._id ? ' session-history__item--active' : ''}`}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => openSession(s)}
              >
                <div className="session-history__item-date">
                  {new Date(s.sessionDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="session-history__item-body">
                  <strong>{s.dayOfWeek?.charAt(0).toUpperCase() + s.dayOfWeek?.slice(1)}</strong>
                  <span>{s.totalVolume?.toLocaleString()} kg · {s.loggingMode === 'bulk' ? 'Post-gym' : 'Live'}</span>
                  {s.overallNote && <em className="session-history__item-note">{s.overallNote.slice(0, 60)}{s.overallNote.length > 60 ? '…' : ''}</em>}
                </div>
                <ChevronRight size={18} className="session-history__item-chevron" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {useSplitPane && (
        <aside className="session-history__detail">
          {!selected && (
            <div className="session-history__detail-empty">
              <Dumbbell size={40} color="var(--color-primary)" />
              <p>Select a session from the list to view full comparison</p>
            </div>
          )}
          {selected && (
            <>
              <div className="session-history__detail-header">
                <h3 className="session-history__detail-title">
                  {selected.dayOfWeek?.charAt(0).toUpperCase() + selected.dayOfWeek?.slice(1)}
                  {' · '}
                  {new Date(selected.sessionDate).toLocaleDateString(undefined, {
                    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </h3>
                {selected.overallNote && (
                  <blockquote className="session-history__modal-note">&ldquo;{selected.overallNote}&rdquo;</blockquote>
                )}
                <div className="session-history__modal-meta">
                  <span>Volume: {selected.totalVolume?.toLocaleString()} kg</span>
                  {selected.durationMinutes != null && <span>Duration: {selected.durationMinutes} min</span>}
                  <span>Mode: {selected.loggingMode === 'bulk' ? 'Post-gym log' : 'Live tracking'}</span>
                </div>
              </div>
              <div className="session-history__detail-scroll">
                {detailLoading && <p className="session-history__muted">Loading comparison…</p>}
                {!detailLoading && (
                  comparison
                    ? <ComparisonPanel comparison={comparison} embedded />
                    : <p className="session-history__muted">No comparison data</p>
                )}
              </div>
              <div className="session-history__detail-footer">
                <button type="button" className="btn-secondary" onClick={() => handleDuplicate(selected._id)}>
                  <Copy size={14} /> Duplicate workout
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleExportReport(selected._id)}>
                  <Download size={14} /> Export PDF
                </button>
              </div>
            </>
          )}
        </aside>
      )}
      </div>

      <Modal
        open={detailOpen && !useSplitPane}
        onClose={closeDetail}
        title={selected ? `${selected.dayOfWeek?.toUpperCase()} — ${new Date(selected.sessionDate).toLocaleDateString()}` : 'Session'}
        size="lg"
        scrollBody
        footer={selected && (
          <>
            <button type="button" className="btn-secondary" onClick={() => handleDuplicate(selected._id)}>
              <Copy size={14} /> Duplicate
            </button>
            <button type="button" className="btn-secondary" onClick={() => handleExportReport(selected._id)}>
              <Download size={14} /> PDF Report
            </button>
            <button type="button" className="btn-primary" onClick={closeDetail}>Close</button>
          </>
        )}
      >
        {detailLoading && <p className="session-history__muted">Loading comparison…</p>}
        {!detailLoading && selected && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {selected.overallNote && (
              <blockquote className="session-history__modal-note">&ldquo;{selected.overallNote}&rdquo;</blockquote>
            )}
            <div className="session-history__modal-meta">
              <span>Volume: {selected.totalVolume?.toLocaleString()} kg</span>
              {selected.durationMinutes != null && <span>Duration: {selected.durationMinutes} min</span>}
              <span>Mode: {selected.loggingMode === 'bulk' ? 'Post-gym log' : 'Live tracking'}</span>
            </div>
            {comparison ? <ComparisonPanel comparison={comparison} /> : <p className="session-history__muted">No comparison data</p>}
          </motion.div>
        )}
      </Modal>

      <ExportSheetModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
