import React, { useContext, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { AuthContext } from '../App';
import { useTheme } from '../hooks/useTheme';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Deals = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    lien: '',
    prix: '',
    prix_ref: '',
    image: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const submitDeal = async () => {
    if (!form.nom || !form.prix) {
      toast.error('Nom et prix sont obligatoires');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/deals`, {
        nom: form.nom,
        description: form.description || undefined,
        lien: form.lien || undefined,
        prix: parseFloat(form.prix),
        prix_ref: form.prix_ref ? parseFloat(form.prix_ref) : undefined,
        image: form.image || undefined,
      });
      toast.success('Deal posté avec succès');
      setForm({ nom: '', description: '', lien: '', prix: '', prix_ref: '', image: '' });
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Échec de l'envoi du deal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${theme.text}`}>Deals</h1>
        <Button className={`${theme.bg} ${theme.bgHover} text-white`} onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Poster un deal
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className={`text-xl ${theme.text}`}>Nouveau Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Photo</label>
              <Input type="file" accept="image/*" onChange={onFileChange} />
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-32 rounded-lg object-cover" />}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nom</label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Lien (cliquable)</label>
              <Input value={form.lien} onChange={(e) => setForm({ ...form, lien: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Prix</label>
                <Input type="number" step="0.01" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Prix de référence</label>
                <Input type="number" step="0.01" value={form.prix_ref} onChange={(e) => setForm({ ...form, prix_ref: e.target.value })} />
              </div>
            </div>
            <div className="pt-2">
              <Button disabled={submitting} className={`${theme.bg} ${theme.bgHover} text-white w-full`} onClick={submitDeal}>
                {submitting ? 'Envoi...' : 'Poster'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Deals;


