import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Phone, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CataloguePublic = () => {
  const [articles, setArticles] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEtat, setSelectedEtat] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);

  const etats = ['Comme neuf', 'Très bon état', 'Bon état', 'État acceptable', 'Usé', 'Mauvais état', 'Très mauvais état'];

  useEffect(() => {
    fetchArticles();
    fetchPubs();
    fetchSettings();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory, selectedEtat]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles/public`);
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchPubs = async () => {
    try {
      const response = await axios.get(`${API}/pubs`);
      setPubs(response.data);
    } catch (error) {
      console.error('Error fetching pubs:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.ref?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.categorie === selectedCategory);
    }

    if (selectedEtat !== 'all') {
      filtered = filtered.filter(article => article.etat === selectedEtat);
    }

    setFilteredArticles(filtered);
  };

  const calculateDiscount = (prix_vente, prix_neuf) => {
    if (!prix_vente || !prix_neuf || prix_neuf === 0 || prix_vente >= prix_neuf) return null;
    const discount = ((prix_neuf - prix_vente) / prix_neuf) * 100;
    return discount > 0 ? Math.round(discount) : null;
  };

  const insertPubsInCatalogue = () => {
    const result = [];
    
    // Ajouter tous les articles
    filteredArticles.forEach((article) => {
      result.push({ type: 'article', data: article });
    });
    
    // Ajouter toutes les pubs et offres
    pubs.forEach((pub) => {
      result.push({ type: pub.type, data: pub });
    });

    return result;
  };

  const catalogueWithPubs = insertPubsInCatalogue();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">BMS Inventory</h1>
                <p className="text-sm text-blue-600">Catalogue Public</p>
              </div>
            </div>
            <Link to="/login" data-testid="login-button">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass p-6 rounded-2xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative" data-testid="search-bar">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-400"
                data-testid="search-input"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="category-filter">
              <SelectTrigger className="border-blue-200">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEtat} onValueChange={setSelectedEtat} data-testid="etat-filter">
              <SelectTrigger className="border-blue-200">
                <SelectValue placeholder="État" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                {etats.map(etat => (
                  <SelectItem key={etat} value={etat}>{etat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Catalogue */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {catalogueWithPubs.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-catalogue">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-blue-700">B</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">BMS Inventory</h2>
            <p className="text-gray-600">Pas encore d'objets en vente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="articles-grid">
            {catalogueWithPubs.map((item, index) => {
              if (item.type === 'pub' || item.type === 'offre') {
                return (
                  <div
                    key={`${item.type}-${index}`}
                    className="glass rounded-2xl overflow-hidden shadow-md hover-lift cursor-pointer border-4 border-blue-500"
                    onClick={() => setSelectedPub(item.data)}
                    data-testid={`${item.type}-${index}`}
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-blue-200">
                      {item.data.image ? (
                        <LazyLoadImage
                          src={item.data.image}
                          alt={item.data.nom}
                          effect="blur"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-blue-400">B</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg uppercase">
                        {item.type}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-blue-900 mb-2">{item.data.nom}</h3>
                      {item.data.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.data.description}</p>
                      )}
                    </div>
                  </div>
                );
              }

              const article = item.data;
              const discount = calculateDiscount(article.prix_vente, article.prix_neuf);

              return (
                <div
                  key={article.id}
                  className="glass rounded-2xl overflow-hidden shadow-md hover-lift cursor-pointer"
                  onClick={() => {
                    setSelectedArticle(article);
                    // Track view
                    axios.post(`${API}/articles/${article.id}/view`).catch(console.error);
                  }}
                  data-testid={`article-${article.id}`}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
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
                    {discount && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{article.nom}</h3>
                    <p className="text-sm text-gray-600 mb-2">Réf: {article.ref || 'N/A'}</p>
                    {article.etat && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
                        {article.etat}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {article.prix_vente && (
                          <p className="text-xl font-bold text-blue-600">{article.prix_vente}€</p>
                        )}
                        {article.prix_neuf && article.prix_neuf !== article.prix_vente && (
                          <p className="text-sm text-gray-500 line-through">{article.prix_neuf}€</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="article-dialog">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-blue-900">{selectedArticle.nom}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Référence:</span>
                    <p className="text-gray-900">{selectedArticle.ref || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">État:</span>
                    <p className="text-gray-900">{selectedArticle.etat || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Catégorie:</span>
                    <p className="text-gray-900">{selectedArticle.categorie || 'N/A'}</p>
                  </div>
                  {selectedArticle.sous_categorie && (
                    <div>
                      <span className="font-semibold text-gray-700">Sous-catégorie:</span>
                      <p className="text-gray-900">{selectedArticle.sous_categorie}</p>
                    </div>
                  )}
                </div>
                {selectedArticle.description && (
                  <div>
                    <span className="font-semibold text-gray-700">Description:</span>
                    <p className="text-gray-900 mt-1">{selectedArticle.description}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {selectedArticle.prix_vente && (
                      <p className="text-3xl font-bold text-blue-600">{selectedArticle.prix_vente}€</p>
                    )}
                    {selectedArticle.prix_neuf && selectedArticle.prix_neuf !== selectedArticle.prix_vente && (
                      <div className="flex items-center space-x-2">
                        <p className="text-lg text-gray-500 line-through">{selectedArticle.prix_neuf}€</p>
                        {calculateDiscount(selectedArticle.prix_vente, selectedArticle.prix_neuf) && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                            -{calculateDiscount(selectedArticle.prix_vente, selectedArticle.prix_neuf)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {settings.tel_commande && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.location.href = `tel:${settings.tel_commande}`}
                      data-testid="contact-button"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contacter pour commander
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pub Detail Dialog */}
      <Dialog open={!!selectedPub} onOpenChange={() => setSelectedPub(null)}>
        <DialogContent className="max-w-2xl" data-testid="pub-dialog">
          {selectedPub && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-blue-900">{selectedPub.nom}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedPub.image && (
                  <img
                    src={selectedPub.image}
                    alt={selectedPub.nom}
                    className="w-full rounded-xl object-cover max-h-96"
                  />
                )}
                {selectedPub.description && (
                  <p className="text-gray-900">{selectedPub.description}</p>
                )}
                {settings.tel_pub && (
                  <div className="border-t pt-4">
                    <p className="text-gray-700 mb-3">Vous voulez afficher votre annonce ?</p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => window.location.href = `tel:${settings.tel_pub}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler {settings.tel_pub}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CataloguePublic;
