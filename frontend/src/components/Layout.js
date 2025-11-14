import React, { useContext, useState } from 'react';
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
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
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

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventaire', label: 'Inventaire', icon: Package },
    { path: '/catalogue-gestion', label: 'Catalogue', icon: ShoppingCart },
    { path: '/huiles', label: 'Huiles & Liquides', icon: Droplet },
    { path: '/post-it', label: 'Post-it', icon: StickyNote },
    { path: '/agenda', label: 'Agenda', icon: Calendar },
    { path: '/stats', label: 'Statistiques', icon: TrendingUp },
  ];

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
      {/* Header */}
      <header className={`glass sticky top-0 z-50 border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3" data-testid="logo-link">
              <Logo size="sm" />
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
                    >
                      <Icon className="w-4 h-4 mr-2" />
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
                  <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrateur' : 'Employé'}</p>
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
