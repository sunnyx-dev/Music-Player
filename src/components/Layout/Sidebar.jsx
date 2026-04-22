import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Library, Users, Radio, BarChart3, Music } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/library', label: 'Library', icon: Library },
  { path: '/social', label: 'Social', icon: Users },
  { path: '/rooms', label: 'Rooms', icon: Radio },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>🎵</span> Sur
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎧</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Music Lover</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Free Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
