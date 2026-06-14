import { useEffect, useState } from 'react';
import { LayoutDashboard, CalendarDays, ClipboardList, TrendingUp, User, LogOut, Zap, Dumbbell, History } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'Weekly Plan', icon: CalendarDays },
  { id: 'log', label: 'Log Workout', icon: ClipboardList },
  { id: 'history', label: 'History', icon: History },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
];

export function Sidebar({ activeView, onNavigate }) {
  const { user, logout } = useAuth();
  const [streak, setStreak] = useState(user?.currentStreak || 0);

  useEffect(() => {
    fitnessApi.getStreak().then((res) => setStreak(res.data[0]?.currentStreak || 0)).catch(() => {});
  }, []);

  return (
    <aside className="user-sidebar">
      <div className="user-sidebar__brand">
        <div className="user-sidebar__logo-icon">
          <Dumbbell size={18} color="#080808" strokeWidth={2.5} />
        </div>
        <span className="gymweek-logo">GYM<span>WEEK</span></span>
      </div>

      <div className="user-sidebar__streak">
        <Zap size={16} color="var(--color-primary)" />
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: 'var(--color-primary)' }}>
            {streak} DAY STREAK
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Keep it up!</div>
        </div>
      </div>

      <nav className="user-sidebar__nav">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button key={id} type="button" onClick={() => onNavigate(id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              borderRadius: '8px', border: active ? '1px solid rgba(200,255,0,0.2)' : '1px solid transparent',
              background: active ? 'rgba(200,255,0,0.1)' : 'transparent',
              color: active ? 'var(--color-primary)' : 'var(--muted-foreground)',
              fontWeight: active ? 600 : 400, fontSize: '0.875rem', cursor: 'pointer', width: '100%', textAlign: 'left',
            }}>
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="user-sidebar__footer">
        <button type="button" onClick={() => onNavigate('profile')} style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', width: '100%',
          borderRadius: '8px', border: activeView === 'profile' ? '1px solid rgba(200,255,0,0.2)' : '1px solid transparent',
          background: activeView === 'profile' ? 'rgba(200,255,0,0.1)' : 'transparent',
          color: activeView === 'profile' ? 'var(--color-primary)' : 'var(--muted-foreground)', cursor: 'pointer',
        }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--foreground)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.68rem' }}>Profile</div>
          </div>
        </button>
        <button type="button" onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginTop: '4px',
          background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '0.875rem', cursor: 'pointer', width: '100%',
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
