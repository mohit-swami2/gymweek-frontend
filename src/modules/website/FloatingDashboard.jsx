import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { useInView } from './hooks/useInView.js';

const lineData = [
  { v: 12 }, { v: 19 }, { v: 14 }, { v: 24 }, { v: 32 }, { v: 28 }, { v: 38 }, { v: 44 },
];
const barData = [
  { v: 14 }, { v: 22 }, { v: 18 }, { v: 28 }, { v: 24 }, { v: 32 }, { v: 38 },
];

const CHART_COLOR = '#7eb09a';

export function FloatingDashboard({
  variant = 'line',
  title = 'Volume',
  value = '8,420',
  delta = '+12.4%',
  className = '',
  delay = 0,
}) {
  const { ref, inView } = useInView({ rootMargin: '40px' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
        className="gw-float-dash"
      >
        <div className="gw-float-dash__head">
          <div className="gw-float-dash__title">
            <span className="gw-float-dash__icon">
              {variant === 'line' ? <TrendingUp size={12} strokeWidth={2.5} /> : <Activity size={12} strokeWidth={2.5} />}
            </span>
            {title}
          </div>
          <span className="gw-float-dash__delta">{delta}</span>
        </div>
        <div className="gw-float-dash__value">{value}</div>
        <div className="gw-float-dash__chart" ref={ref}>
          {inView ? (
            <ResponsiveContainer width="100%" height="100%">
              {variant === 'line' ? (
                <AreaChart data={lineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fdLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={CHART_COLOR} strokeWidth={1.5} fill="url(#fdLine)" isAnimationActive animationDuration={900} />
                </AreaChart>
              ) : (
                <BarChart data={barData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="v" fill={CHART_COLOR} radius={[2, 2, 0, 0]} isAnimationActive animationDuration={900} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="gw-skeleton" style={{ height: '100%', borderRadius: 8 }} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
