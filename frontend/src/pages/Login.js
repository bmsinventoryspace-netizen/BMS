import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Logo } from '../hooks/useLogo';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { themeColor } = useTheme();

  const themeGradients = {
    blue: 'from-blue-600 via-blue-700 to-blue-800',
    green: 'from-green-600 via-green-700 to-green-800',
    red: 'from-red-600 via-red-700 to-red-800',
    purple: 'from-purple-600 via-purple-700 to-purple-800',
    orange: 'from-orange-600 via-orange-700 to-orange-800',
    teal: 'from-teal-600 via-teal-700 to-teal-800',
    pink: 'from-pink-600 via-pink-700 to-pink-800',
    indigo: 'from-indigo-600 via-indigo-700 to-indigo-800',
  };

  const themeButtons = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    teal: 'bg-teal-600 hover:bg-teal-700',
    pink: 'bg-pink-600 hover:bg-pink-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
  };

  const themeBorders = {
    blue: 'border-blue-200 focus:border-blue-400',
    green: 'border-green-200 focus:border-green-400',
    red: 'border-red-200 focus:border-red-400',
    purple: 'border-purple-200 focus:border-purple-400',
    orange: 'border-orange-200 focus:border-orange-400',
    teal: 'border-teal-200 focus:border-teal-400',
    pink: 'border-pink-200 focus:border-pink-400',
    indigo: 'border-indigo-200 focus:border-indigo-400',
  };

  const themeLinks = {
    blue: 'text-blue-600 hover:text-blue-700',
    green: 'text-green-600 hover:text-green-700',
    red: 'text-red-600 hover:text-red-700',
    purple: 'text-purple-600 hover:text-purple-700',
    orange: 'text-orange-600 hover:text-orange-700',
    teal: 'text-teal-600 hover:text-teal-700',
    pink: 'text-pink-600 hover:text-pink-700',
    indigo: 'text-indigo-600 hover:text-indigo-700',
  };

  const gradient = themeGradients[themeColor] || themeGradients.blue;
  const buttonClass = themeButtons[themeColor] || themeButtons.blue;
  const borderClass = themeBorders[themeColor] || themeBorders.blue;
  const linkClass = themeLinks[themeColor] || themeLinks.blue;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Connexion réussie!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Identifiants invalides');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} flex items-center justify-center px-4`}>
      <div className="max-w-md w-full">
        <div className="glass bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo size="lg" className="rounded-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BMS Inventory</h1>
            <p className="text-gray-600">Connexion à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom d'utilisateur"
                required
                className={`w-full ${borderClass}`}
                data-testid="username-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full ${borderClass} pr-10`}
                  data-testid="password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${buttonClass} text-white py-6 text-lg font-semibold`}
              data-testid="login-submit-button"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner border-white mr-2"></div>
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Se connecter
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className={`${linkClass} text-sm font-medium`}>
              ← Retour au catalogue public
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
