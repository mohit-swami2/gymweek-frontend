import { useEffect, useState } from 'react';
import { LayoutDashboard, CalendarDays, ClipboardList, TrendingUp, User, LogOut, Zap, Dumbbell } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'Weekly Plan', icon: CalendarDays },
  { id: 'log', label: 'Log Workout', icon: ClipboardList },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
];

export function Sidebar({ activeView, onNavigate }) {
  const { user, logout } = useAuth();
  const [streak, setStreak] = useState(user?.currentStreak || 0);

  useEffect(() => {
    fitnessApi.getStreak().then((res) => setStreak(res.data[0]?.currentStreak || 0)).catch(() => {});
  }, []);

  return (
    <aside style={{
      width: '256px', background: 'var(--sidebar, #0d0d0d)',
      borderRight: '1px solid var(--sidebar-border, var(--color-border))',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dumbbell size={18} color="#080808" strokeWidth={2.5} />
        </div>
        <span className="gymweek-logo">GYM<span>WEEK</span></span>
      </div>

      <div style={{
        margin: '16px', borderRadius: '8px', padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(200,255,0,0.12), rgba(200,255,0,0.04))',
        border: '1px solid rgba(200,255,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Zap size={16} color="var(--color-primary)" />
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: 'var(--color-primary)' }}>
            {streak} DAY STREAK
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Keep it up!</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
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
