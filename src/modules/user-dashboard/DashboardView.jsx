import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Timer, Play, CheckCircle2, Circle, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { ChartCard } from '../../common/components/ChartCard.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { useAuth } from '../auth/AuthContext.jsx';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function DashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [plan, setPlan] = useState(null);
  const [volumeData, setVolumeData] = useState([]);
  const [todaySession, setTodaySession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fitnessApi.getSummary(),
      fitnessApi.getCurrentPlan(),
      fitnessApi.getVolumeProgress({ range: '4w', groupBy: 'week' }),
      fitnessApi.getTodaySession(),
    ]).then(([sumRes, planRes, volRes, sessionRes]) => {
      setSummary(sumRes.data[0]);
      setPlan(planRes.data[0]);
      setVolumeData(volRes.data[0]?.data || []);
      setTodaySession(sessionRes.data[0] || null);
    }).catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await fitnessApi.checkIn({});
      toast.success(res.data[0]?.streakMessage || 'Checked in!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStartWorkout = async () => {
    try {
      const today = new Date();
      const dayIndex = today.getDay();
      const dayOfWeek = DAY_KEYS[dayIndex === 0 ? 6 : dayIndex - 1];
      const res = await fitnessApi.startSession({ planId: plan?._id, dayOfWeek });
      navigate('/log', { state: { session: res.data[0] } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading dashboard...</div>;

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
    { label: 'CURRENT STREAK', value: String(summary?.currentStreak || 0), sub: 'days', icon: Timer },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'GOOD MORNING';
    if (h < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.2rem', letterSpacing: '0.02em', lineHeight: 1 }}>
            {greeting()}, {user?.name?.split(' ')[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {todayPlan?.focus || 'No workout planned'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
            {todaySession ? 'CONTINUE WORKOUT' : 'START WORKOUT'}
          </button>
        </div>
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
          <div style={{ fontWeight: 700, marginBottom: '16px' }}>This Week</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {weekData.map((d) => (
              <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{d.day}</div>
                <div style={{
                  height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: d.completed ? 'var(--color-primary)' : d.rest ? 'transparent' : 'var(--color-background)',
                  border: d.today ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  opacity: d.rest ? 0.4 : 1,
                }}>
                  {d.completed ? <CheckCircle2 size={16} color="#080808" /> : d.rest ? '—' : <Circle size={14} color="var(--color-text-muted)" />}
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
    </div>
  );
}
