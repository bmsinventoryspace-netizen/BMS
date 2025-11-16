import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Phone, Save } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminNumeros = () => {
  const [settings, setSettings] = useState({
    tel_commande: '',
    tel_pub: '',
    deal_email: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API}/settings`, settings);
      toast.success('Paramètres enregistrés');
    } catch (error) {
      toast.error('Erreur d\'enregistrement');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl" data-testid="admin-numeros-page">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Gestion des numéros</h1>
        </div>

        <div className="glass rounded-2xl p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="tel_commande" className="text-lg font-semibold">
                Numéro pour les commandes
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Ce numéro sera affiché sur le catalogue public pour que les clients puissent commander
              </p>
              <Input
                id="tel_commande"
                type="tel"
                placeholder="Ex: +33 6 12 34 56 78"
                value={settings.tel_commande || ''}
                onChange={(e) => setSettings({ ...settings, tel_commande: e.target.value })}
                className="text-lg border-blue-200 focus:border-blue-400"
                data-testid="tel-commande-input"
              />
            </div>

            <div className="border-t pt-6">
              <Label htmlFor="tel_pub" className="text-lg font-semibold">
                Numéro pour les publicités
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Ce numéro sera affiché sur les publicités/offres pour proposer aux clients d'afficher leur annonce
              </p>
              <Input
                id="tel_pub"
                type="tel"
                placeholder="Ex: +33 6 98 76 54 32"
                value={settings.tel_pub || ''}
                onChange={(e) => setSettings({ ...settings, tel_pub: e.target.value })}
                className="text-lg border-blue-200 focus:border-blue-400"
                data-testid="tel-pub-input"
              />
            </div>

            <div className="border-t pt-6">
              <Label htmlFor="deal_email" className="text-lg font-semibold">
                Email notification DealFire
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Si renseigné, un email est envoyé à cette adresse à chaque nouveau deal (SMTP requis).
              </p>
              <Input
                id="deal_email"
                type="email"
                placeholder="ex: deals@votredomaine.com"
                value={settings.deal_email || ''}
                onChange={(e) => setSettings({ ...settings, deal_email: e.target.value })}
                className="text-lg border-blue-200 focus:border-blue-400"
                data-testid="deal-email-input"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                data-testid="save-numeros-button"
              >
                <Save className="w-5 h-5 mr-2" />
                Enregistrer les numéros
              </Button>
            </div>
          </form>
        </div>

        <div className="glass rounded-2xl p-6 shadow-md bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Conseil</h3>
          <p className="text-sm text-blue-800">
            Les numéros de téléphone seront automatiquement transformés en liens cliquables sur mobile,
            permettant aux clients d'appeler directement en un clic.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminNumeros;
