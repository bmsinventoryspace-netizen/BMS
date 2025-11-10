import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminEmployes = () => {
  const [users, setUsers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'employee',
    phone: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username) {
      toast.error('Le nom d\'utilisateur est requis');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Le mot de passe est requis');
      return;
    }

    try {
      if (editingUser) {
        await axios.put(`${API}/users/${editingUser.username}`, formData);
        toast.success('Employé modifié');
      } else {
        await axios.post(`${API}/users`, formData);
        toast.success('Employé créé');
      }
      setShowDialog(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'employee', phone: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      phone: user.phone || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${username} ?`)) return;

    try {
      await axios.delete(`${API}/users/${username}`);
      toast.success('Employé supprimé');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de suppression');
    }
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'employee', phone: '' });
    setShowDialog(true);
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-employes-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Gestion des employés</h1>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-user-button">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un employé
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="user-dialog">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Modifier l\'employé' : 'Nouvel employé'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nom d'utilisateur *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!!editingUser}
                    required
                    data-testid="username-input"
                  />
                </div>
                <div>
                  <Label>Mot de passe {editingUser ? '(laisser vide pour ne pas modifier)' : '*'}</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    data-testid="password-input"
                  />
                </div>
                <div>
                  <Label>Rôle</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} data-testid="role-select">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employé</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="phone-input"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" data-testid="user-submit-button">
                    {editingUser ? 'Modifier' : 'Créer'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="glass rounded-2xl p-6 shadow-md">
          <div className="space-y-3">
            {users.map(user => (
              <div
                key={user.username}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
                data-testid={`user-${user.username}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${
                    user.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'
                  } rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.username}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Employé'}
                      </span>
                      {user.phone && (
                        <span className="text-sm text-gray-600">{user.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
                {user.username !== 'AdminLudo' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                      data-testid={`edit-user-${user.username}`}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.username)}
                      data-testid={`delete-user-${user.username}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEmployes;
