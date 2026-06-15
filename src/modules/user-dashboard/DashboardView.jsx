import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Timer, Play, CheckCircle2, Circle, Zap, AlertTriangle, ClipboardList, Download, Dumbbell, TrendingUp, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { ChartCard } from '../../common/components/ChartCard.jsx';
import { CelebrationModal } from '../../common/components/CelebrationModal.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getSplitLabel } from '../planner/splitTemplates.js';
import { STREAK_MEDALS, getCurrentMedal, getNextMedal } from '../planner/streakMedals.js';
import { StreakMedalBadge } from '../planner/StreakMedalBadge.jsx';
import { StreakAwardModal } from '../planner/StreakAwardModal.jsx';
import { ExportSheetModal } from '../export/ExportSheetModal.jsx';
import { SelectWeekModal } from '../workout-logger/SelectWeekModal.jsx';
import { DashboardSkeleton } from './DashboardSkeleton.jsx';
import '../planner/streak-award-modal.css';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function sessionInPlanWeek(session, weekStart) {
  if (!weekStart) return false;
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const d = new Date(session.sessionDate);
  return d >= start && d < end;
}

export function DashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [plan, setPlan] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  const [volumeData, setVolumeData] = useState([]);
  const [todaySession, setTodaySession] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInModal, setCheckInModal] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkDraft, setBulkDraft] = useState(null);
  const [weekModalOpen, setWeekModalOpen] = useState(false);
  const [weekModalMode, setWeekModalMode] = useState('bulk');
  const [selectedMedal, setSelectedMedal] = useState(null);

  const loadData = () => Promise.all([
    fitnessApi.getSummary(),
    fitnessApi.getCurrentPlan(),
    fitnessApi.getVolumeProgress({ range: '4w', groupBy: 'week' }),
    fitnessApi.getTodaySession(),
    fitnessApi.getTodaySessionSummary(),
    fitnessApi.getStreak(),
    fitnessApi.getAdherence({ range: '4w' }),
    fitnessApi.getSessions({ limit: 5, sortBy: 'sessionDate', sortOrder: 'desc', status: 'completed' }),
    fitnessApi.getPRs({ limit: 4 }),
  ]).then(([sumRes, planRes, volRes, sessionRes, summaryRes, streakRes, adhRes, recentRes, prRes]) => {
    setSummary(sumRes.data[0]);
    setPlan(planRes.data[0]);
    setVolumeData(volRes.data[0]?.data || []);
    setTodaySession(sessionRes.data[0] || null);
    setSessionSummary(summaryRes.data[0] || null);
    setStreakInfo(streakRes.data[0]);
    setAdherence(adhRes.data[0]);
    setRecentSessions(recentRes.data || []);
    setPrs(prRes.data[0]?.prs || []);
    setBulkDraft(summaryRes.data[0]?.bulkDraft || null);
  });

  useEffect(() => {
    loadData()
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await fitnessApi.checkIn({});
      const data = res.data[0];
      if (data?.streakMessage === 'Already checked in today') {
        toast.info('You already checked in today!');
        return;
      }
      await loadData();
      setCheckInModal({
        title: data?.streakReset ? 'Fresh Start!' : 'Checked In!',
        subtitle: data?.streakMessage,
        streak: data?.currentStreak,
        quote: data?.motivationalQuote?.text,
        quoteAuthor: data?.motivationalQuote?.author,
        warning: data?.streakWarning,
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogWorkout = () => {
    if (bulkDraft) {
      navigate('/log', { state: { bulkSession: bulkDraft, mode: 'bulk' } });
      return;
    }
    setWeekModalMode('bulk');
    setWeekModalOpen(true);
  };

  const handleStartWorkout = () => {
    if (todaySession?.status === 'inProgress') {
      navigate('/log', { state: { session: todaySession, mode: 'live' } });
      return;
    }
    setWeekModalMode('live');
    setWeekModalOpen(true);
  };

  const handleWeekConfirm = async ({ plan, dayOfWeek, sessionDate }) => {
    setWeekModalOpen(false);
    try {
      if (weekModalMode === 'live') {
        const res = await fitnessApi.startSession({ planId: plan._id, dayOfWeek, sessionDate });
        await loadData();
        navigate('/log', { state: { session: res.data[0], mode: 'live', plan } });
        return;
      }
      const res = await fitnessApi.prepareSession({ planId: plan._id, dayOfWeek, sessionDate });
      const loaded = res.data[0];
      if (loaded?.status === 'completed') {
        toast.info('Opening your logged workout for editing');
      }
      navigate('/log', { state: { bulkSession: loaded, mode: 'bulk' } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const currentStreak = streakInfo?.currentStreak ?? summary?.currentStreak ?? 0;
  const currentMedal = getCurrentMedal(currentStreak);
  const nextMedal = getNextMedal(currentStreak);

  const todayKey = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayCompleted = sessionSummary?.sessions?.find(
    (s) => s.status === 'completed' && s.dayOfWeek === todayKey,
  );

  const weekData = DAY_KEYS.map((key, i) => {
    const day = plan?.days?.find((d) => d.dayOfWeek === key);
    const completed = recentSessions.some(
      (s) => s.dayOfWeek === key && sessionInPlanWeek(s, plan?.weekStart),
    );
    return {
      day: DAY_LABELS[i],
      completed,
      rest: day?.isRestDay,
      today: new Date().getDay() === (i === 6 ? 0 : i + 1),
      focus: day?.focus,
    };
  });

  const todayPlan = plan?.days?.find((d) => d.dayOfWeek === todayKey);

  const statCards = [
    { label: 'WORKOUTS THIS WEEK', value: String(summary?.thisWeek?.count || 0), sub: 'sessions', icon: Flame },
    { label: 'TOTAL VOLUME', value: `${((summary?.thisWeek?.volume || 0) / 1000).toFixed(1)}K`, sub: 'kg this week', icon: Trophy },
    { label: 'ADHERENCE', value: `${adherence?.avgAdherenceScore ?? '—'}`, sub: '4-week score', icon: Timer },
    { label: 'COMPLETION', value: `${adherence?.avgCompletionPercent ?? '—'}%`, sub: 'avg per workout', icon: CheckCircle2 },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'GOOD MORNING';
    if (h < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div className="dashboard-page">
      {streakInfo?.streakWarning && !streakInfo?.checkedInToday && (
        <div className={`streak-warning streak-warning--${streakInfo.streakWarning.type}`}>
          <AlertTriangle size={18} />
          <div>
            <strong>{streakInfo.streakWillReset ? 'Streak at risk — will reset!' : 'Streak warning'}</strong>
            <p>{streakInfo.streakWarning.message}</p>
          </div>
          <button type="button" className="btn-primary" onClick={handleCheckIn} style={{ flexShrink: 0 }}>
            Check In Now
          </button>
        </div>
      )}

      <div className="dashboard-page__header">
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.2rem', letterSpacing: '0.02em', lineHeight: 1 }}>
            {greeting()}, {user?.name?.split(' ')[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {plan?.splitType ? `${getSplitLabel(plan.splitType)} · ` : ''}
            {todayPlan?.isRestDay ? 'Rest day' : (todayPlan?.focus || 'Set up your split in Planner')}
            {' · '}{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="dashboard-page__actions">
          <button type="button" className="btn-secondary" onClick={() => setExportOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Sheet
          </button>
          <button type="button" className="btn-secondary" onClick={handleCheckIn} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> Check In
          </button>
          <button type="button" onClick={handleLogWorkout} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            borderRadius: '8px', border: 'none', background: 'var(--color-primary)',
            color: '#080808', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          }}>
            <ClipboardList size={14} />
            {bulkDraft ? 'CONTINUE LOG' : 'LOG WORKOUT'}
          </button>
          {!todayCompleted && (
            <button type="button" className="btn-secondary" onClick={handleStartWorkout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Play size={14} /> Live
            </button>
          )}
        </div>
      </div>

      {todayCompleted && (
        <div className="card dashboard-today-done">
          <CheckCircle2 size={20} color="var(--color-primary)" />
          <div>
            <strong>Today&apos;s workout logged</strong>
            <p>{todayCompleted.totalVolume?.toLocaleString()} kg · {todayCompleted.loggingMode === 'bulk' ? 'Post-gym log' : 'Live session'}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => navigate('/history')}>
            <History size={14} /> History
          </button>
        </div>
      )}

      <div className="card medals-section">
        <div className="medals-section__head">
          <div>
            <h3>Streak Awards</h3>
            <span className="medals-section__streak">{currentStreak} day streak · {currentMedal.name}</span>
          </div>
          <button
            type="button"
            className="medals-section__current"
            onClick={() => setSelectedMedal({ medal: currentMedal, earned: currentStreak >= currentMedal.min, isCurrent: true })}
            aria-label={`View ${currentMedal.name} award`}
          >
            <StreakMedalBadge tier={currentMedal.tier} earned size="sm" active />
          </button>
        </div>
        <div className="medals-section__grid">
          {STREAK_MEDALS.filter((m) => m.min > 0).map((medal, i) => {
            const earned = currentStreak >= medal.min;
            const isCurrent = currentMedal.min === medal.min;
            return (
              <motion.button
                key={medal.min}
                type="button"
                className={`medal-card medal-card--${medal.tier}${earned ? ' medal-card--earned' : ''}${isCurrent ? ' medal-card--active' : ''}`}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: earned ? -8 : -4, scale: earned ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: i * 0.07, duration: 0.45, type: 'spring', stiffness: 260 }}
                onClick={() => setSelectedMedal({ medal, earned, isCurrent })}
              >
                {earned && <span className="medal-card__ring" aria-hidden />}
                {earned && <span className="medal-card__shimmer" aria-hidden />}
                <motion.div
                  animate={isCurrent ? { y: [0, -4, 0] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <StreakMedalBadge tier={medal.tier} earned={earned} active={isCurrent} size="md" />
                </motion.div>
                <strong className="medal-card__name">{medal.name}</strong>
                <span className="medal-card__days">{medal.min}+ days</span>
                {isCurrent && <span className="medal-card__badge">Current</span>}
                {!earned && <span className="medal-card__locked">Tap to preview</span>}
              </motion.button>
            );
          })}
        </div>
        {nextMedal && (
          <p className="medals-section__next">
            <span className="medals-section__next-bar">
              <span
                className="medals-section__next-fill"
                style={{ width: `${Math.min(100, (currentStreak / nextMedal.min) * 100)}%` }}
              />
            </span>
            {nextMedal.min - currentStreak} more day{nextMedal.min - currentStreak === 1 ? '' : 's'} to unlock{' '}
            <strong>{nextMedal.name}</strong>
          </p>
        )}
      </div>

      <div className="dashboard-stats">
        {statCards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '8px' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{sub}</div>
            <Icon size={20} color="var(--color-accent)" style={{ marginTop: '12px' }} />
          </div>
        ))}
      </div>

      <div className="dashboard-detail-grid">
        <div className="card dashboard-insight">
          <h3 className="dashboard-section-title"><TrendingUp size={16} /> Training snapshot</h3>
          <ul className="dashboard-insight__list">
            <li><span>All-time workouts</span><strong>{summary?.totalWorkouts ?? 0}</strong></li>
            <li><span>Lifetime volume</span><strong>{((summary?.totalVolume ?? 0) / 1000).toFixed(1)}K kg</strong></li>
            <li><span>Personal records</span><strong>{summary?.prCount ?? 0}</strong></li>
            <li><span>Week-over-week</span><strong>{summary?.improvementPercent >= 0 ? '+' : ''}{summary?.improvementPercent ?? 0}%</strong></li>
          </ul>
        </div>

        <div className="card dashboard-recent">
          <h3 className="dashboard-section-title"><History size={16} /> Recent sessions</h3>
          {recentSessions.length === 0 ? (
            <p className="dashboard-recent__empty">No sessions yet — log your first workout.</p>
          ) : (
            <ul className="dashboard-recent__list">
              {recentSessions.map((s) => (
                <li key={s._id}>
                  <span>{new Date(s.sessionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span>{s.dayOfWeek?.slice(0, 3)}</span>
                  <strong>{s.totalVolume?.toLocaleString()} kg</strong>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn-secondary dashboard-recent__more" onClick={() => navigate('/history')}>View all</button>
        </div>

        {prs.length > 0 && (
          <div className="card dashboard-prs">
            <h3 className="dashboard-section-title"><Trophy size={16} /> Latest PRs</h3>
            <ul className="dashboard-prs__list">
              {prs.map((pr) => (
                <li key={pr._id}>
                  <Dumbbell size={14} />
                  <span>{pr.exerciseId?.name}</span>
                  <strong>{pr.maxWeight} kg</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="dashboard-charts">
        <ChartCard title="Volume Trend" subtitle="Last 4 weeks">
          <AreaChart data={volumeData}>
            <XAxis dataKey="periodLabel" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
            <Area type="monotone" dataKey="totalVolume" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
          </AreaChart>
        </ChartCard>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700 }}>This Week</div>
            {plan?.splitType && (
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '999px', background: 'rgba(200,255,0,0.1)', color: 'var(--color-primary)' }}>
                {getSplitLabel(plan.splitType)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {weekData.map((d) => (
              <div key={d.day} style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{d.day}</div>
                <div style={{
                  height: '52px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: d.completed ? 'var(--color-primary)' : d.rest ? 'transparent' : 'var(--color-background)',
                  border: d.today ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  opacity: d.rest ? 0.4 : 1,
                  marginBottom: '6px',
                }}>
                  {d.completed ? <CheckCircle2 size={16} color="#080808" /> : d.rest ? '—' : <Circle size={14} color="var(--color-text-muted)" />}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.focus}>
                  {d.rest ? 'Rest' : (d.focus || '—')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {todayPlan && !todayPlan.isRestDay && todayPlan.plannedExercises?.length > 0 && (
        <div className="card">
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.4rem', marginBottom: '16px' }}>
            {todayPlan.focus || 'TODAY\'S WORKOUT'}
          </div>
          {todayPlan.plannedExercises.map((pe) => (
            <div key={pe.exerciseId?._id || pe.exerciseId} style={{
              display: 'flex', justifyContent: 'space-between', padding: '12px 0',
              borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem',
            }}>
              <span>{pe.exerciseId?.name || 'Exercise'}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                {pe.sets?.length} sets · {pe.sets?.[0]?.targetWeight || 0} kg
              </span>
            </div>
          ))}
        </div>
      )}

      <StreakAwardModal
        open={!!selectedMedal}
        onClose={() => setSelectedMedal(null)}
        medal={selectedMedal?.medal}
        earned={selectedMedal?.earned}
        isCurrent={selectedMedal?.isCurrent}
        currentStreak={currentStreak}
      />

      <ExportSheetModal open={exportOpen} onClose={() => setExportOpen(false)} planId={plan?._id} />

      <SelectWeekModal
        open={weekModalOpen}
        onClose={() => setWeekModalOpen(false)}
        onConfirm={handleWeekConfirm}
        title={weekModalMode === 'live' ? 'Start live session' : 'Log workout progress'}
        confirmLabel={weekModalMode === 'live' ? 'Start session' : 'Load workout'}
      />

      <CelebrationModal
        open={!!checkInModal}
        onClose={() => setCheckInModal(null)}
        title={checkInModal?.title}
        subtitle={checkInModal?.subtitle}
        streak={checkInModal?.streak}
        quote={checkInModal?.quote}
        quoteAuthor={checkInModal?.quoteAuthor}
        primaryLabel="Let's Go!"
        primaryAction={() => setCheckInModal(null)}
      />
    </div>
  );
}
