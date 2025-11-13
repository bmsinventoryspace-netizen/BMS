import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Search, Plus, Minus, Eye, EyeOff, Edit, ShoppingCart } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogueGestion = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      // Filtrer uniquement les articles publics
      const publicArticles = response.data.filter(a => a.public);
      setArticles(publicArticles);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const filterArticles = () => {
    if (!searchTerm) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(article =>
      article.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const updateQuantity = async (article, change) => {
    try {
      if (article.type === 'liquide') {
        // Pour les liquides, utiliser l'endpoint existant
        await axios.post(`${API}/articles/${article.id}/quantity`, { change });
      } else {
        // Pour les pièces, mettre à jour la quantité
        const newQuantite = Math.max(0, article.quantite + change);
        await axios.put(`${API}/articles/${article.id}`, {
          ...article,
          quantite: newQuantite
        });
      }
      toast.success('Quantité mise à jour');
      fetchArticles();
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  const togglePublic = async (article) => {
    try {
      await axios.put(`${API}/articles/${article.id}`, {
        ...article,
        public: !article.public
      });
      toast.success(article.public ? 'Retiré du catalogue' : 'Ajouté au catalogue');
      fetchArticles();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="catalogue-gestion-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-4xl font-bold text-gray-900">Gestion Catalogue Public</h1>
              <p className="text-sm text-gray-600">{articles.length} article(s) en vente</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass rounded-2xl p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, référence, SKU, catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="glass rounded-2xl overflow-hidden shadow-md hover-lift"
              data-testid={`article-card-${article.id}`}
            >
              <div 
                className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                {article.photos && article.photos.length > 0 ? (
                  <LazyLoadImage
                    src={article.photos[0]}
                    alt={article.nom}
                    effect="blur"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-400">B</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    #{article.id}
                  </span>
                </div>
                {article.prix_vente && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {article.prix_vente}€
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">{article.nom}</h3>
                <p className="text-sm text-gray-600 mb-2">Réf: {article.ref || 'N/A'}</p>
                
                {article.categorie && (
                  <p className="text-xs text-gray-600 mb-2">
                    <span className="font-semibold">Cat:</span> {article.categorie}
                  </p>
                )}

                {/* Quantité pour pièces */}
                {article.type === 'piece' && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-2">Stock disponible</p>
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(article, -1)}
                        disabled={article.quantite === 0}
                        className="w-10 h-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                        {article.quantite}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(article, 1)}
                        className="w-10 h-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quantité pour liquides */}
                {article.type === 'liquide' && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-2">Quantité disponible</p>
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(article, -1)}
                        disabled={article.litres <= 0}
                        className="w-10 h-10 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-2xl font-bold text-blue-600 w-16 text-center">
                        {article.litres}L
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(article, 1)}
                        className="w-10 h-10 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => togglePublic(article)}
                >
                  <EyeOff className="w-3 h-3 mr-2" />
                  Retirer du catalogue
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun article dans le catalogue public</p>
            <p className="text-xs text-gray-400 mt-2">
              Ajoutez des articles au catalogue depuis l'inventaire
            </p>
          </div>
        )}
      </div>

      {/* Modal détails article */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-blue-900">
                  {selectedArticle.nom}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Photos */}
                {selectedArticle.photos && selectedArticle.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedArticle.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${selectedArticle.nom} ${idx + 1}`}
                        className="w-full rounded-xl object-cover aspect-square"
                      />
                    ))}
                  </div>
                )}

                {/* Infos */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Référence:</span>
                    <p className="text-gray-900">{selectedArticle.ref || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">SKU:</span>
                    <p className="text-gray-900 font-mono text-xs">{selectedArticle.sku}</p>
                  </div>
                  {selectedArticle.categorie && (
                    <div>
                      <span className="font-semibold text-gray-700">Catégorie:</span>
                      <p className="text-gray-900">{selectedArticle.categorie}</p>
                    </div>
                  )}
                  {selectedArticle.etat && (
                    <div>
                      <span className="font-semibold text-gray-700">État:</span>
                      <p className="text-gray-900">{selectedArticle.etat}</p>
                    </div>
                  )}
                </div>

                {selectedArticle.description && (
                  <div>
                    <span className="font-semibold text-gray-700">Description:</span>
                    <p className="text-gray-900 mt-1">{selectedArticle.description}</p>
                  </div>
                )}

                {/* Prix */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {selectedArticle.prix_vente && (
                      <p className="text-3xl font-bold text-green-600">{selectedArticle.prix_vente}€</p>
                    )}
                    {selectedArticle.prix_neuf && selectedArticle.prix_neuf !== selectedArticle.prix_vente && (
                      <p className="text-lg text-gray-500 line-through">{selectedArticle.prix_neuf}€</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedArticle(null)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CatalogueGestion;

