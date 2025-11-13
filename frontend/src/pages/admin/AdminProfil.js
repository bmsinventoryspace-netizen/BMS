import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../App';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { User, Save } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProfil = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await axios.put(`${API}/users/${user?.username}`, {
        username: user?.username,
        password: formData.password || undefined,
        role: user?.role,
        phone: formData.phone,
      });
      toast.success('Profil mis à jour');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl" data-testid="admin-profil-page">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Mon profil</h1>
        </div>

        <div className="glass rounded-2xl p-8 shadow-md">
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Informations du compte</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Nom d'utilisateur:</span> {user?.username}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Rôle:</span> {user?.role === 'admin' ? 'Administrateur' : 'Employé'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Votre numéro de téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
                data-testid="phone-input"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Laisser vide pour ne pas modifier"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border-blue-200 focus:border-blue-400"
                    data-testid="password-input"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="border-blue-200 focus:border-blue-400"
                    data-testid="confirm-password-input"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                data-testid="save-profil-button"
              >
                <Save className="w-5 h-5 mr-2" />
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProfil;
