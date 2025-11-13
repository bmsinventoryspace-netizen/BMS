import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PostItPage = () => {
  const { user, socket } = useContext(AuthContext);
  const [postits, setPostits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ objet: '', message: '', photo: null });

  useEffect(() => {
    fetchPostits();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (data) => {
        if (data.type === 'postit_created' || data.type === 'postit_checked') {
          fetchPostits();
        }
      });
    }
  }, [socket]);

  const fetchPostits = async () => {
    try {
      const response = await axios.get(`${API}/postits`);
      setPostits(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const handleSubmit = async () => {
    if (!formData.objet || !formData.message) {
      toast.error('Objet et message requis');
      return;
    }

    try {
      await axios.post(`${API}/postits`, formData);
      toast.success('Post-it créé');
      setFormData({ objet: '', message: '', photo: null });
      setShowForm(false);
      fetchPostits();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleCheck = async (postitId) => {
    try {
      await axios.post(`${API}/postits/${postitId}/check`);
      fetchPostits();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPostit = postits[currentIndex];

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto" data-testid="postit-page">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Post-it Équipe</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="new-postit-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau
          </Button>
        </div>

        {showForm ? (
          <div className="glass rounded-2xl p-8 shadow-lg" data-testid="postit-form">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer un post-it</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Objet</label>
                <Input
                  placeholder="Titre du post-it"
                  value={formData.objet}
                  onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                  className="border-blue-200"
                  data-testid="postit-objet-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <Textarea
                  placeholder="Votre message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="border-blue-200 min-h-[150px]"
                  data-testid="postit-message-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-md p-2"
                  data-testid="postit-photo-input"
                />
                {formData.photo && (
                  <img src={formData.photo} alt="Preview" className="mt-2 w-full max-h-48 object-cover rounded-lg" />
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="postit-submit-button"
                >
                  Poster
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        ) : currentPostit ? (
          <div className="space-y-6" data-testid="postit-display">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl p-8 shadow-2xl" style={{ minHeight: '400px' }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentPostit.objet}</h2>
              <p className="text-lg text-gray-800 mb-6 whitespace-pre-wrap">{currentPostit.message}</p>
              
              {currentPostit.photo && (
                <LazyLoadImage
                  src={currentPostit.photo}
                  alt="Post-it"
                  effect="blur"
                  className="w-full max-h-64 object-cover rounded-xl mb-6 shadow-md"
                />
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-yellow-300">
                <div className="text-sm text-gray-700">
                  <p><span className="font-semibold">Posté par:</span> {currentPostit.posted_by}</p>
                  <p><span className="font-semibold">Date:</span> {new Date(currentPostit.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-sm text-gray-700">
                  <p>{currentPostit.checks?.length || 0} personne(s) ont vu</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant={currentPostit.checks?.includes(user?.username) ? 'secondary' : 'default'}
                  className={currentPostit.checks?.includes(user?.username) ? '' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={() => handleCheck(currentPostit.id)}
                  data-testid="check-postit-button"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {currentPostit.checks?.includes(user?.username) ? 'Marqué comme vu' : 'Marquer comme vu'}
                </Button>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    data-testid="prev-postit-button"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600 font-medium">
                    {currentIndex + 1} / {postits.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(Math.min(postits.length - 1, currentIndex + 1))}
                    disabled={currentIndex === postits.length - 1}
                    data-testid="next-postit-button"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {currentPostit.checks && currentPostit.checks.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Vu par:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentPostit.checks.map((username, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        {username}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl">
            <p className="text-gray-500 text-lg">Aucun post-it pour le moment</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostItPage;
