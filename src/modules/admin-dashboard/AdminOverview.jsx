import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Dumbbell, Calendar, Activity, Flame, Trophy, Mail, Download, TrendingUp, BarChart3,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import { dashboardApi } from '../../common/api/cmsApi.js';

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: '#3b82f6' },
  { key: 'activeUsers', label: 'Active Users', icon: TrendingUp, color: '#10b981' },
  { key: 'totalPlans', label: 'Weekly Plans', icon: Calendar, color: '#a855f7' },
  { key: 'completedSessions', label: 'Workouts Done', icon: Activity, color: '#c8ff00' },
  { key: 'totalCheckIns', label: 'Check-ins', icon: Flame, color: '#f97316' },
  { key: 'totalPrs', label: 'Personal Records', icon: Trophy, color: '#fbbf24' },
  { key: 'activeExercises', label: 'Exercises', icon: Dumbbell, color: '#22d3ee' },
  { key: 'pendingContacts', label: 'Pending Leads', icon: Mail, color: '#ef4444' },
];

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data[0]))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await dashboardApi.exportReport();
      const report = res.data[0];
      downloadJson(`gymweek-report-${new Date().toISOString().slice(0, 10)}.json`, report);
      toast.success('Report exported');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard admin-dashboard--loading">Loading dashboard...</div>;
  }

  const summary = stats?.summary || {};
  const charts = stats?.charts || {};

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__head">
        <div>
          <h1 className="admin-dashboard__title">Platform Overview</h1>
          <p className="admin-dashboard__subtitle">
            Live stats across users, workouts, progress, and leads.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleExport} disabled={exporting}>
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export Full Report'}
        </button>
      </div>

      <div className="admin-dashboard__stats">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              className="admin-stat-card card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="admin-stat-card__icon" style={{ color: card.color, borderColor: `${card.color}44` }}>
                <Icon size={18} />
              </div>
              <div className="admin-stat-card__value">{summary[card.key]?.toLocaleString?.() ?? summary[card.key] ?? 0}</div>
              <div className="admin-stat-card__label">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="admin-dashboard__highlights card">
        <div className="admin-dashboard__highlight">
          <span>Platform volume</span>
          <strong>{(summary.platformVolume || 0).toLocaleString()} kg</strong>
        </div>
        <div className="admin-dashboard__highlight">
          <span>Total logged workouts</span>
          <strong>{(summary.platformWorkouts || 0).toLocaleString()}</strong>
        </div>
        <div className="admin-dashboard__highlight">
          <span>Avg user streak</span>
          <strong>{summary.avgStreak || 0} days</strong>
        </div>
        <div className="admin-dashboard__highlight">
          <span>In-progress sessions</span>
          <strong>{summary.inProgressSessions || 0}</strong>
        </div>
      </div>

      <div className="admin-dashboard__charts">
        <div className="card admin-chart-card">
          <div className="admin-chart-card__head">
            <BarChart3 size={16} />
            <h3>New user registrations (30 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={charts.registrations || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="rgba(59,130,246,0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card admin-chart-card">
          <div className="admin-chart-card__head">
            <Activity size={16} />
            <h3>Completed workouts (12 weeks)</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.sessions || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
              <Bar dataKey="sessions" fill="#c8ff00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card admin-chart-card">
          <div className="admin-chart-card__head">
            <TrendingUp size={16} />
            <h3>Training volume (kg)</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={charts.volume || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
              <Area type="monotone" dataKey="volume" stroke="#f97316" fill="rgba(249,115,22,0.18)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-dashboard__tables">
        <div className="card admin-table-card">
          <h3>Top users by volume</h3>
          <div className="admin-table-card__scroll">
            <table className="data-table data-table--compact">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Sessions</th>
                  <th>Volume</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.topUsers || []).map((u) => (
                  <tr key={u.userId}>
                    <td>
                      <strong>{u.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                    </td>
                    <td>{u.sessions}</td>
                    <td>{u.volume.toLocaleString()} kg</td>
                    <td>{u.currentStreak}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card admin-table-card">
          <h3>Recent activity</h3>
          <div className="admin-table-card__scroll">
            <table className="data-table data-table--compact">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentSessions || []).map((s) => (
                  <tr key={s.id}>
                    <td>{s.userName}</td>
                    <td>{s.dayOfWeek || '—'}</td>
                    <td>{s.status}</td>
                    <td>{(s.totalVolume || 0).toLocaleString()} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__links">
        {[
          { title: 'Users', to: '/admin/users' },
          { title: 'Exercises', to: '/admin/exercises' },
          { title: 'Contacts', to: '/admin/contacts' },
          { title: 'Themes', to: '/admin/themes' },
          { title: 'CMS', to: '/admin/cms/sections' },
        ].map((link) => (
          <Link key={link.to} to={link.to} className="card admin-dashboard__link-card">
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
