import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import Layout from '../components/Layout';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, socket } = useContext(AuthContext);
  const { theme } = useTheme();
  const [memo, setMemo] = useState('');
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [postits, setPostits] = useState([]);
  const [currentPostitIndex, setCurrentPostitIndex] = useState(0);
  const [newPostit, setNewPostit] = useState({ objet: '', message: '', photo: null });
  const [showPostitForm, setShowPostitForm] = useState(false);
  const [agendaEvents, setAgendaEvents] = useState([]);

  useEffect(() => {
    fetchMemo();
    fetchTodos();
    fetchPostits();
    fetchAgenda();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (data) => {
        if (data.type === 'postit_created' || data.type === 'postit_checked' || data.type === 'postit_deleted') {
          fetchPostits();
        }
      });
    }
  }, [socket]);

  const fetchMemo = async () => {
    try {
      const response = await axios.get(`${API}/memo`);
      setMemo(response.data.content || '');
    } catch (error) {
      console.error('Error fetching memo:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API}/todos`);
      setTodos(response.data.items || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const fetchPostits = async () => {
    try {
      const response = await axios.get(`${API}/postits`);
      // Inverser l'ordre : le plus ancien en premier (index 0), le plus récent en dernier
      const sortedPostits = response.data.reverse();
      setPostits(sortedPostits);
      // Si on était sur un post-it qui n'existe plus, revenir au dernier
      if (currentPostitIndex >= sortedPostits.length && sortedPostits.length > 0) {
        setCurrentPostitIndex(sortedPostits.length - 1);
      }
    } catch (error) {
      console.error('Error fetching postits:', error);
    }
  };

  const fetchAgenda = async () => {
    try {
      const response = await axios.get(`${API}/agenda`);
      const upcoming = response.data
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
      setAgendaEvents(upcoming);
    } catch (error) {
      console.error('Error fetching agenda:', error);
    }
  };

  const handleMemoChange = async (value) => {
    setMemo(value);
    try {
      await axios.put(`${API}/memo`, { content: value });
    } catch (error) {
      console.error('Error updating memo:', error);
    }
  };

  const handleTodoChange = async (index, field, value) => {
    const newTodos = [...todos];
    newTodos[index][field] = value;
    setTodos(newTodos);
    
    try {
      await axios.put(`${API}/todos`, { items: newTodos });
    } catch (error) {
      console.error('Error updating todos:', error);
    }
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodos = [...todos, { text: newTodo, done: false }];
      setTodos(newTodos);
      setNewTodo('');
      axios.put(`${API}/todos`, { items: newTodos });
    }
  };

  const deleteTodo = async (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
    try {
      await axios.put(`${API}/todos`, { items: newTodos });
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handlePostitSubmit = async () => {
    if (!newPostit.objet || !newPostit.message) {
      toast.error('Objet et message requis');
      return;
    }

    try {
      await axios.post(`${API}/postits`, newPostit);
      toast.success('Post-it créé');
      setNewPostit({ objet: '', message: '', photo: null });
      setShowPostitForm(false);
      fetchPostits();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handlePostitCheck = async (postitId) => {
    try {
      await axios.post(`${API}/postits/${postitId}/check`);
      fetchPostits();
    } catch (error) {
      console.error('Error checking postit:', error);
    }
  };

  const handlePostitDelete = async (postitId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post-it ?')) return;
    
    try {
      await axios.delete(`${API}/postits/${postitId}`);
      toast.success('Post-it supprimé');
      // Ajuster l'index si nécessaire
      if (currentPostitIndex >= postits.length - 1 && currentPostitIndex > 0) {
        setCurrentPostitIndex(currentPostitIndex - 1);
      }
      fetchPostits();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting postit:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostit({ ...newPostit, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPostit = postits[currentPostitIndex];

  return (
    <Layout>
      <div className="space-y-6" data-testid="dashboard-page">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-600">
            Bonjour, <span className={`font-semibold ${theme.textLight}`}>{user?.username}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Memo */}
          <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-md" data-testid="memo-section">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tableau blanc</h2>
            <Textarea
              value={memo}
              onChange={(e) => handleMemoChange(e.target.value)}
              placeholder="Écrivez vos notes ici..."
              className={`min-h-[300px] ${theme.borderInput} ${theme.focus} resize-none`}
              data-testid="memo-textarea"
            />
          </div>

          {/* Post-it */}
          <div className="glass rounded-2xl p-6 shadow-md" data-testid="postit-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Post-it équipe</h2>
              <Button
                size="sm"
                className={`${theme.bg} ${theme.bgHover}`}
                onClick={() => setShowPostitForm(!showPostitForm)}
                data-testid="new-postit-button"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {showPostitForm ? (
              <div className="space-y-3" data-testid="postit-form">
                <Input
                  placeholder="Objet"
                  value={newPostit.objet}
                  onChange={(e) => setNewPostit({ ...newPostit, objet: e.target.value })}
                  className={theme.borderInput}
                  data-testid="postit-objet-input"
                />
                <Textarea
                  placeholder="Message"
                  value={newPostit.message}
                  onChange={(e) => setNewPostit({ ...newPostit, message: e.target.value })}
                  className={theme.borderInput}
                  data-testid="postit-message-input"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm"
                  data-testid="postit-image-input"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handlePostitSubmit}
                    data-testid="postit-submit-button"
                  >
                    Poster
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPostitForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : currentPostit ? (
              <div className="space-y-3" data-testid="postit-display">
                <div className="bg-yellow-100 p-4 rounded-xl shadow-sm relative">
                  <button
                    onClick={() => handlePostitDelete(currentPostit.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-gray-900 mb-2 pr-8">{currentPostit.objet}</h3>
                  <p className="text-gray-700 text-sm mb-3">{currentPostit.message}</p>
                  {currentPostit.photo && (
                    <LazyLoadImage
                      src={currentPostit.photo}
                      alt="Post-it"
                      effect="blur"
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Par {currentPostit.posted_by}</span>
                    <span>{new Date(currentPostit.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={currentPostit.checks?.includes(user?.username) ? 'secondary' : 'default'}
                    className="flex-1"
                    onClick={() => handlePostitCheck(currentPostit.id)}
                    data-testid="postit-check-button"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {currentPostit.checks?.includes(user?.username) ? 'Vu' : 'Marquer comme vu'}
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPostit.checks?.length || 0} vu(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentPostitIndex(Math.min(postits.length - 1, currentPostitIndex + 1))}
                    disabled={currentPostitIndex === postits.length - 1}
                    data-testid="postit-prev-button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPostitIndex + 1} / {postits.length}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentPostitIndex(Math.max(0, currentPostitIndex - 1))}
                    disabled={currentPostitIndex === 0}
                    data-testid="postit-next-button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun post-it pour le moment</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* To-do List */}
          <div className="glass rounded-2xl p-6 shadow-md" data-testid="todo-section">
            <h2 className="text-xl font-bold text-gray-900 mb-4">À faire</h2>
            <div className="space-y-2 mb-4">
              {todos.map((todo, index) => (
                <div key={index} className="flex items-center space-x-2 group" data-testid={`todo-item-${index}`}>
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={(checked) => handleTodoChange(index, 'done', checked)}
                    data-testid={`todo-checkbox-${index}`}
                  />
                  <span className={`flex-1 ${todo.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {todo.text}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => deleteTodo(index)}
                    data-testid={`todo-delete-${index}`}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Nouvelle tâche..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                className="border-blue-200"
                data-testid="todo-input"
              />
              <Button
                onClick={addTodo}
                className={`${theme.bg} ${theme.bgHover}`}
                data-testid="todo-add-button"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Agenda */}
          <div className="glass rounded-2xl p-6 shadow-md" data-testid="agenda-section">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Événements à venir</h2>
            <div className="space-y-3">
              {agendaEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun événement prévu</p>
              ) : (
                agendaEvents.map((event) => (
                  <div key={event.id} className={`${theme.bgLight} p-3 rounded-xl`} data-testid={`agenda-event-${event.id}`}>
                    <h3 className="font-semibold text-gray-900">{event.titre}</h3>
                    <p className={`text-sm ${theme.textLight}`}>
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
