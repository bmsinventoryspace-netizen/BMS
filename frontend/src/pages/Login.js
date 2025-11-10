import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="glass bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-3xl">B</span>
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
                placeholder="AdminLudo"
                required
                className="w-full border-blue-200 focus:border-blue-400"
                data-testid="username-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-blue-200 focus:border-blue-400"
                data-testid="password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
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
            <a href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Retour au catalogue public
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
