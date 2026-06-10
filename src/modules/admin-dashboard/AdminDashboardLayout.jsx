import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Palette, FileText, Star, Mail, Shield, ScrollText, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import { AdminOverview } from './AdminOverview.jsx';
import { UsersManagement } from './UsersManagement.jsx';
import { ContactsManagement } from './ContactsManagement.jsx';
import { ThemeSettings } from './ThemeSettings.jsx';
import { CmsSectionsPage } from './cms/CmsSectionsPage.jsx';
import { CmsTestimonialsPage } from './cms/CmsTestimonialsPage.jsx';
import { CmsEmailTemplatesPage } from './cms/CmsEmailTemplatesPage.jsx';
import { CmsTermsPage } from './cms/CmsTermsPage.jsx';
import { CmsPrivacyPage } from './cms/CmsPrivacyPage.jsx';

const cmsItems = [
  { to: '/admin/cms/sections', label: 'Page Sections', icon: FileText },
  { to: '/admin/cms/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/cms/email-templates', label: 'Email Templates', icon: Mail },
  { to: '/admin/cms/terms', label: 'Terms & Conditions', icon: ScrollText },
  { to: '/admin/cms/privacy', label: 'Privacy Policy', icon: Shield },
];

export function AdminDashboardLayout() {
  const { admin, logout } = useAdminAuth();
  const [cmsOpen, setCmsOpen] = useState(true);

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '8px', textDecoration: 'none',
    background: isActive ? 'var(--color-primary)' : 'transparent',
    color: isActive ? 'var(--primary-foreground, #fff)' : 'var(--color-text-muted)',
    fontWeight: isActive ? 600 : 500, fontSize: '0.875rem',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
      <aside style={{ width: '260px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '8px 12px', marginBottom: '24px' }}>
          <div className="gymweek-logo">GYM<span>WEEK</span></div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Super Admin Panel</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{admin?.email}</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/admin" end style={navStyle}><LayoutDashboard size={16} /> Overview</NavLink>
          <NavLink to="/admin/users" style={navStyle}><Users size={16} /> Users</NavLink>
          <NavLink to="/admin/contacts" style={navStyle}><MessageSquare size={16} /> Contacts</NavLink>
          <NavLink to="/admin/themes" style={navStyle}><Palette size={16} /> Themes</NavLink>

          <button type="button" onClick={() => setCmsOpen(!cmsOpen)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', background: 'none', border: 'none',
            color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={16} /> CMS</span>
            <ChevronDown size={14} style={{ transform: cmsOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          {cmsOpen && cmsItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({ ...navStyle({ isActive }), paddingLeft: '36px', fontSize: '0.8rem' })}>
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>

        <button type="button" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.875rem', cursor: 'pointer' }}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="contacts" element={<ContactsManagement />} />
          <Route path="themes" element={<ThemeSettings />} />
          <Route path="cms/sections" element={<CmsSectionsPage />} />
          <Route path="cms/testimonials" element={<CmsTestimonialsPage />} />
          <Route path="cms/email-templates" element={<CmsEmailTemplatesPage />} />
          <Route path="cms/terms" element={<CmsTermsPage />} />
          <Route path="cms/privacy" element={<CmsPrivacyPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
