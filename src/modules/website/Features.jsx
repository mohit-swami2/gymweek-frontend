import { motion } from 'framer-motion';
import { Calendar, Flame, BarChart3 } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer } from 'recharts';
import { GlassCard } from './GlassCard.jsx';
import { useInView } from './hooks/useInView.js';

const CHART_COLOR = '#7eb09a';

const lineData = [{ v: 8 }, { v: 14 }, { v: 11 }, { v: 22 }, { v: 18 }, { v: 28 }, { v: 34 }];
const barData = [{ v: 12 }, { v: 20 }, { v: 16 }, { v: 26 }, { v: 22 }, { v: 30 }, { v: 38 }];
const stData = [{ v: 4 }, { v: 12 }, { v: 9 }, { v: 18 }, { v: 14 }, { v: 24 }, { v: 32 }, { v: 40 }];

const DEFAULT_FEATURES = [
  {
    icon: Calendar,
    title: 'Weekly Planner',
    desc: 'Build and block your training week in seconds.',
    badge: 'Smart Planner',
    chart: 'line',
    rotate: -5,
    elevated: false,
  },
  {
    icon: Flame,
    title: 'Workout Logger',
    desc: 'Log sets, reps, and tempo in real time.',
    badge: 'Streak Tracking',
    chart: 'area',
    rotate: 0,
    elevated: true,
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    desc: 'See volume, intensity and PRs at a glance.',
    badge: 'Volume Charts',
    chart: 'bar',
    rotate: 5,
    elevated: false,
  },
];

function MiniChart({ kind }) {
  const { ref, inView } = useInView({ rootMargin: '60px' });

  return (
    <div className="gw-feature-card__chart" ref={ref}>
      {inView ? (
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'line' && (
          <LineChart data={lineData}>
            <Line type="monotone" dataKey="v" stroke={CHART_COLOR} strokeWidth={2} dot={false} isAnimationActive animationDuration={900} />
          </LineChart>
        )}
        {kind === 'area' && (
          <AreaChart data={stData}>
            <defs>
              <linearGradient id="ftA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.6} />
                <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={CHART_COLOR} strokeWidth={2} fill="url(#ftA)" isAnimationActive animationDuration={900} />
          </AreaChart>
        )}
        {kind === 'bar' && (
          <BarChart data={barData}>
            <Bar dataKey="v" fill={CHART_COLOR} radius={[3, 3, 0, 0]} isAnimationActive animationDuration={900} />
          </BarChart>
        )}
      </ResponsiveContainer>
      ) : (
        <div className="gw-skeleton" style={{ height: '100%', borderRadius: 8 }} />
      )}
    </div>
  );
}

function mapCmsFeatures(section) {
  const items = section?.content?.items;
  if (!items?.length) return DEFAULT_FEATURES;
  const icons = [Calendar, Flame, BarChart3];
  const charts = ['line', 'area', 'bar'];
  return items.slice(0, 3).map((item, i) => ({
    icon: icons[i] || Calendar,
    title: item.title || DEFAULT_FEATURES[i].title,
    desc: item.description || item.desc || DEFAULT_FEATURES[i].desc,
    badge: item.badge || DEFAULT_FEATURES[i].badge,
    chart: charts[i] || 'line',
    rotate: [-5, 0, 5][i] ?? 0,
    elevated: i === 1,
  }));
}

export function Features({ section }) {
  const features = mapCmsFeatures(section);
  const content = section?.content || {};
  const subtitle = section?.subtitle || 'Everything you need to plan, log, and dominate every session.';
  const chartFootLabel = content.chartFootLabel || 'Last 7 days';
  const chartFootDelta = content.chartFootDelta || '+18.2%';

  return (
    <section id="features" className="gw-features">
      <div className="gw-container">
        <motion.div
          className="gw-section-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <h2>
            {section?.title ? (
              <>
                {section.title}
                {content.titleHighlight && (
                  <> <span>{content.titleHighlight}</span></>
                )}
              </>
            ) : (
              <>Built for <span>Serious Lifters</span></>
            )}
          </h2>
          <p>{subtitle}</p>
        </motion.div>

        <div className="gw-features__grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 60, rotateZ: f.rotate * 0.5 }}
              whileInView={{ opacity: 1, y: f.elevated ? -16 : 0, rotateZ: f.rotate }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard className="gw-feature-card">
                <div className="gw-feature-card__body">
                  <div className="gw-feature-card__top">
                    <div className="gw-feature-card__icon">
                      <f.icon size={20} strokeWidth={2} />
                    </div>
                    <span className="gw-feature-card__badge">{f.badge}</span>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <MiniChart kind={f.chart} />
                  <div className="gw-feature-card__chart-foot">
                    <span>{chartFootLabel}</span>
                    <span>{chartFootDelta}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
