import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AgendaPage = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    date: '',
    description: '',
    invites: [],
  });

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/agenda`);
      setEvents(response.data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titre || !formData.date) {
      toast.error('Titre et date requis');
      return;
    }

    try {
      await axios.post(`${API}/agenda`, formData);
      toast.success('Événement créé');
      setShowDialog(false);
      setFormData({ titre: '', date: '', description: '', invites: [] });
      fetchEvents();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      await axios.delete(`${API}/agenda/${id}`);
      toast.success('Événement supprimé');
      fetchEvents();
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  const toggleInvite = (username) => {
    const invites = [...formData.invites];
    const index = invites.indexOf(username);
    if (index > -1) {
      invites.splice(index, 1);
    } else {
      invites.push(username);
    }
    setFormData({ ...formData, invites });
  };

  const groupEventsByMonth = () => {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.date);
      const monthKey = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByMonth();

  return (
    <Layout>
      <div className="space-y-6" data-testid="agenda-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Agenda</h1>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-event-button">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="event-dialog">
              <DialogHeader>
                <DialogTitle>Créer un événement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Titre *</Label>
                  <Input
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    required
                    data-testid="event-titre-input"
                  />
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    data-testid="event-date-input"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="event-description-input"
                  />
                </div>
                <div>
                  <Label>Inviter des employés</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {users.map(u => (
                      <div key={u.username} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${u.username}`}
                          checked={formData.invites.includes(u.username)}
                          onCheckedChange={() => toggleInvite(u.username)}
                          data-testid={`invite-${u.username}`}
                        />
                        <label htmlFor={`user-${u.username}`} className="text-sm text-gray-700">
                          {u.username}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" data-testid="event-submit-button">
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

        {/* Events Timeline */}
        <div className="space-y-6">
          {Object.keys(groupedEvents).length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun événement prévu</p>
            </div>
          ) : (
            Object.keys(groupedEvents).map(month => (
              <div key={month} className="glass rounded-2xl p-6 shadow-md" data-testid={`month-${month}`}>
                <h2 className="text-2xl font-bold text-blue-900 mb-4 capitalize">{month}</h2>
                <div className="space-y-4">
                  {groupedEvents[month].map(event => {
                    const eventDate = new Date(event.date);
                    const isPast = eventDate < new Date();
                    const isInvited = event.invites?.includes(user?.username);

                    return (
                      <div
                        key={event.id}
                        className={`bg-gradient-to-r ${
                          isPast
                            ? 'from-gray-100 to-gray-200'
                            : isInvited
                            ? 'from-blue-100 to-blue-200'
                            : 'from-green-100 to-green-200'
                        } rounded-xl p-4 flex items-start justify-between`}
                        data-testid={`event-${event.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center shadow-sm">
                              <span className="text-xs text-gray-500">
                                {eventDate.toLocaleDateString('fr-FR', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                {eventDate.getDate()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{event.titre}</h3>
                              <p className="text-sm text-gray-600">
                                {eventDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
                              </p>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-gray-700 ml-15">{event.description}</p>
                          )}
                          {event.invites && event.invites.length > 0 && (
                            <div className="ml-15 mt-2">
                              <p className="text-xs text-gray-600 mb-1">Invités:</p>
                              <div className="flex flex-wrap gap-1">
                                {event.invites.map((username, idx) => (
                                  <span key={idx} className="bg-white px-2 py-1 rounded-full text-xs text-gray-700">
                                    {username}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(event.id)}
                          data-testid={`delete-event-${event.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AgendaPage;
