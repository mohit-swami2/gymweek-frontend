import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { DashboardView } from './DashboardView.jsx';
import { WeeklyPlanner } from '../planner/WeeklyPlanner.jsx';
import { WorkoutLog } from '../workout-logger/WorkoutLog.jsx';
import { ProgressView } from './ProgressView.jsx';
import { ProfileView } from './ProfileView.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const VIEW_ROUTES = { dashboard: '/dashboard', planner: '/planner', log: '/log', progress: '/progress', profile: '/profile' };

export function UserDashboardLayout({ initialView = 'dashboard' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { authMeta, exitImpersonation } = useAuth();
  const pathView = Object.entries(VIEW_ROUTES).find(([, path]) => location.pathname.startsWith(path))?.[0];
  const [view, setView] = useState(pathView || initialView);

  const handleNavigate = (v) => { setView(v); navigate(VIEW_ROUTES[v]); };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-background)', fontFamily: 'var(--font-family)' }}>
      {authMeta?.isImpersonating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'var(--color-accent)', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '16px',
          padding: '8px', fontSize: '0.8rem', fontWeight: 600,
        }}>
          Impersonation mode — viewing as user
          <button type="button" onClick={exitImpersonation} style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#fff', color: 'var(--color-accent)', fontWeight: 700, cursor: 'pointer' }}>
            Exit & Return to Admin
          </button>
        </div>
      )}
      <Sidebar activeView={view} onNavigate={handleNavigate} />
      <main style={{ flex: 1, overflow: 'hidden', paddingTop: authMeta?.isImpersonating ? '40px' : 0 }}>
        {view === 'dashboard' && <DashboardView />}
        {view === 'planner' && <WeeklyPlanner />}
        {view === 'log' && <WorkoutLog />}
        {view === 'progress' && <ProgressView />}
        {view === 'profile' && <ProfileView />}
      </main>
    </div>
  );
}
