import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Logo } from '../hooks/useLogo';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  LayoutDashboard,
  Package,
  Droplet,
  StickyNote,
  Calendar,
  User,
  Settings,
  Users,
  MessageSquare,
  Phone,
  LogOut,
  Menu,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Database,
  Flame,
} from 'lucide-react';

const FlameWithBadge = ({ className, hasNew }) => {
  if (!hasNew) {
    return <Flame className={className} />;
  }
  // Animated flame with glow when there's a new deal
  return (
    <div className="relative">
      {/* Glow halo */}
      <span className="absolute -inset-1 rounded-full bg-orange-500/40 blur-sm animate-[glow-pulse_1.4s_ease-in-out_infinite]" />
      {/* Flame SVG */}
      <svg
        viewBox="0 0 24 24"
        className={`${className} text-orange-500 drop-shadow-sm animate-[flame-flicker_1s_ease-in-out_infinite]`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M13.5 2.5c.2 2.4-1 3.6-2.2 4.8-1.2 1.3-2.3 2.4-1.8 4.5.3-1.1 1.5-1.9 2.6-1.8 1.5.1 2.8 1.5 2.8 3.3 0 2.2-1.8 4-4 4-2.7 0-4.9-2.2-4.9-4.9 0-4.1 3.1-6.2 5.2-8.2C12 3.5 12.8 2.8 13.5 2.5z" />
        <path d="M12 22c-3.9 0-7-3.1-7-7 0-3.2 1.9-5.5 3.8-7.2-.4 1.2-.2 2.1.3 2.7C8.7 8.2 9.6 6.7 11 5.4c1.3-1.2 3-2.6 2.8-4.9C18 3.2 19 6.5 19 9c0 3.9-3.1 7-7 7z" opacity=".45" />
      </svg>
      {/* Hot core */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/90 blur-[1px] animate-[glow-pulse_1.4s_ease-in-out_infinite]" />
      </span>
    </div>
  );
};

const Layout = ({ children }) => {
  const { user, logout, socket } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { themeColor } = useTheme();

  const themeClasses = {
    blue: {
      bg: 'from-blue-50 via-white to-gray-50',
      border: 'border-blue-100',
      text: 'text-blue-900',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      hover: 'hover:bg-blue-50',
    },
    green: {
      bg: 'from-green-50 via-white to-gray-50',
      border: 'border-green-100',
      text: 'text-green-900',
      button: 'bg-green-600 text-white hover:bg-green-700',
      hover: 'hover:bg-green-50',
    },
    red: {
      bg: 'from-red-50 via-white to-gray-50',
      border: 'border-red-100',
      text: 'text-red-900',
      button: 'bg-red-600 text-white hover:bg-red-700',
      hover: 'hover:bg-red-50',
    },
    purple: {
      bg: 'from-purple-50 via-white to-gray-50',
      border: 'border-purple-100',
      text: 'text-purple-900',
      button: 'bg-purple-600 text-white hover:bg-purple-700',
      hover: 'hover:bg-purple-50',
    },
    orange: {
      bg: 'from-orange-50 via-white to-gray-50',
      border: 'border-orange-100',
      text: 'text-orange-900',
      button: 'bg-orange-600 text-white hover:bg-orange-700',
      hover: 'hover:bg-orange-50',
    },
    teal: {
      bg: 'from-teal-50 via-white to-gray-50',
      border: 'border-teal-100',
      text: 'text-teal-900',
      button: 'bg-teal-600 text-white hover:bg-teal-700',
      hover: 'hover:bg-teal-50',
    },
    pink: {
      bg: 'from-pink-50 via-white to-gray-50',
      border: 'border-pink-100',
      text: 'text-pink-900',
      button: 'bg-pink-600 text-white hover:bg-pink-700',
      hover: 'hover:bg-pink-50',
    },
    indigo: {
      bg: 'from-indigo-50 via-white to-gray-50',
      border: 'border-indigo-100',
      text: 'text-indigo-900',
      button: 'bg-indigo-600 text-white hover:bg-indigo-700',
      hover: 'hover:bg-indigo-50',
    },
  };

  const theme = themeClasses[themeColor] || themeClasses.blue;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const [hasNewDeal, setHasNewDeal] = useState(false);
  const [lastDealSeenAt, setLastDealSeenAt] = useState(() => {
    try {
      return localStorage.getItem('lastDealSeenAt') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (!socket) return;
    const onMessage = (event) => {
      try {
        const msg = typeof event?.data === 'string' ? JSON.parse(event.data) : event;
        if (msg?.type === 'deal_created') {
          setHasNewDeal(true);
        }
      } catch {
        // ignore malformed
      }
    };
    // support native WebSocket
    if (typeof socket.addEventListener === 'function') {
      socket.addEventListener('message', onMessage);
      return () => socket.removeEventListener('message', onMessage);
    }
    // fallback (if a socket-like object is provided)
    if (typeof socket.on === 'function') {
      socket.on('message', onMessage);
      return () => {
        if (typeof socket.off === 'function') socket.off('message', onMessage);
      };
    }
  }, [socket]);

  // Fallback polling for new deals (admin/employee only)
  useEffect(() => {
    if (!(user?.role === 'admin' || user?.role === 'employee')) return;
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/deals`, {
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
          },
        });
        if (!res.ok) return;
        const deals = await res.json();
        const newest = deals?.[0];
        if (newest?.date) {
          const lastSeen = lastDealSeenAt ? new Date(lastDealSeenAt).getTime() : 0;
          const newestTime = new Date(newest.date).getTime();
          if (newestTime > lastSeen && location.pathname !== '/dealfire') {
            setHasNewDeal(true);
          }
        }
      } catch {}
    };
    const id = setInterval(() => { if (!stopped) check(); }, 20000);
    // initial
    check();
    return () => { stopped = true; clearInterval(id); };
  }, [user, lastDealSeenAt, location.pathname]);

  const baseNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/catalogue-gestion', label: 'Catalogue', icon: ShoppingCart },
    { path: '/post-it', label: 'Post-it', icon: StickyNote },
    { path: '/agenda', label: 'Agenda', icon: Calendar },
  ];

  let navItems = baseNav;
  if (user?.role === 'admin' || user?.role === 'employee') {
    navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/inventaire', label: 'Inventaire', icon: Package },
      { path: '/catalogue-gestion', label: 'Catalogue', icon: ShoppingCart },
      { path: '/dealfire', label: 'DealFire', icon: FlameWithBadge },
      { path: '/huiles', label: 'Huiles & Liquides', icon: Droplet },
      { path: '/post-it', label: 'Post-it', icon: StickyNote },
      { path: '/agenda', label: 'Agenda', icon: Calendar },
      { path: '/stats', label: 'Statistiques', icon: TrendingUp },
    ];
  } else if (user?.role === 'dealburner') {
    navItems = [
      { path: '/deals', label: 'Deals', icon: ShoppingCart },
    ];
  }

  const adminItems = [
    { path: '/admin/commandes', label: 'Commandes', icon: Receipt },
    { path: '/admin/pubs', label: 'Pubs & Offres', icon: MessageSquare },
    { path: '/admin/numeros', label: 'Numéros', icon: Phone },
    { path: '/admin/employes', label: 'Employés', icon: Users },
    { path: '/admin/logo', label: 'Logo', icon: Settings },
    { path: '/admin/backup', label: 'Sauvegarde', icon: Database },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg}`}>
      {/* Flame animations (scoped) */}
      <style>{`
        @keyframes flame-flicker {
          0% { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 0 rgba(255,140,0,0.3)); }
          20% { transform: translateY(-0.5px) rotate(-2deg) scale(1.02); filter: drop-shadow(0 0 2px rgba(255,140,0,0.4)); }
          40% { transform: translateY(0.4px) rotate(1.5deg) scale(0.98); filter: drop-shadow(0 0 3px rgba(255,160,40,0.45)); }
          60% { transform: translateY(-0.6px) rotate(-1deg) scale(1.03); filter: drop-shadow(0 0 2px rgba(255,120,0,0.4)); }
          80% { transform: translateY(0.3px) rotate(1deg) scale(0.99); filter: drop-shadow(0 0 1px rgba(255,120,0,0.35)); }
          100% { transform: translateY(0) rotate(0deg) scale(1); filter: drop-shadow(0 0 0 rgba(255,140,0,0.3)); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: .6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>
      {/* Header */}
      <header className={`glass sticky top-0 z-50 border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3" data-testid="logo-link">
              <div className="relative flex items-center">
                <Logo size="sm" />
                {(hasNewDeal && (user?.role === 'admin' || user?.role === 'employee')) && (
                  <div className="absolute -top-2 -right-2">
                    <FlameWithBadge className="w-4 h-4" hasNew />
                  </div>
                )}
              </div>
              <span className={`text-xl font-bold ${theme.text}`}>BMS Inventory</span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-testid={`nav-${item.path.replace('/', '')}`}
                  >
                    <Button
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className={`${
                        isActive(item.path)
                          ? theme.button
                          : `text-gray-700 ${theme.hover}`
                      }`}
                      onClick={() => {
                        if (item.path === '/dealfire') {
                          setHasNewDeal(false);
                          const now = new Date().toISOString();
                          setLastDealSeenAt(now);
                          try { localStorage.setItem('lastDealSeenAt', now); } catch {}
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" hasNew={hasNewDeal && item.path === '/dealfire'} />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="mobile-menu-button">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <nav className="flex flex-col space-y-2 mt-8">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={isActive(item.path) ? 'default' : 'ghost'}
                            className={`w-full justify-start ${
                              isActive(item.path)
                                ? theme.button
                                : `text-gray-700 ${theme.hover}`
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline text-gray-900 font-medium">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'admin' ? 'Administrateur' : user?.role === 'employee' ? 'Employé' : user?.role === 'dealburner' ? 'DealBurner' : ''}
                  </p>
                </div>
                <DropdownMenuSeparator />
                {user?.role === 'admin' && (
                  <>
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)} data-testid={`admin-menu-${item.path.replace('/admin/', '')}`}>
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/admin/profil')} data-testid="profil-menu-item">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
