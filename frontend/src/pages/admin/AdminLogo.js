import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Palette } from 'lucide-react';

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
      const token = localStorage.getItem('token');
      await axios.put(`${API}/settings`, {
        tel_commande: settings.tel_commande || null,
        tel_pub: settings.tel_pub || null,
        logo: logoPreview || null,
        theme_color: settings.theme_color || 'blue'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Paramètres mis à jour !');
      fetchSettings();
      // Recharger la page pour appliquer le nouveau thème
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Erreur détaillée:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (color) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/settings`, {
        tel_commande: settings.tel_commande || null,
        tel_pub: settings.tel_pub || null,
        logo: settings.logo || null,
        theme_color: color
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings({ ...settings, theme_color: color });
      toast.success('Couleur du thème mise à jour !');
      // Recharger la page pour appliquer le nouveau thème
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Erreur détaillée:', error.response?.data || error.message);
    }
  };

  const themeColors = [
    { value: 'blue', label: 'Bleu', class: 'bg-blue-600' },
    { value: 'green', label: 'Vert', class: 'bg-green-600' },
    { value: 'red', label: 'Rouge', class: 'bg-red-600' },
    { value: 'purple', label: 'Violet', class: 'bg-purple-600' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-600' },
    { value: 'teal', label: 'Sarcelle', class: 'bg-teal-600' },
    { value: 'pink', label: 'Rose', class: 'bg-pink-600' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-600' },
  ];

  const handleReset = () => {
    setLogoPreview(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Personnalisation</h1>
          <p className="text-gray-600 mt-2">
            Personnalisez le logo et les couleurs de votre application
          </p>
        </div>

        {/* Sélecteur de couleur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Couleur du thème
            </CardTitle>
            <CardDescription>
              Choisissez la couleur principale de votre application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Couleur actuelle</Label>
                <Select 
                  value={settings.theme_color || 'blue'} 
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themeColors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {themeColors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => handleThemeChange(color.value)}
                    className={`w-12 h-12 rounded-lg ${color.class} hover:opacity-80 transition-opacity ${
                      (settings.theme_color || 'blue') === color.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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

