import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Timer, Play, CheckCircle2, Circle, Zap, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { ChartCard } from '../../common/components/ChartCard.jsx';
import { CelebrationModal } from '../../common/components/CelebrationModal.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { getSplitLabel } from '../planner/splitTemplates.js';
import { STREAK_MEDALS, getCurrentMedal, getNextMedal } from '../planner/streakMedals.js';
import { StreakMedalBadge } from '../planner/StreakMedalBadge.jsx';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function DashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [plan, setPlan] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  const [volumeData, setVolumeData] = useState([]);
  const [todaySession, setTodaySession] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInModal, setCheckInModal] = useState(null);

  const loadData = () => Promise.all([
    fitnessApi.getSummary(),
    fitnessApi.getCurrentPlan(),
    fitnessApi.getVolumeProgress({ range: '4w', groupBy: 'week' }),
    fitnessApi.getTodaySession(),
    fitnessApi.getTodaySessionSummary(),
    fitnessApi.getStreak(),
  ]).then(([sumRes, planRes, volRes, sessionRes, summaryRes, streakRes]) => {
    setSummary(sumRes.data[0]);
    setPlan(planRes.data[0]);
    setVolumeData(volRes.data[0]?.data || []);
    setTodaySession(sessionRes.data[0] || null);
    setSessionSummary(summaryRes.data[0] || null);
    setStreakInfo(streakRes.data[0]);
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

  const handleStartWorkout = async () => {
    try {
      if (todaySession?.status === 'inProgress') {
        navigate('/log', { state: { session: todaySession } });
        return;
      }
      const today = new Date();
      const dayIndex = today.getDay();
      const dayOfWeek = DAY_KEYS[dayIndex === 0 ? 6 : dayIndex - 1];
      const res = await fitnessApi.startSession({ planId: plan?._id, dayOfWeek });
      await loadData();
      navigate('/log', { state: { session: res.data[0] } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const workoutButtonLabel = () => {
    if (todaySession?.status === 'inProgress') return 'CONTINUE WORKOUT';
    const completed = sessionSummary?.completedCount || 0;
    if (completed > 0) return `SESSION ${completed + 1}`;
    return 'START WORKOUT';
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading dashboard...</div>;

  const currentStreak = streakInfo?.currentStreak ?? summary?.currentStreak ?? 0;
  const currentMedal = getCurrentMedal(currentStreak);
  const nextMedal = getNextMedal(currentStreak);

  const weekData = DAY_KEYS.map((key, i) => {
    const day = plan?.days?.find((d) => d.dayOfWeek === key);
    return {
      day: DAY_LABELS[i],
      completed: false,
      rest: day?.isRestDay,
      today: new Date().getDay() === (i === 6 ? 0 : i + 1),
      focus: day?.focus,
    };
  });

  const todayPlan = plan?.days?.find((d) => {
    const idx = new Date().getDay();
    const key = DAY_KEYS[idx === 0 ? 6 : idx - 1];
    return d.dayOfWeek === key;
  });

  const statCards = [
    { label: 'WORKOUTS THIS WEEK', value: String(summary?.thisWeek?.count || 0), sub: 'sessions', icon: Flame },
    { label: 'TOTAL VOLUME', value: `${((summary?.thisWeek?.volume || 0) / 1000).toFixed(1)}K`, sub: 'kg this week', icon: Trophy },
    { label: 'CURRENT STREAK', value: String(currentStreak), sub: 'days', icon: Timer },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'GOOD MORNING';
    if (h < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', overflowY: 'auto', height: '100%' }}>
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

      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-secondary" onClick={handleCheckIn} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> Check In
          </button>
          <button type="button" onClick={handleStartWorkout} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            borderRadius: '8px', border: 'none', background: 'var(--color-primary)',
            color: '#080808', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          }}>
            <Play size={14} fill="#080808" />
            {workoutButtonLabel()}
          </button>
        </div>
      </div>

      <div className="card medals-section">
        <div className="medals-section__head">
          <div>
            <h3>Streak Awards</h3>
            <span className="medals-section__streak">{currentStreak} day streak · {currentMedal.name}</span>
          </div>
          <div className="medals-section__current">
            <StreakMedalBadge tier={currentMedal.tier} earned size="sm" />
          </div>
        </div>
        <div className="medals-section__grid">
          {STREAK_MEDALS.filter((m) => m.min > 0).map((medal, i) => {
            const earned = currentStreak >= medal.min;
            const isCurrent = currentMedal.min === medal.min;
            return (
              <motion.div
                key={medal.min}
                className={`medal-card medal-card--${medal.tier}${earned ? ' medal-card--earned' : ''}${isCurrent ? ' medal-card--active' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <StreakMedalBadge tier={medal.tier} earned={earned} active={isCurrent} size="lg" />
                <strong className="medal-card__name">{medal.name}</strong>
                <span className="medal-card__days">{medal.min}+ days</span>
                {isCurrent && <span className="medal-card__badge">Current</span>}
              </motion.div>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {statCards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '8px' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{sub}</div>
            <Icon size={20} color="var(--color-accent)" style={{ marginTop: '12px' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
