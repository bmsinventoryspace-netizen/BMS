import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPubs = () => {
  const [pubs, setPubs] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'pub',
    nom: '',
    description: '',
    image: null,
    duree_jours: 30,
  });

  useEffect(() => {
    fetchPubs();
  }, []);

  const fetchPubs = async () => {
    try {
      const response = await axios.get(`${API}/pubs`);
      setPubs(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      await axios.post(`${API}/pubs`, formData);
      toast.success(formData.type === 'pub' ? 'Pub créée' : 'Offre créée');
      setShowDialog(false);
      setFormData({ type: 'pub', nom: '', description: '', image: null, duree_jours: 30 });
      fetchPubs();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ?')) return;

    try {
      await axios.delete(`${API}/pubs/${id}`);
      toast.success('Supprimé');
      fetchPubs();
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const pubsList = pubs.filter(p => p.type === 'pub');
  const offresList = pubs.filter(p => p.type === 'offre');

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-pubs-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Pubs & Offres</h1>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700" data-testid="add-pub-button">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="pub-dialog">
              <DialogHeader>
                <DialogTitle>Créer une pub ou offre</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} data-testid="pub-type-select">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pub">Publicité</SelectItem>
                      <SelectItem value="offre">Offre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                    data-testid="pub-nom-input"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="pub-description-input"
                  />
                </div>
                <div>
                  <Label>Image (optionnel)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full border border-gray-300 rounded-md p-2"
                    data-testid="pub-image-input"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-2 w-full max-h-48 object-cover rounded-lg" />
                  )}
                </div>
                <div>
                  <Label>Durée de mise en ligne (jours)</Label>
                  <Input
                    type="number"
                    value={formData.duree_jours}
                    onChange={(e) => setFormData({ ...formData, duree_jours: parseInt(e.target.value) })}
                    data-testid="pub-duree-input"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" data-testid="pub-submit-button">
                    Créer
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pubs */}
        <div className="glass rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Publicités actives</h2>
          {pubsList.length === 0 ? (
            <p className="text-gray-500">Aucune pub active</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pubsList.map(pub => (
                <div key={pub.id} className="bg-white rounded-xl p-4 shadow-sm" data-testid={`pub-${pub.id}`}>
                  {pub.image && (
                    <LazyLoadImage
                      src={pub.image}
                      alt={pub.nom}
                      effect="blur"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-bold text-gray-900 mb-2">{pub.nom}</h3>
                  {pub.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pub.description}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Fin: {new Date(pub.duree_fin).toLocaleDateString()}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDelete(pub.id)}
                    data-testid={`delete-pub-${pub.id}`}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offres */}
        <div className="glass rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Offres actives</h2>
          {offresList.length === 0 ? (
            <p className="text-gray-500">Aucune offre active</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offresList.map(offre => (
                <div key={offre.id} className="bg-white rounded-xl p-4 shadow-sm" data-testid={`offre-${offre.id}`}>
                  {offre.image && (
                    <LazyLoadImage
                      src={offre.image}
                      alt={offre.nom}
                      effect="blur"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-bold text-gray-900 mb-2">{offre.nom}</h3>
                  {offre.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offre.description}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Fin: {new Date(offre.duree_fin).toLocaleDateString()}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDelete(offre.id)}
                    data-testid={`delete-offre-${offre.id}`}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPubs;
