import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogo = () => {
  const [settings, setSettings] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      if (response.data.logo) {
        setLogoPreview(response.data.logo);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image est trop grande (max 2MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/settings`, {
        ...settings,
        logo: logoPreview
      });
      toast.success('Logo mis à jour !');
      fetchSettings();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLogoPreview(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Personnalisation du Logo</h1>
          <p className="text-gray-600 mt-2">
            Téléchargez votre logo personnalisé pour remplacer le "B" par défaut
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Télécharger un logo</CardTitle>
              <CardDescription>
                Format recommandé : PNG ou SVG avec fond transparent<br/>
                Taille recommandée : 200x200 pixels minimum<br/>
                Taille maximale : 2MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 hover:border-blue-500 transition-colors text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <p className="text-sm text-gray-600 mb-2">
                      Cliquez pour télécharger ou glissez une image
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, SVG jusqu'à 2MB
                    </p>
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>
              </div>

              {logoPreview && (
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du logo</CardTitle>
              <CardDescription>
                Voici comment votre logo apparaîtra dans l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview dans la navbar */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Dans la barre de navigation</Label>
                <div className="bg-gray-100 p-4 rounded-xl flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-white font-bold text-xl">B</span>
                    )}
                  </div>
                  <span className="text-xl font-bold text-blue-900">BMS Inventory</span>
                </div>
              </div>

              {/* Preview sur la page de login */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Sur la page de connexion</Label>
                <div className="bg-gray-100 p-8 rounded-xl text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-white font-bold text-3xl">B</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview dans le catalogue public */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Dans le catalogue public</Label>
                <div className="bg-gray-100 p-4 rounded-xl flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-white font-bold text-xl">B</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">BMS Inventory</h3>
                    <p className="text-xs text-blue-600">Catalogue Public</p>
                  </div>
                </div>
              </div>

              {!logoPreview && (
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                  <p className="text-sm text-gray-600">
                    Aucun logo personnalisé<br/>
                    Le "B" par défaut est utilisé
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogo;

