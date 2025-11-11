import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import Layout from '../components/Layout';
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
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSousCategory, setSelectedSousCategory] = useState('all');
  const [selectedEtat, setSelectedEtat] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleType, setArticleType] = useState('piece');
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [formData, setFormData] = useState(getEmptyFormData());
  const [photos, setPhotos] = useState([]);
  const [newSousCategorie, setNewSousCategorie] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory, selectedSousCategory, selectedEtat, selectedType]);

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
      setSousCategories(response.data.sous_categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    const sousCategories = article.sous_categorie 
      ? (Array.isArray(article.sous_categorie) ? article.sous_categorie : [article.sous_categorie])
      : [];
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

  const openReferenceSearch = () => {
    if (formData.nom) {
      const url = `https://www.google.com/search?q=${encodeURIComponent(formData.nom + ' fiche technique')}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const openAddDialog = () => {
    setSelectedArticle(null);
    setFormData(getEmptyFormData());
    setPhotos([]);
    setArticleType('piece');
    setShowAddDialog(true);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="inventaire-page">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">Inventaire</h1>
          <div className="flex space-x-3">
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              data-testid="export-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={openAddDialog}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="add-article-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="article-dialog">
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
                      onChange={handleImageUpload}
                      className="w-full border border-gray-300 rounded-md p-2"
                      data-testid="photo-input"
                    />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom *</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          required
                          data-testid="nom-input"
                        />
                        <Button type="button" size="icon" variant="outline" onClick={openReferenceSearch}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Référence</Label>
                      <Input
                        value={formData.ref}
                        onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                        data-testid="ref-input"
                      />
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

                      <div className="grid grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-3 gap-4">
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
                          <Label>Quantité min souhaitée</Label>
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

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Marque</Label>
                          <Input
                            value={formData.marque}
                            onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                            data-testid="marque-input"
                          />
                        </div>
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
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2 text-sm"
                              >
                                <span>{sc}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSousCategorie(index)}
                                  className="text-blue-600 hover:text-blue-800 font-bold"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <Input
                            value={newSousCategorie}
                            onChange={(e) => setNewSousCategorie(e.target.value)}
                            placeholder="Ajouter une sous-catégorie"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSousCategorie())}
                            list="sous-categories-list"
                            data-testid="sous-categorie-input"
                          />
                          <Button 
                            type="button" 
                            onClick={addSousCategorie}
                            disabled={!newSousCategorie.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <datalist id="sous-categories-list">
                          {sousCategories.map(sc => <option key={sc} value={sc} />)}
                        </datalist>
                        <p className="text-xs text-gray-500">
                          Appuyez sur Entrée ou cliquez sur + pour ajouter
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Prix neuf (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.prix_neuf}
                        onChange={(e) => setFormData({ ...formData, prix_neuf: e.target.value })}
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
                    <div>
                      <Label>Prix vente (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.prix_vente}
                        onChange={(e) => setFormData({ ...formData, prix_vente: e.target.value })}
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

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" data-testid="submit-article-button">
                      {selectedArticle ? 'Modifier' : 'Créer'}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="glass rounded-2xl p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, référence, SKU ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400"
              data-testid="search-input"
            />
          </div>
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
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-400">B</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
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
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
                    {article.etat}
                  </span>
                )}
                {article.type === 'liquide' && (
                  <p className="text-sm text-blue-600 font-semibold mb-2">
                    {article.litres || 0}L disponible
                  </p>
                )}
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(article)}
                    data-testid={`edit-article-${article.id}`}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
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
    </Layout>
  );
};

export default Inventaire;
