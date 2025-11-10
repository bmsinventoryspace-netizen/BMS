import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Minus, Search, Droplet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Huiles = () => {
  const [liquides, setLiquides] = useState([]);
  const [filteredLiquides, setFilteredLiquides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLiquide, setSelectedLiquide] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');

  useEffect(() => {
    fetchLiquides();
  }, []);

  useEffect(() => {
    filterLiquides();
  }, [liquides, searchTerm]);

  const fetchLiquides = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      const liquidesOnly = response.data.filter(a => a.type === 'liquide');
      setLiquides(liquidesOnly);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const filterLiquides = () => {
    if (!searchTerm) {
      setFilteredLiquides(liquides);
      return;
    }

    const filtered = liquides.filter(liq =>
      liq.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liq.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liq.viscosite?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liq.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLiquides(filtered);
  };

  const getBarColor = (liquide) => {
    const current = liquide.litres || 0;
    const min = liquide.quantite_min || 0;
    const usage = liquide.usage_hebdo || 0;

    if (current <= min) return '#ef4444'; // red
    if (usage > 0 && current <= min + usage) return '#f59e0b'; // orange
    return '#10b981'; // green
  };

  const getStatusText = (liquide) => {
    const current = liquide.litres || 0;
    const min = liquide.quantite_min || 0;
    const usage = liquide.usage_hebdo || 0;

    if (current <= min) return '⚠️ Stock critique';
    if (usage > 0 && current <= min + usage) return '⚠️ Stock faible';
    return '✓ Stock correct';
  };

  const chartData = filteredLiquides.map(liq => ({
    nom: liq.nom,
    litres: liq.litres || 0,
    color: getBarColor(liq),
  }));

  const handleQuantityUpdate = async (type) => {
    if (!selectedLiquide || !quantityChange) return;

    const change = type === 'add' ? parseFloat(quantityChange) : -parseFloat(quantityChange);

    try {
      await axios.post(`${API}/articles/${selectedLiquide.id}/quantity`, { change });
      toast.success('Quantité mise à jour');
      setSelectedLiquide(null);
      setQuantityChange('');
      fetchLiquides();
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="huiles-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Huiles & Liquides</h1>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="glass rounded-2xl p-6 shadow-md" data-testid="chart-section">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Niveaux de stock</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nom" angle={-45} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
                <YAxis label={{ value: 'Litres', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="litres" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Search */}
        <div className="glass rounded-2xl p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, référence, viscosité, catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Liquides List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="liquides-list">
          {filteredLiquides.map((liquide) => {
            const statusColor = getBarColor(liquide);
            return (
              <div
                key={liquide.id}
                className="glass rounded-2xl overflow-hidden shadow-md hover-lift"
                data-testid={`liquide-card-${liquide.id}`}
              >
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-200">
                  {liquide.photos && liquide.photos.length > 0 ? (
                    <LazyLoadImage
                      src={liquide.photos[0]}
                      alt={liquide.nom}
                      effect="blur"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Droplet className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      #{liquide.id}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{liquide.nom}</h3>
                  <p className="text-sm text-gray-600 mb-2">Réf: {liquide.ref || 'N/A'}</p>
                  
                  {liquide.viscosite && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Viscosité:</span> {liquide.viscosite}
                    </p>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold" style={{ color: statusColor }}>
                        {liquide.litres || 0}L
                      </span>
                      <span className="text-xs" style={{ color: statusColor }}>
                        {getStatusText(liquide)}
                      </span>
                    </div>
                    {liquide.quantite_min && (
                      <p className="text-xs text-gray-500">Min souhaité: {liquide.quantite_min}L</p>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedLiquide(liquide)}
                        data-testid={`modify-liquide-${liquide.id}`}
                      >
                        Modifier la quantité
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="quantity-dialog">
                      <DialogHeader>
                        <DialogTitle>Modifier: {liquide.nom}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Stock actuel: <span className="font-bold text-gray-900">{liquide.litres || 0}L</span></p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantité (à ajouter ou retirer)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 5.0"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(e.target.value)}
                            className="border-blue-200"
                            data-testid="quantity-change-input"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleQuantityUpdate('add')}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid="add-quantity-button"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter
                          </Button>
                          <Button
                            onClick={() => handleQuantityUpdate('remove')}
                            className="bg-red-600 hover:bg-red-700"
                            data-testid="remove-quantity-button"
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            Retirer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLiquides.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl">
            <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun liquide trouvé</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Huiles;
