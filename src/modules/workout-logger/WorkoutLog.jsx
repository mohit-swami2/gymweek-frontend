import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Dumbbell, ArrowRight, ClipboardList, Timer, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { formatWeekRange, isCurrentWeek } from '../../common/utils/dateUtils.js';
import { BulkWorkoutLog } from './BulkWorkoutLog.jsx';
import { LiveWorkoutLog } from './LiveWorkoutLog.jsx';
import { SelectWeekModal } from './SelectWeekModal.jsx';
import { filterConfiguredPlans, hasConfiguredPlan } from './planUtils.js';
import { WorkoutLogSkeleton } from './WorkoutLogSkeleton.jsx';
import './bulk-log.css';
import './workout-log.css';

export function WorkoutLog() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = location.state?.mode || 'bulk';
  const [mode, setMode] = useState(initialMode);
  const [configuredPlans, setConfiguredPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [bulkSession, setBulkSession] = useState(location.state?.bulkSession || null);
  const [preparing, setPreparing] = useState(false);
  const [weekModalOpen, setWeekModalOpen] = useState(false);
  const [weekModalMode, setWeekModalMode] = useState('bulk');

  useEffect(() => {
    fitnessApi.getPlans()
      .then((res) => {
        const configured = filterConfiguredPlans(res.data || []);
        setConfiguredPlans(configured);
        const current = configured.find((p) => isCurrentWeek(p.weekStart));
        setSelectedPlan(current || configured[0] || null);
      })
      .catch(() => {
        setConfiguredPlans([]);
        setSelectedPlan(null);
      })
      .finally(() => setPlanLoading(false));
  }, []);

  // Re-sync when navigated here again with fresh state (e.g. from dashboard
  // "Log workout" after already mounting the log screen).
  useEffect(() => {
    if (location.state?.bulkSession) {
      setBulkSession(location.state.bulkSession);
      setMode(location.state.mode || 'bulk');
    } else if (location.state?.session) {
      setMode('live');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (mode !== 'bulk' || bulkSession || location.state?.bulkSession) return;
    fitnessApi.getTodayBulkSession()
      .then((res) => { if (res.data[0]) setBulkSession(res.data[0]); })
      .catch(() => {});
  }, [mode, bulkSession, location.state?.bulkSession]);

  const openWeekModal = (forMode = 'bulk') => {
    setWeekModalMode(forMode);
    setWeekModalOpen(true);
  };

  const handleWeekConfirm = async ({ plan, dayOfWeek, sessionDate }) => {
    setSelectedPlan(plan);
    setWeekModalOpen(false);

    if (weekModalMode === 'live') {
      setPreparing(true);
      try {
        const res = await fitnessApi.startSession({ planId: plan._id, dayOfWeek, sessionDate });
        setMode('live');
        navigate('.', { state: { session: res.data[0], mode: 'live', plan }, replace: true });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setPreparing(false);
      }
      return;
    }

    setPreparing(true);
    try {
      const res = await fitnessApi.prepareSession({ planId: plan._id, dayOfWeek, sessionDate });
      const loaded = res.data[0];
      if (loaded?.status === 'completed') {
        toast.info('Opening your logged workout for editing');
      }
      setBulkSession(loaded);
      setMode('bulk');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPreparing(false);
    }
  };

  if (planLoading || preparing) {
    return <WorkoutLogSkeleton />;
  }

  if (!configuredPlans.length) {
    return (
      <div className="workout-log workout-log--page">
        <div className="workout-log__content">
          <div className="workout-log-panel">
            <div className="workout-log__empty card workout-log__empty--plan">
              <CalendarDays size={48} color="var(--color-primary)" />
              <h2>No workout plan yet</h2>
              <p>Build your weekly split in the planner, download a sheet, hit the gym offline, then log here.</p>
              <div className="workout-log__empty-actions">
                <button type="button" className="btn-primary" onClick={() => navigate('/planner')}>
                  Create Weekly Plan <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-log workout-log--page">
      <div className="workout-log__toolbar">
        <div className="bulk-log__mode-tabs">
          <button
            type="button"
            className={`bulk-log__mode-tab${mode === 'bulk' ? ' bulk-log__mode-tab--active' : ''}`}
            onClick={() => setMode('bulk')}
          >
            <ClipboardList size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Log After Gym
          </button>
          <button
            type="button"
            className={`bulk-log__mode-tab${mode === 'live' ? ' bulk-log__mode-tab--active' : ''}`}
            onClick={() => setMode('live')}
          >
            <Timer size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Live Tracking
          </button>
        </div>

        {selectedPlan && hasConfiguredPlan(selectedPlan) && (
          <div  className="workout-log__week-bar">
            <CalendarRange size={14} />
            <span>{selectedPlan.weekLabel || formatWeekRange(selectedPlan.weekStart)}</span>
            <button type="button" className="workout-log__week-change" onClick={() => openWeekModal(mode)}>
              Change week
            </button>
          </div>
        )}
      </div>

      <div className="workout-log__content">
        {mode === 'live' ? (
          <LiveWorkoutLog
            plan={selectedPlan}
            onRequestWeekSelect={() => openWeekModal('live')}
          />
        ) : bulkSession ? (
          <BulkWorkoutLog session={bulkSession} onSessionChange={setBulkSession} />
        ) : (
          <div className="workout-log-panel">
            <div className="workout-log__empty card workout-log__empty--session">
              <Dumbbell class='make-it-mid' size={48} color="var(--color-primary)" />
              <h2 style={{textAlign: 'center'}}>Log after gym</h2>
              <p style={{textAlign: 'center'}} >Choose a configured week and workout day, then record what you actually did.</p>
              <div className="workout-log__empty-actions">
                <button type="button" className="btn-primary" onClick={() => openWeekModal('bulk')} disabled={preparing}>
                  {preparing ? 'Loading plan…' : 'Select Week & Day'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SelectWeekModal
        open={weekModalOpen}
        onClose={() => setWeekModalOpen(false)}
        onConfirm={handleWeekConfirm}
        title={weekModalMode === 'live' ? 'Start live session' : 'Log workout progress'}
        confirmLabel={weekModalMode === 'live' ? 'Start session' : 'Load workout'}
      />
    </div>
  );
}

export { DAY_KEYS, dayKeyForDate } from './BulkWorkoutLog.jsx';
