import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Logo } from '../hooks/useLogo';
import { useTheme } from '../hooks/useTheme';
import ServerWakeup from '../components/ServerWakeup';
import { Search, Phone, Filter, ShoppingCart, Plus, Minus, X, Check } from 'lucide-react';
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
  const [filteredPubs, setFilteredPubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarque, setSelectedMarque] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSousCategorie, setSelectedSousCategorie] = useState('all');
  const [selectedEtat, setSelectedEtat] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [serverReady, setServerReady] = useState(false);
  const [panier, setPanier] = useState([]);
  const [showPanier, setShowPanier] = useState(false);
  const [commandeValidee, setCommandeValidee] = useState(null);
  const { theme } = useTheme();

  const etats = ['Comme neuf', 'Très bon état', 'Bon état', 'État acceptable', 'Usé', 'Mauvais état', 'Très mauvais état'];

  useEffect(() => {
    if (serverReady) {
      fetchArticles();
      fetchPubs();
      fetchSettings();
      fetchCategories();
    }
  }, [serverReady]);

  useEffect(() => {
    filterArticles();
    filterPubs();
  }, [articles, pubs, searchTerm, selectedMarque, selectedCategory, selectedSousCategorie, selectedEtat]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles/public`);
      console.log('Public articles received:', response.data.length);
      setArticles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
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
      setSousCategories(response.data.sous_categories || []);
      
      // Extraire les marques depuis les articles déjà chargés
      const uniqueMarques = [...new Set(
        articles
          .map(a => a.marque)
          .filter(m => m && m.trim())
          .map(m => m.trim())
      )].sort();
      setMarques(uniqueMarques);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setSousCategories([]);
      setMarques([]);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMarque !== 'all') {
      filtered = filtered.filter(article => article.marque === selectedMarque);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.categorie === selectedCategory);
    }

    if (selectedSousCategorie !== 'all') {
      filtered = filtered.filter(article => {
        const sousCats = article.sous_categorie 
          ? (typeof article.sous_categorie === 'string' 
              ? article.sous_categorie.split(',').map(s => s.trim())
              : article.sous_categorie)
          : [];
        return sousCats.includes(selectedSousCategorie);
      });
    }

    if (selectedEtat !== 'all') {
      filtered = filtered.filter(article => article.etat === selectedEtat);
    }

    setFilteredArticles(filtered);
  };

  const filterPubs = () => {
    let filtered = pubs;

    // Filtrer les pubs selon le terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(pub =>
        pub.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Les filtres de marque, catégorie, etc. ne s'appliquent pas aux pubs
    // mais on garde la fonction pour une éventuelle extension future

    setFilteredPubs(filtered);
  };

  const calculateDiscount = (prix_vente, prix_neuf) => {
    if (!prix_vente || !prix_neuf || prix_neuf === 0 || prix_vente >= prix_neuf) return null;
    const discount = ((prix_neuf - prix_vente) / prix_neuf) * 100;
    return discount > 0 ? Math.round(discount) : null;
  };

  const addToPanier = (article, e) => {
    e.stopPropagation();
    const quantiteDisponible = article.quantite || 0;
    if (quantiteDisponible <= 0) {
      alert('Cet article n\'est plus en stock');
      return;
    }
    
    const existing = panier.find(item => item.article_id === article.id);
    if (existing) {
      const nouvelleQuantite = existing.quantite + 1;
      if (nouvelleQuantite > quantiteDisponible) {
        alert(`Quantité maximale disponible: ${quantiteDisponible}`);
        return;
      }
      setPanier(panier.map(item => 
        item.article_id === article.id 
          ? { ...item, quantite: nouvelleQuantite }
          : item
      ));
    } else {
      setPanier([...panier, {
        article_id: article.id,
        nom: article.nom,
        ref: article.ref,
        prix_vente: article.prix_vente || 0,
        quantite: 1,
        quantite_max: quantiteDisponible
      }]);
    }
  };

  const removeFromPanier = (articleId, e) => {
    e.stopPropagation();
    setPanier(panier.filter(item => item.article_id !== articleId));
  };

  const updateQuantite = (articleId, delta) => {
    setPanier(panier.map(item => {
      if (item.article_id === articleId) {
        const newQuantite = item.quantite + delta;
        if (newQuantite <= 0) return null;
        const quantiteMax = item.quantite_max || 999;
        if (newQuantite > quantiteMax) {
          alert(`Quantité maximale disponible: ${quantiteMax}`);
          return item;
        }
        return { ...item, quantite: newQuantite };
      }
      return item;
    }).filter(Boolean));
  };

  const calculerTotal = () => {
    return panier.reduce((total, item) => total + (item.prix_vente * item.quantite), 0);
  };

  const validerCommande = async () => {
    if (panier.length === 0) return;
    
    try {
      const total = calculerTotal();
      const response = await axios.post(`${API}/commandes`, {
        items: panier,
        total: total
      });
      
      setCommandeValidee({
        numero: response.data.numero,
        items: panier,
        total: total
      });
      setPanier([]);
      setShowPanier(false);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation de la commande');
    }
  };

  const insertPubsInCatalogue = () => {
    const result = [];
    
    // Ajouter tous les articles filtrés
    filteredArticles.forEach((article) => {
      result.push({ type: 'article', data: article });
    });
    
    // Ajouter toutes les pubs et offres filtrées
    filteredPubs.forEach((pub) => {
      result.push({ type: pub.type, data: pub });
    });

    return result;
  };

  const catalogueWithPubs = insertPubsInCatalogue();

  // Afficher l'écran de chargement si le serveur n'est pas prêt
  if (!serverReady) {
    return <ServerWakeup onReady={() => setServerReady(true)} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.light}`}>
      {/* Header */}
      <header className={`glass sticky top-0 z-50 border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <div>
                <h1 className={`text-2xl font-bold ${theme.text}`}>BMS Inventory</h1>
                <p className={`text-sm ${theme.textLight}`}>Catalogue Public</p>
              </div>
            </div>
            <Link to="/login" data-testid="login-button">
              <Button className={`${theme.bg} ${theme.bgHover} text-white`}>
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass p-6 rounded-2xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative" data-testid="search-bar">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${theme.borderInput} ${theme.focus}`}
                data-testid="search-input"
              />
            </div>
            
            <Select value={selectedMarque} onValueChange={setSelectedMarque}>
              <SelectTrigger className={theme.borderInput}>
                <SelectValue placeholder="Marque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les marques</SelectItem>
                {marques.map(marque => (
                  <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="category-filter">
              <SelectTrigger className={theme.borderInput}>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSousCategorie} onValueChange={setSelectedSousCategorie}>
              <SelectTrigger className={theme.borderInput}>
                <SelectValue placeholder="Sous-catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sous-catégories</SelectItem>
                {sousCategories.map(sousCat => (
                  <SelectItem key={sousCat} value={sousCat}>{sousCat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEtat} onValueChange={setSelectedEtat} data-testid="etat-filter">
              <SelectTrigger className={theme.borderInput}>
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
            <div className={`w-24 h-24 bg-gradient-to-br ${theme.bg100} ${theme.bg200} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <span className={`text-4xl font-bold ${theme.text700}`}>B</span>
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
                    className={`glass rounded-2xl overflow-hidden shadow-md hover-lift cursor-pointer border-4 ${theme.border500}`}
                    onClick={() => setSelectedPub(item.data)}
                    data-testid={`${item.type}-${index}`}
                  >
                    <div className={`relative aspect-square bg-gradient-to-br ${theme.bg100} ${theme.bg200}`}>
                      {item.data.image ? (
                        <LazyLoadImage
                          src={item.data.image}
                          alt={item.data.nom}
                          effect="blur"
                          className="w-full h-full object-cover"
                          threshold={200}
                          placeholder={<div className="w-full h-full bg-gray-200 animate-pulse" />}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className={`text-4xl font-bold ${theme.text400}`}>B</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg uppercase">
                        {item.type}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold ${theme.text} mb-2`}>{item.data.nom}</h3>
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
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {article.photos && article.photos.length > 0 ? (
                      <LazyLoadImage
                        src={article.photos[0]}
                        alt={article.nom}
                        effect="blur"
                        className="w-full h-full object-cover"
                        threshold={200}
                        placeholder={<div className="w-full h-full bg-gray-200 animate-pulse" />}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
                          <p className={`text-xl font-bold ${theme.textLight}`}>{article.prix_vente}€</p>
                        )}
                        {article.prix_neuf && article.prix_neuf !== article.prix_vente && (
                          <p className="text-sm text-gray-500 line-through">{article.prix_neuf}€</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className={`${theme.bg} ${theme.bgHover} text-white disabled:opacity-50`}
                        onClick={(e) => addToPanier(article, e)}
                        disabled={!article.quantite || article.quantite <= 0}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {article.quantite && article.quantite > 0 ? 'Ajouter' : 'Rupture'}
                      </Button>
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
                <DialogTitle className={`text-2xl ${theme.text}`}>{selectedArticle.nom}</DialogTitle>
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
                      <p className={`text-3xl font-bold ${theme.textLight}`}>{selectedArticle.prix_vente}€</p>
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
                  <div className="flex gap-2">
                    <Button
                      className={`${theme.bg} ${theme.bgHover} text-white`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToPanier(selectedArticle, { stopPropagation: () => {} });
                        setSelectedArticle(null);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter au panier
                    </Button>
                    {settings.tel_commande && (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.location.href = `tel:${settings.tel_commande}`}
                        data-testid="contact-button"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Appeler
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Panier flottant */}
      {panier.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            className={`${theme.bg} ${theme.bgHover} text-white shadow-lg rounded-full px-6 py-3 flex items-center gap-2`}
            onClick={() => setShowPanier(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold">{panier.reduce((sum, item) => sum + item.quantite, 0)}</span>
            <span className="hidden sm:inline">articles</span>
            <span className="font-bold ml-2">{calculerTotal().toFixed(2)}€</span>
          </Button>
        </div>
      )}

      {/* Modal Panier */}
      <Dialog open={showPanier} onOpenChange={setShowPanier}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`text-2xl ${theme.text}`}>Mon Panier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {panier.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Votre panier est vide</p>
            ) : (
              <>
                {panier.map((item) => (
                  <div key={item.article_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{item.nom}</h4>
                      {item.ref && <p className="text-sm text-gray-600">Réf: {item.ref}</p>}
                      <p className={`text-lg font-bold ${theme.textLight} mt-1`}>{item.prix_vente}€ × {item.quantite} = {(item.prix_vente * item.quantite).toFixed(2)}€</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantite(item.article_id, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold w-8 text-center">{item.quantite}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantite(item.article_id, 1)}
                        disabled={item.quantite >= (item.quantite_max || 999)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      {item.quantite_max && (
                        <span className="text-xs text-gray-500 ml-1">/ {item.quantite_max}</span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => removeFromPanier(item.article_id, e)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">Total:</span>
                    <span className={`text-2xl font-bold ${theme.textLight}`}>{calculerTotal().toFixed(2)}€</span>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    onClick={validerCommande}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Valider ma liste
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ticket de caisse */}
      <Dialog open={!!commandeValidee} onOpenChange={() => setCommandeValidee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`text-2xl text-center ${theme.text}`}>Commande validée !</DialogTitle>
          </DialogHeader>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mt-4 font-mono">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">BMS INVENTORY</h3>
              <p className="text-sm text-gray-600">Ticket de caisse</p>
            </div>
            <div className="border-t border-b border-dashed border-gray-400 py-3 my-3">
              <p className="text-center font-bold text-lg">Commande #{commandeValidee?.numero}</p>
              <p className="text-center text-sm text-gray-600">{new Date().toLocaleString('fr-FR')}</p>
            </div>
            <div className="space-y-2 mb-3">
              {commandeValidee?.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.nom} × {item.quantite}</span>
                  <span>{(item.prix_vente * item.quantite).toFixed(2)}€</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-400 pt-2 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL:</span>
                <span>{commandeValidee?.total.toFixed(2)}€</span>
              </div>
            </div>
            <div className="text-center mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600 mb-2">Conservez ce numéro de commande</p>
              <p className={`text-lg font-bold ${theme.textLight}`}>#{commandeValidee?.numero}</p>
            </div>
          </div>
          {settings.tel_commande && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
              onClick={() => window.location.href = `tel:${settings.tel_commande}`}
            >
              <Phone className="w-5 h-5 mr-2" />
              Appeler maintenant
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Pub Detail Dialog */}
      <Dialog open={!!selectedPub} onOpenChange={() => setSelectedPub(null)}>
        <DialogContent className="max-w-2xl" data-testid="pub-dialog">
          {selectedPub && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-2xl ${theme.text}`}>{selectedPub.nom}</DialogTitle>
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
                      className={`${theme.bg} ${theme.bgHover} text-white`}
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
