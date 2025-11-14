import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/commandes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommandes(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (commandeId, nouveauStatut) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/commandes/${commandeId}/statut`,
        { statut: nouveauStatut },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast({
        title: 'Succès',
        description: 'Statut mis à jour'
      });
      fetchCommandes();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive'
      });
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'validee':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Validée</Badge>;
      case 'annulee':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Annulée</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6">
      <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 mb-6">Gestion des Commandes</h1>

      {commandes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Aucune commande pour le moment</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {commandes.map((commande) => (
            <Card key={commande.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-blue-900">Commande #{commande.numero}</h3>
                    {getStatutBadge(commande.statut)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Date: {formatDate(commande.date)}
                  </p>
                  <p className="text-sm text-gray-700">
                    {commande.items.length} article{commande.items.length > 1 ? 's' : ''} • Total: <span className="font-bold text-blue-600">{commande.total.toFixed(2)}€</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCommande(commande)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                  {commande.statut === 'en_attente' && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateStatut(commande.id, 'validee')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Valider
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateStatut(commande.id, 'annulee')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Détails Commande */}
      <Dialog open={!!selectedCommande} onOpenChange={() => setSelectedCommande(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCommande && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-blue-900">
                  Commande #{selectedCommande.numero}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Statut:</span>
                  {getStatutBadge(selectedCommande.statut)}
                </div>
                <div>
                  <span className="font-semibold">Date:</span>
                  <p className="text-gray-700">{formatDate(selectedCommande.date)}</p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-bold text-lg mb-3">Articles:</h4>
                  <div className="space-y-2">
                    {selectedCommande.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{item.nom}</p>
                          {item.ref && <p className="text-sm text-gray-600">Réf: {item.ref}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.prix_vente}€ × {item.quantite}</p>
                          <p className="text-blue-600 font-bold">{(item.prix_vente * item.quantite).toFixed(2)}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">{selectedCommande.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommandes;

