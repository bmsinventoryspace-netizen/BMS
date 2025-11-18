import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import Layout from '../components/Layout';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Search, Download, ExternalLink, Trash2, Edit } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Inventaire = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSousCategory, setSelectedSousCategory] = useState('all');
  const [selectedEtat, setSelectedEtat] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSousCategoryFilter, setSelectedSousCategoryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleType, setArticleType] = useState('piece');
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [formData, setFormData] = useState(getEmptyFormData());
  const [photos, setPhotos] = useState([]);
  const [newSousCategorie, setNewSousCategorie] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewMarqueInput, setShowNewMarqueInput] = useState(false);
  const [newMarqueName, setNewMarqueName] = useState('');
  const [selectedArticleView, setSelectedArticleView] = useState(null);
  const [remisePercentage, setRemisePercentage] = useState('');

  const etats = ['Comme neuf', 'Très bon état', 'Bon état', 'État acceptable', 'Usé', 'Mauvais état', 'Très mauvais état'];

  function getEmptyFormData() {
    return {
      type: 'piece',
      nom: '',
      ref: '',
      description: '',
      etat: '',
      categorie: '',
      sous_categories: [], // Tableau au lieu d'une seule
      lieu: '',
      date_obtention: '',
      prix_neuf: '',
      prix_achat: '',
      prix_vente: '',
      quantite: 1,
      public: false,
      marque: '',
      litres: '',
      quantite_min: '',
      usage_hebdo: '',
      viscosite: '',
      norme: '',
      usage: '',
    };
  }

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchMarques();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory, selectedSousCategory, selectedEtat, selectedType, selectedSousCategoryFilter]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      setArticles(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories || []);
      
      // Séparer les sous-catégories qui sont stockées comme "cat1, cat2, cat3"
      const allSousCategories = response.data.sous_categories || [];
      const separatedSousCategories = [];
      allSousCategories.forEach(sc => {
        // Si la sous-catégorie contient des virgules, la séparer
        if (sc.includes(', ')) {
          const split = sc.split(', ').map(s => s.trim()).filter(s => s);
          separatedSousCategories.push(...split);
        } else {
          separatedSousCategories.push(sc);
        }
      });
      
      // Supprimer les doublons et trier
      const uniqueSousCategories = [...new Set(separatedSousCategories)].sort();
      setSousCategories(uniqueSousCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMarques = async () => {
    try {
      const response = await axios.get(`${API}/articles`);
      const allMarques = response.data
        .map(article => article.marque)
        .filter(marque => marque && marque.trim())
        .map(marque => marque.trim());
      const uniqueMarques = [...new Set(allMarques)].sort();
      setMarques(uniqueMarques);
    } catch (error) {
      console.error('Error fetching marques:', error);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.id?.toString().includes(searchTerm)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.categorie === selectedCategory);
    }

    // Sous-category filter
    if (selectedSousCategory !== 'all') {
      filtered = filtered.filter(article => article.sous_categorie === selectedSousCategory);
    }

    // État filter
    if (selectedEtat !== 'all') {
      filtered = filtered.filter(article => article.etat === selectedEtat);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(article => article.type === selectedType);
    }

    // Sous-category filter
    if (selectedSousCategoryFilter !== 'all') {
      filtered = filtered.filter(article => 
        article.sous_categorie && article.sous_categorie.includes(selectedSousCategoryFilter)
      );
    }

    setFilteredArticles(filtered);
  };

  const generateSKU = async () => {
    try {
      const response = await axios.get(`${API}/articles/generate-sku`);
      setFormData({ ...formData, sku: response.data.sku });
      toast.success('SKU généré');
    } catch (error) {
      toast.error('Erreur de génération SKU');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom) {
      toast.error('Le nom est obligatoire');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        photos: photos,
        // Convertir le tableau de sous-catégories en string pour le backend
        sous_categorie: formData.sous_categories.length > 0 ? formData.sous_categories.join(', ') : null,
        prix_neuf: formData.prix_neuf ? parseFloat(formData.prix_neuf) : null,
        prix_achat: formData.prix_achat ? parseFloat(formData.prix_achat) : null,
        prix_vente: formData.prix_vente ? parseFloat(formData.prix_vente) : null,
        quantite: parseInt(formData.quantite) || 1,
        litres: formData.litres ? parseFloat(formData.litres) : null,
        quantite_min: formData.quantite_min ? parseFloat(formData.quantite_min) : null,
        usage_hebdo: formData.usage_hebdo ? parseFloat(formData.usage_hebdo) : null,
      };
      // Supprimer sous_categories du dataToSend car on a déjà sous_categorie
      delete dataToSend.sous_categories;

      if (selectedArticle) {
        await axios.put(`${API}/articles/${selectedArticle.id}`, dataToSend);
        toast.success('Article modifié');
      } else {
        await axios.post(`${API}/articles`, dataToSend);
        toast.success('Article créé');
      }

      setShowAddDialog(false);
      setSelectedArticle(null);
      setFormData(getEmptyFormData());
      setPhotos([]);
      fetchArticles();
      fetchCategories();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    try {
      await axios.delete(`${API}/articles/${id}`);
      toast.success('Article supprimé');
      fetchArticles();
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    // Convertir sous_categorie string en array si nécessaire
    let sousCategories = [];
    if (article.sous_categorie) {
      if (Array.isArray(article.sous_categorie)) {
        sousCategories = article.sous_categorie;
      } else if (typeof article.sous_categorie === 'string') {
        // Séparer par virgule si c'est une string
        sousCategories = article.sous_categorie.split(', ').map(s => s.trim()).filter(s => s);
      }
    }
    setFormData({ ...article, sous_categories: sousCategories });
    setPhotos(article.photos || []);
    setArticleType(article.type);
    setShowAddDialog(true);
  };

  const addSousCategorie = () => {
    if (newSousCategorie.trim() && !formData.sous_categories.includes(newSousCategorie.trim())) {
      setFormData({
        ...formData,
        sous_categories: [...formData.sous_categories, newSousCategorie.trim()]
      });
      setNewSousCategorie('');
    }
  };

  const removeSousCategorie = (index) => {
    setFormData({
      ...formData,
      sous_categories: formData.sous_categories.filter((_, i) => i !== index)
    });
  };

  const handleCategoryChange = (value) => {
    if (value === '__new__') {
      setShowNewCategoryInput(true);
      setNewCategoryName('');
    } else {
      setFormData({ ...formData, categorie: value });
      setShowNewCategoryInput(false);
    }
  };

  const handleNewCategoryConfirm = () => {
    if (newCategoryName.trim()) {
      setFormData({ ...formData, categorie: newCategoryName.trim() });
      setShowNewCategoryInput(false);
      toast.success(`Catégorie "${newCategoryName.trim()}" créée !`);
      setNewCategoryName('');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API}/articles/export`, {}, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventaire_bms.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur d\'export');
    }
  };

  const handleFixImages = async () => {
    if (!window.confirm('Voulez-vous corriger l\'orientation de toutes les images existantes ? Cela peut prendre quelques instants.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      toast.info('Correction des images en cours...', { duration: 5000 });
      
      const response = await axios.post(`${API}/articles/fix-images`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const message = response.data.errors > 0
        ? `Images corrigées : ${response.data.articles_updated} articles mis à jour (${response.data.errors} erreurs)`
        : `Images corrigées : ${response.data.articles_updated} articles mis à jour, ${response.data.images_processed} images traitées`;
      
      toast.success(message);
      fetchArticles(); // Recharger pour voir les changements
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur inconnue';
      toast.error(`Erreur lors de la correction des images: ${errorMessage}`);
      console.error('Error fixing images:', error);
    }
  };

  const openReferenceSearch = () => {
    if (formData.nom) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(formData.nom + ' fiche technique')}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const openRefSearch = () => {
    if (formData.ref) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(formData.ref)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMarqueChange = (value) => {
    if (value === '__new__') {
      setShowNewMarqueInput(true);
      setNewMarqueName('');
    } else {
      setFormData({ ...formData, marque: value });
      setShowNewMarqueInput(false);
    }
  };

  const handleNewMarqueConfirm = () => {
    if (newMarqueName.trim()) {
      setFormData({ ...formData, marque: newMarqueName.trim() });
      setShowNewMarqueInput(false);
      toast.success(`Marque "${newMarqueName.trim()}" créée !`);
      setNewMarqueName('');
      // Ajouter la nouvelle marque à la liste
      if (!marques.includes(newMarqueName.trim())) {
        setMarques([...marques, newMarqueName.trim()].sort());
      }
    }
  };

  const openAddDialog = () => {
    setSelectedArticle(null);
    setFormData(getEmptyFormData());
    setPhotos([]);
    setArticleType('piece');
    setRemisePercentage('');
    setShowNewCategoryInput(false);
    setShowNewMarqueInput(false);
    setShowAddDialog(true);
  };

  const applyRemise = (percentage) => {
    const prixNeuf = parseFloat(formData.prix_neuf);
    if (prixNeuf && percentage) {
      const remise = prixNeuf * (parseFloat(percentage) / 100);
      const prixVente = (prixNeuf - remise).toFixed(2);
      setFormData({ ...formData, prix_vente: prixVente });
      setRemisePercentage(percentage);
      toast.success(`Remise de ${percentage}% appliquée : ${prixVente}€`);
    }
  };

  const quickRemises = [10, 15, 20, 25, 30, 50];

  return (
    <Layout>
      <div className="space-y-6" data-testid="inventaire-page">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Inventaire</h1>
          <div className="flex space-x-3">
            {user?.role === 'admin' && (
              <Button
                onClick={handleFixImages}
                variant="outline"
                className={`${theme.border500} ${theme.textLight} ${theme.bgLight} hover:opacity-80`}
                title="Corriger l'orientation de toutes les images existantes"
              >
                <Edit className="w-4 h-4 mr-2" />
                Corriger images
              </Button>
            )}
            <Button
              onClick={handleExport}
              variant="outline"
              className={`${theme.border500} ${theme.textLight} ${theme.bgLight} hover:opacity-80`}
              data-testid="export-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={openAddDialog}
                  className={`${theme.bg} ${theme.bgHover}`}
                  data-testid="add-article-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-3xl h-[85vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6" data-testid="article-dialog">
                <DialogHeader>
                  <DialogTitle>{selectedArticle ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(value) => { setFormData({ ...formData, type: value }); setArticleType(value); }} data-testid="article-type-select">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Pièce</SelectItem>
                        <SelectItem value="liquide">Liquide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Photos (optionnel)</Label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="w-full border border-gray-300 rounded-md p-2"
                      data-testid="photo-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sur mobile : vous pouvez prendre une photo directement ou choisir depuis la galerie
                    </p>
                    {photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {photos.map((photo, idx) => (
                          <div key={idx} className="relative">
                            <img src={photo} alt="Preview" className="w-full h-20 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom *</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          required
                          data-testid="nom-input"
                        />
                        <Button type="button" size="icon" variant="outline" onClick={openReferenceSearch} className="shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Référence</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={formData.ref}
                          onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                          data-testid="ref-input"
                        />
                        <Button type="button" size="icon" variant="outline" onClick={openRefSearch} className="shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      data-testid="description-input"
                    />
                  </div>

                  {/* Marque - disponible pour pièces et liquides */}
                  <div>
                    <Label>Marque</Label>
                    {!showNewMarqueInput ? (
                      <Select 
                        value={formData.marque} 
                        onValueChange={handleMarqueChange}
                        data-testid="marque-select"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une marque" />
                        </SelectTrigger>
                        <SelectContent>
                          {marques.map(marque => (
                            <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                          ))}
                          <SelectItem value="__new__" className={`${theme.textLight} font-semibold`}>
                            + Nouvelle marque
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          value={newMarqueName}
                          onChange={(e) => setNewMarqueName(e.target.value)}
                          placeholder="Nom de la nouvelle marque"
                          onKeyPress={(e) => e.key === 'Enter' && handleNewMarqueConfirm()}
                          autoFocus
                        />
                        <Button type="button" size="sm" onClick={handleNewMarqueConfirm}>
                          ✓
                        </Button>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowNewMarqueInput(false)}
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </div>

                  {articleType === 'piece' && (
                    <>
                      <div>
                        <Label>État</Label>
                        <Select value={formData.etat} onValueChange={(value) => setFormData({ ...formData, etat: value })} data-testid="etat-select">
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {etats.map(etat => (
                              <SelectItem key={etat} value={etat}>{etat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Quantité</Label>
                          <Input
                            type="number"
                            value={formData.quantite}
                            onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                            data-testid="quantite-input"
                          />
                        </div>
                        <div>
                          <Label>Lieu</Label>
                          <Input
                            value={formData.lieu}
                            onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                            data-testid="lieu-input"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {articleType === 'liquide' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label>Litres actuels</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.litres}
                            onChange={(e) => setFormData({ ...formData, litres: e.target.value })}
                            data-testid="litres-input"
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">Quantité min souhaitée</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.quantite_min}
                            onChange={(e) => setFormData({ ...formData, quantite_min: e.target.value })}
                            data-testid="quantite-min-input"
                          />
                        </div>
                        <div>
                          <Label>Usage hebdo (L)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.usage_hebdo}
                            onChange={(e) => setFormData({ ...formData, usage_hebdo: e.target.value })}
                            data-testid="usage-hebdo-input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Viscosité</Label>
                          <Input
                            value={formData.viscosite}
                            onChange={(e) => setFormData({ ...formData, viscosite: e.target.value })}
                            data-testid="viscosite-input"
                          />
                        </div>
                        <div>
                          <Label>Norme</Label>
                          <Input
                            value={formData.norme}
                            onChange={(e) => setFormData({ ...formData, norme: e.target.value })}
                            data-testid="norme-input"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Usage</Label>
                        <Input
                          value={formData.usage}
                          onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                          data-testid="usage-input"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label>Catégorie</Label>
                      {!showNewCategoryInput ? (
                        <Select 
                          value={formData.categorie} 
                          onValueChange={handleCategoryChange}
                          data-testid="categorie-select"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            <SelectItem value="__new__" className="text-blue-600 font-semibold">
                              + Nouvelle catégorie
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex space-x-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nom de la nouvelle catégorie"
                            onKeyPress={(e) => e.key === 'Enter' && handleNewCategoryConfirm()}
                            autoFocus
                          />
                          <Button type="button" size="sm" onClick={handleNewCategoryConfirm}>
                            ✓
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setShowNewCategoryInput(false)}
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Sous-catégories</Label>
                      <div className="space-y-2">
                        {formData.sous_categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.sous_categories.map((sc, index) => (
                              <div 
                                key={index} 
                                className={`${theme.bg100} ${theme.text700} px-3 py-1 rounded-full flex items-center space-x-2 text-sm`}
                              >
                                <span>{sc}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSousCategorie(index)}
                                  className={`${theme.textLight} ${theme.text700} hover:opacity-80 font-bold`}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Select 
                          value="" 
                          onValueChange={(value) => {
                            if (value === '__new__') {
                              // Permettre d'ajouter une nouvelle
                              const newCat = prompt('Nom de la nouvelle sous-catégorie :');
                              if (newCat && newCat.trim()) {
                                if (!formData.sous_categories.includes(newCat.trim())) {
                                  setFormData({
                                    ...formData,
                                    sous_categories: [...formData.sous_categories, newCat.trim()]
                                  });
                                  toast.success(`Sous-catégorie "${newCat.trim()}" créée !`);
                                }
                              }
                            } else if (value && !formData.sous_categories.includes(value)) {
                              setFormData({
                                ...formData,
                                sous_categories: [...formData.sous_categories, value]
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ajouter une sous-catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {sousCategories.map(sc => (
                              <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                            ))}
                            <SelectItem value="__new__" className="text-blue-600 font-semibold">
                              + Nouvelle sous-catégorie
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Sélectionnez une sous-catégorie existante ou créez-en une nouvelle
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Prix neuf (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.prix_neuf}
                          onChange={(e) => {
                            setFormData({ ...formData, prix_neuf: e.target.value });
                            setRemisePercentage(''); // Réinitialiser la remise
                          }}
                          data-testid="prix-neuf-input"
                        />
                      </div>
                      <div>
                        <Label>Prix achat (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.prix_achat}
                          onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
                          data-testid="prix-achat-input"
                        />
                      </div>
                    </div>

                    {/* Calculateur de remise */}
                    {formData.prix_neuf && (
                      <div className="bg-green-50 p-4 rounded-xl space-y-3">
                        <Label className="text-green-800 font-semibold">
                          💰 Calculateur de remise
                        </Label>
                        
                        {/* Boutons remises rapides */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {quickRemises.map(percent => (
                            <Button
                              key={percent}
                              type="button"
                              size="sm"
                              variant={remisePercentage === percent.toString() ? 'default' : 'outline'}
                              onClick={() => applyRemise(percent.toString())}
                              className="w-full"
                            >
                              -{percent}%
                            </Button>
                          ))}
                        </div>

                        {/* Remise personnalisée */}
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Input
                              type="number"
                              placeholder="Remise personnalisée (%)"
                              value={remisePercentage}
                              onChange={(e) => setRemisePercentage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  applyRemise(remisePercentage);
                                }
                              }}
                              className="border-green-300"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => applyRemise(remisePercentage)}
                            disabled={!remisePercentage}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Appliquer
                          </Button>
                        </div>

                        {/* Aperçu du calcul */}
                        {remisePercentage && (
                          <div className="text-sm text-green-800 bg-white p-2 rounded border border-green-200">
                            <p className="flex justify-between">
                              <span>Prix neuf :</span>
                              <span className="font-semibold">{formData.prix_neuf}€</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Remise ({remisePercentage}%) :</span>
                              <span className="font-semibold text-red-600">
                                -{(parseFloat(formData.prix_neuf) * parseFloat(remisePercentage) / 100).toFixed(2)}€
                              </span>
                            </p>
                            <p className="flex justify-between pt-2 border-t border-green-200 mt-2">
                              <span className="font-bold">Prix final :</span>
                              <span className="font-bold text-green-600">{formData.prix_vente}€</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prix de vente manuel */}
                    <div>
                      <Label>
                        Prix vente (€)
                        <span className="text-xs text-gray-500 ml-2">ou utilisez le calculateur ci-dessus</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.prix_vente}
                        onChange={(e) => {
                          setFormData({ ...formData, prix_vente: e.target.value });
                          setRemisePercentage(''); // Réinitialiser la remise si modification manuelle
                        }}
                        data-testid="prix-vente-input"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="public"
                      checked={formData.public}
                      onCheckedChange={(checked) => setFormData({ ...formData, public: checked })}
                      data-testid="public-checkbox"
                    />
                    <Label htmlFor="public">Afficher sur le catalogue public</Label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    <Button type="submit" className={`w-full ${theme.bg} ${theme.bgHover} py-6 sm:py-3`} data-testid="submit-article-button">
                      {selectedArticle ? 'Modifier' : 'Créer'}
                    </Button>
                    <Button type="button" variant="outline" className="w-full py-6 sm:py-3" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass rounded-2xl p-4 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par nom, référence, SKU ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${theme.borderInput} ${theme.focus}`}
                data-testid="search-input"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="filter-category">
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

            <Select value={selectedEtat} onValueChange={setSelectedEtat} data-testid="filter-etat">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select value={selectedSousCategoryFilter} onValueChange={setSelectedSousCategoryFilter} data-testid="filter-sous-category">
              <SelectTrigger className={theme.borderInput}>
                <SelectValue placeholder="Sous-catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sous-catégories</SelectItem>
                {sousCategories.map(sc => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType} data-testid="filter-type">
              <SelectTrigger className={theme.borderInput}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="piece">Pièce</SelectItem>
                <SelectItem value="liquide">Liquide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(selectedCategory !== 'all' || selectedEtat !== 'all' || selectedSousCategoryFilter !== 'all' || selectedType !== 'all') && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtres actifs :</span>
              {selectedCategory !== 'all' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCategory('all')}
                  className="h-7 px-2 text-xs"
                >
                  Cat: {selectedCategory} ×
                </Button>
              )}
              {selectedSousCategoryFilter !== 'all' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSousCategoryFilter('all')}
                  className="h-7 px-2 text-xs"
                >
                  Sous-cat: {selectedSousCategoryFilter} ×
                </Button>
              )}
              {selectedEtat !== 'all' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEtat('all')}
                  className="h-7 px-2 text-xs"
                >
                  État: {selectedEtat} ×
                </Button>
              )}
              {selectedType !== 'all' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedType('all')}
                  className="h-7 px-2 text-xs"
                >
                  Type: {selectedType === 'piece' ? 'Pièce' : 'Liquide'} ×
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSousCategoryFilter('all');
                  setSelectedEtat('all');
                  setSelectedType('all');
                }}
                className={`h-7 px-2 text-xs ${theme.textLight}`}
              >
                Réinitialiser tout
              </Button>
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="articles-list">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="glass rounded-2xl overflow-hidden shadow-md hover-lift"
              data-testid={`article-card-${article.id}`}
            >
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
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
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-400">B</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`${theme.bg} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                    #{article.id}
                  </span>
                </div>
                {article.public && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Public
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">{article.nom}</h3>
                <p className="text-sm text-gray-600 mb-1">Réf: {article.ref || 'N/A'}</p>
                <p className="text-xs text-gray-500 mb-2">SKU: {article.sku}</p>
                {article.categorie && (
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-semibold">Cat:</span> {article.categorie}
                  </p>
                )}
                {article.sous_categorie && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {article.sous_categorie.split(', ').map((sc, idx) => (
                      <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {sc}
                      </span>
                    ))}
                  </div>
                )}
                {article.type === 'piece' && article.etat && (
                  <span className={`inline-block px-2 py-1 ${theme.bg100} ${theme.text700} text-xs rounded-full mb-2`}>
                    {article.etat}
                  </span>
                )}
                {article.type === 'liquide' && (
                  <p className={`text-sm ${theme.textLight} font-semibold mb-2`}>
                    {article.litres || 0}L disponible
                  </p>
                )}
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedArticleView(article)}
                    data-testid={`view-article-${article.id}`}
                  >
                    👁️ Voir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(article)}
                    data-testid={`edit-article-${article.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(article.id)}
                    data-testid={`delete-article-${article.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl">
            <p className="text-gray-500">Aucun article trouvé</p>
          </div>
        )}
      </div>

      {/* Modal de visualisation d'article */}
      <Dialog open={!!selectedArticleView} onOpenChange={() => setSelectedArticleView(null)}>
        <DialogContent className="w-[95vw] sm:max-w-4xl h-[85vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          {selectedArticleView && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-2xl ${theme.text}`}>
                  {selectedArticleView.nom}
                  <span className="ml-3 text-sm text-gray-500">#{selectedArticleView.id}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Photos */}
                {selectedArticleView.photos && selectedArticleView.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedArticleView.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${selectedArticleView.nom} ${idx + 1}`}
                        className="w-full rounded-xl object-cover aspect-square"
                      />
                    ))}
                  </div>
                )}

                {/* Informations principales */}
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${theme.bgLight} p-4 rounded-xl`}>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Type</p>
                    <p className="font-semibold text-gray-900">
                      {selectedArticleView.type === 'piece' ? '🔧 Pièce' : '🛢️ Liquide'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Référence</p>
                    <p className="font-semibold text-gray-900">{selectedArticleView.ref || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">SKU</p>
                    <p className="font-semibold text-gray-900 font-mono text-sm">{selectedArticleView.sku}</p>
                  </div>
                  {selectedArticleView.categorie && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Catégorie</p>
                      <p className="font-semibold text-gray-900">{selectedArticleView.categorie}</p>
                    </div>
                  )}
                  {selectedArticleView.sous_categorie && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Sous-catégories</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedArticleView.sous_categorie.split(', ').map((sc, idx) => (
                          <span key={idx} className={`px-2 py-1 ${theme.bg100} ${theme.text700} text-xs rounded`}>
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedArticleView.etat && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">État</p>
                      <p className="font-semibold text-gray-900">{selectedArticleView.etat}</p>
                    </div>
                  )}
                  {selectedArticleView.lieu && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Lieu</p>
                      <p className="font-semibold text-gray-900">{selectedArticleView.lieu}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedArticleView.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-xl">{selectedArticleView.description}</p>
                  </div>
                )}

                {/* Info spécifiques liquides */}
                {selectedArticleView.type === 'liquide' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-xl">
                    {selectedArticleView.marque && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Marque</p>
                        <p className="font-semibold text-gray-900">{selectedArticleView.marque}</p>
                      </div>
                    )}
                    {selectedArticleView.litres && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Quantité actuelle</p>
                        <p className={`font-semibold ${theme.textLight}`}>{selectedArticleView.litres}L</p>
                      </div>
                    )}
                    {selectedArticleView.quantite_min && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Quantité min</p>
                        <p className="font-semibold text-gray-900">{selectedArticleView.quantite_min}L</p>
                      </div>
                    )}
                    {selectedArticleView.usage_hebdo && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Usage hebdo</p>
                        <p className="font-semibold text-gray-900">{selectedArticleView.usage_hebdo}L</p>
                      </div>
                    )}
                    {selectedArticleView.viscosite && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Viscosité</p>
                        <p className="font-semibold text-gray-900">{selectedArticleView.viscosite}</p>
                      </div>
                    )}
                    {selectedArticleView.norme && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Norme</p>
                        <p className="font-semibold text-gray-900">{selectedArticleView.norme}</p>
                      </div>
                    )}
                    {selectedArticleView.usage && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-600 mb-1">Usage</p>
                        <p className="font-semibold text-gray-900">{selectedArticleView.usage}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Info spécifiques pièces */}
                {selectedArticleView.type === 'piece' && (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${theme.bgLight} p-4 rounded-xl`}>
                    {selectedArticleView.marque && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Marque</p>
                        <p className="font-semibold text-gray-900">{selectedArticleView.marque}</p>
                      </div>
                    )}
                    {selectedArticleView.quantite && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Quantité en stock</p>
                        <p className="font-semibold text-gray-900 text-lg">{selectedArticleView.quantite} unité(s)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Prix */}
                <div className="grid grid-cols-3 gap-4 bg-green-50 p-4 rounded-xl">
                  {selectedArticleView.prix_neuf && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Prix neuf</p>
                      <p className="font-semibold text-gray-900">{selectedArticleView.prix_neuf}€</p>
                    </div>
                  )}
                  {selectedArticleView.prix_achat && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Prix achat</p>
                      <p className="font-semibold text-gray-900">{selectedArticleView.prix_achat}€</p>
                    </div>
                  )}
                  {selectedArticleView.prix_vente && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Prix vente</p>
                      <p className="font-semibold text-green-600 text-lg">{selectedArticleView.prix_vente}€</p>
                    </div>
                  )}
                </div>

                {/* Métadonnées */}
                <div className="text-xs text-gray-500 pt-4 border-t space-y-1">
                  <p>Posté par : <span className="font-semibold">{selectedArticleView.posted_by}</span></p>
                  <p>Date : <span className="font-semibold">
                    {new Date(selectedArticleView.date_post).toLocaleDateString('fr-FR')}
                  </span></p>
                  <p>Visibilité : <span className={`font-semibold ${selectedArticleView.public ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedArticleView.public ? '✓ Public' : '✗ Privé'}
                  </span></p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setSelectedArticleView(null);
                      handleEdit(selectedArticleView);
                    }}
                    className={`w-full ${theme.bg} ${theme.bgHover} py-6 sm:py-3`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedArticleView(null)}
                    className="w-full py-6 sm:py-3"
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

export default Inventaire;
