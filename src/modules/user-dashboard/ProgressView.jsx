import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartCard } from '../../common/components/ChartCard.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';

export function ProgressView() {
  const [volumeData, setVolumeData] = useState([]);
  const [prs, setPrs] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    Promise.all([
      fitnessApi.getVolumeProgress({ range: '3m', groupBy: 'week' }),
      fitnessApi.getPRs({ limit: 10 }),
      fitnessApi.getSummary(),
    ]).then(([volRes, prRes, sumRes]) => {
      setVolumeData(volRes.data[0]?.data || []);
      setPrs(prRes.data[0]?.prs || []);
      setSummary(sumRes.data[0]);
    });
  }, []);

  const prChartData = prs.slice(0, 6).map((pr) => ({
    lift: pr.exerciseId?.name?.split(' ')[0] || 'Lift',
    current: pr.maxWeight,
    orm: Math.round(pr.estimatedORM),
  }));

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', marginBottom: '8px' }}>Progress</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        {summary ? `${summary.totalWorkouts} total workouts · ${(summary.totalVolume / 1000).toFixed(0)}K kg lifetime volume` : 'Loading...'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <ChartCard title="Monthly Volume" subtitle="Weekly training load (kg)">
          <BarChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="periodLabel" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
            <Bar dataKey="totalVolume" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Personal Records" subtitle="Max weight (kg)">
          <LineChart data={prChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="lift" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
            <Line type="monotone" dataKey="current" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)' }} />
          </LineChart>
        </ChartCard>
      </div>

      {prs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {prs.map((pr) => (
            <div key={pr._id} className="card" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{pr.exerciseId?.name}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                {pr.maxWeight}kg
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '4px' }}>
                ORM: {Math.round(pr.estimatedORM)}kg
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
