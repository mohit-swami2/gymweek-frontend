import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { Dumbbell, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import './progress.css';

const RANGES = [
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
];

function AnimatedStat({ label, value, hint, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      className="progress-stat"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="progress-stat__glow" aria-hidden />
      <div className="progress-stat__label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={12} />}
        {label}
      </div>
      <motion.div
        className="progress-stat__value"
        key={value}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        {value}
      </motion.div>
      {hint && <div className="progress-stat__hint">{hint}</div>}
    </motion.div>
  );
}

export function ProgressView() {
  const [range, setRange] = useState('3m');
  const [volumeData, setVolumeData] = useState([]);
  const [prs, setPrs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePr, setActivePr] = useState(null);

  const loadData = useCallback(async (volRange) => {
    setLoading(true);
    try {
      const [volRes, prRes, sumRes, adhRes] = await Promise.all([
        fitnessApi.getVolumeProgress({ range: volRange, groupBy: 'week' }),
        fitnessApi.getPRs({ limit: 12 }),
        fitnessApi.getSummary(),
        fitnessApi.getAdherence({ range: volRange }),
      ]);
      setVolumeData(volRes.data[0]?.data || []);
      const prList = prRes.data[0]?.prs || [];
      setPrs(prList);
      setSummary(sumRes.data[0]);
      setAdherence(adhRes.data[0]);
      setActivePr((prev) => prev || prList[0]?._id || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(range); }, [range, loadData]);

  const prChartData = useMemo(() => prs.slice(0, 8).map((pr) => ({
    lift: pr.exerciseId?.name?.split(' ').slice(0, 2).join(' ') || 'Lift',
    current: pr.maxWeight,
    orm: Math.round(pr.estimatedORM),
  })), [prs]);

  const selectedPr = prs.find((p) => p._id === activePr) || prs[0];

  const tooltipStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: '0.8rem',
  };

  return (
    <div className="progress-view">
      <motion.header
        className="progress-view__header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="progress-view__title">Progress</h1>
        <p className="progress-view__subtitle">
          {summary
            ? 'Track volume trends and personal records over time'
            : 'Loading your training history…'}
        </p>
      </motion.header>

      {loading && !summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} className="progress-skeleton" />)}
        </div>
      ) : (
        <div className="progress-stats">
          <AnimatedStat
            label="Total workouts"
            value={summary?.totalWorkouts ?? '—'}
            hint="All time"
            icon={Calendar}
            delay={0}
          />
          <AnimatedStat
            label="Lifetime volume"
            value={summary ? `${(summary.totalVolume / 1000).toFixed(1)}K` : '—'}
            hint="kg lifted"
            icon={Dumbbell}
            delay={0.05}
          />
          <AnimatedStat
            label="This week"
            value={summary?.thisWeek?.count ?? '—'}
            hint={`${summary?.improvementPercent >= 0 ? '+' : ''}${summary?.improvementPercent ?? 0}% vs last week`}
            icon={TrendingUp}
            delay={0.1}
          />
          <AnimatedStat
            label="Personal records"
            value={summary?.prCount ?? prs.length}
            hint="tracked lifts"
            icon={Trophy}
            delay={0.15}
          />
          <AnimatedStat
            label="Adherence score"
            value={adherence?.avgAdherenceScore ?? '—'}
            hint={`${adherence?.avgCompletionPercent ?? 0}% avg completion`}
            icon={TrendingUp}
            delay={0.2}
          />
        </div>
      )}

      <div className="progress-range-tabs" role="tablist" aria-label="Volume range">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={range === r.id}
            className={range === r.id ? 'button--active' : ''}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="progress-charts">
        <motion.div
          className="progress-chart-card"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <div className="progress-chart-card__head">
            <div>
              <div className="progress-chart-card__title">Training volume</div>
              <div className="progress-chart-card__sub">Weekly load (kg)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="periodLabel" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.08)' }} />
              <Bar dataKey="totalVolume" fill="var(--color-primary)" radius={[6, 6, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="progress-chart-card"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
        >
          <div className="progress-chart-card__head">
            <div>
              <div className="progress-chart-card__title">PR comparison</div>
              <div className="progress-chart-card__sub">Max weight vs estimated 1RM</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={prChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="lift" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="current" name="Max" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: 'var(--color-primary)', r: 4 }} animationDuration={900} />
              <Line type="monotone" dataKey="orm" name="1RM est." stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="4 4" dot={false} animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {prs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          <div className="progress-pr-section__head">
            <h2 className="progress-pr-section__title">Personal records</h2>
            {selectedPr && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Tap a card to highlight
              </span>
            )}
          </div>
          <div className="progress-pr-grid">
            <AnimatePresence mode="popLayout">
              {prs.map((pr, i) => (
                <motion.button
                  key={pr._id}
                  type="button"
                  className={`progress-pr-card${activePr === pr._id ? ' progress-pr-card--active' : ''}`}
                  onClick={() => setActivePr(pr._id)}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  whileTap={{ scale: 0.97 }}
                  layout
                >
                  <div className="progress-pr-card__name">{pr.exerciseId?.name}</div>
                  <div className="progress-pr-card__weight">{pr.maxWeight}kg</div>
                  <div className="progress-pr-card__orm">Est. 1RM: {Math.round(pr.estimatedORM)}kg</div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
    </div>
  );
}
