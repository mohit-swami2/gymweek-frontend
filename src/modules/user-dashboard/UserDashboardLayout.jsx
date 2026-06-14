import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { DashboardView } from './DashboardView.jsx';
import { WeeklyPlanner } from '../planner/WeeklyPlanner.jsx';
import { WorkoutLog } from '../workout-logger/WorkoutLog.jsx';
import { ProgressView } from './ProgressView.jsx';
import { SessionHistoryView } from './SessionHistoryView.jsx';
import { ProfileView } from './ProfileView.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import './user-dashboard.css';

const VIEW_ROUTES = { dashboard: '/dashboard', planner: '/planner', log: '/log', history: '/history', progress: '/progress', profile: '/profile' };

export function UserDashboardLayout({ initialView = 'dashboard' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { authMeta, exitImpersonation } = useAuth();
  const pathView = Object.entries(VIEW_ROUTES).find(([, path]) => location.pathname.startsWith(path))?.[0];
  const [view, setView] = useState(pathView || initialView);

  const handleNavigate = (v) => { setView(v); navigate(VIEW_ROUTES[v]); };

  return (
    <div className="user-shell">
      {authMeta?.isImpersonating && (
        <div className="user-shell__banner">
          Impersonation mode — viewing as user
          <button type="button" onClick={exitImpersonation}>
            Exit & Return to Admin
          </button>
        </div>
      )}
      <div className="user-shell__body">
        <Sidebar activeView={view} onNavigate={handleNavigate} />
        <main className="user-shell__main">
          {view === 'dashboard' && <DashboardView />}
          {view === 'planner' && <WeeklyPlanner />}
          {view === 'log' && <WorkoutLog />}
          {view === 'history' && <SessionHistoryView />}
          {view === 'progress' && <ProgressView />}
          {view === 'profile' && <ProfileView />}
        </main>
      </div>
    </div>
  );
}
