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

// Component to load liquide photo on-demand
const LiquideThumbnail = ({ liquideId, liquideNom }) => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: load photo immediately on older browsers
      const loadPhoto = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API}/articles/${liquideId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.photos && response.data.photos.length > 0) {
            setPhoto(response.data.photos[0]);
          }
        } catch (error) {
          console.error('Error loading liquide photo:', error);
        } finally {
          setLoading(false);
        }
      };
      loadPhoto();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loading) {
          const loadPhoto = async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await axios.get(`${API}/articles/${liquideId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.data.photos && response.data.photos.length > 0) {
                setPhoto(response.data.photos[0]);
              }
            } catch (error) {
              console.error('Error loading liquide photo:', error);
            } finally {
              setLoading(false);
            }
          };
          loadPhoto();
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, liquideId, loading]);

  return (
    <div ref={setRef} className="w-full h-full">
      {loading ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 animate-pulse flex items-center justify-center">
          <Droplet className="w-12 h-12 text-blue-400" />
        </div>
      ) : photo ? (
        <LazyLoadImage
          src={photo}
          alt={liquideNom}
          effect="blur"
          className="w-full h-full object-cover"
          threshold={200}
          placeholder={<div className="w-full h-full bg-blue-100 animate-pulse" />}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
          <Droplet className="w-12 h-12 text-blue-600" />
        </div>
      )}
    </div>
  );
};

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
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/articles/liquides`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiquides(response.data || []);
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

  const getBarColor = (pourcentage) => {
    if (pourcentage <= 25) return '#ef4444'; // rouge - critique
    if (pourcentage <= 50) return '#f59e0b'; // orange - faible
    if (pourcentage <= 75) return '#fbbf24'; // jaune - moyen
    return '#10b981'; // vert - bon
  };

  const getStatusText = (pourcentage) => {
    if (pourcentage <= 25) return '⚠️ Critique';
    if (pourcentage <= 50) return '⚠️ Faible';
    if (pourcentage <= 75) return '📊 Moyen';
    return '✓ Bon';
  };

  const calculatePercentage = (liquide) => {
    const current = liquide.litres || 0;
    const souhaite = liquide.quantite_min || 0;
    
    if (souhaite === 0) return 100; // Si pas de quantité souhaitée, considérer comme plein
    
    const pourcentage = (current / souhaite) * 100;
    return Math.min(Math.round(pourcentage), 100); // Limiter à 100%
  };

  // Créer les données du graphique avec pourcentages et tri
  const chartData = filteredLiquides
    .map(liq => {
      const pourcentage = calculatePercentage(liq);
      return {
        nom: liq.nom,
        pourcentage: pourcentage,
        color: getBarColor(pourcentage),
        litres: liq.litres || 0,
        quantite_min: liq.quantite_min || 0
      };
    })
    .sort((a, b) => b.pourcentage - a.pourcentage); // Tri décroissant par pourcentage

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
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Huiles & Liquides</h1>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="glass rounded-2xl p-6 shadow-md" data-testid="chart-section">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Taux de remplissage
              <span className="text-sm font-normal text-gray-500 ml-2">
                (% actuel / quantité souhaitée)
              </span>
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nom" angle={-45} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
                <YAxis 
                  label={{ value: 'Taux de remplissage (%)', angle: -90, position: 'insideLeft' }} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-bold text-gray-900">{data.nom}</p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">{data.pourcentage}%</span> de remplissage
                          </p>
                          <p className="text-xs text-gray-500">
                            {data.litres}L / {data.quantite_min}L souhaités
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pourcentage" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Légende des couleurs */}
            <div className="flex justify-center space-x-4 mt-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span>0-25% (Critique)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>26-50% (Faible)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                <span>51-75% (Moyen)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span>76-100% (Bon)</span>
              </div>
            </div>
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
          {filteredLiquides
            .sort((a, b) => calculatePercentage(b) - calculatePercentage(a)) // Tri par pourcentage décroissant
            .map((liquide) => {
              const pourcentage = calculatePercentage(liquide);
              const statusColor = getBarColor(pourcentage);
              return (
                <div
                  key={liquide.id}
                  className="glass rounded-2xl overflow-hidden shadow-md hover-lift"
                  data-testid={`liquide-card-${liquide.id}`}
                >
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                  {liquide.has_photo ? (
                    <LiquideThumbnail liquideId={liquide.id} liquideNom={liquide.nom} />
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
                      <div>
                        <span className="text-3xl font-bold" style={{ color: statusColor }}>
                          {pourcentage}%
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {liquide.litres || 0}L / {liquide.quantite_min || 0}L
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded" style={{ 
                        backgroundColor: statusColor + '20', 
                        color: statusColor 
                      }}>
                        {getStatusText(pourcentage)}
                      </span>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.min(pourcentage, 100)}%`,
                          backgroundColor: statusColor
                        }}
                      ></div>
                    </div>
                    
                    {liquide.usage_hebdo && (
                      <p className="text-xs text-gray-500 mt-2">
                        Usage: {liquide.usage_hebdo}L/semaine (~{(liquide.usage_hebdo * 4).toFixed(1)}L/mois)
                      </p>
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
