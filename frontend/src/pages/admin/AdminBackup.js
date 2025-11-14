import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Download, Database, Calendar, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminBackup = () => {
  const [backupInfo, setBackupInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchBackupInfo();
  }, []);

  const fetchBackupInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/backup/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackupInfo(response.data);
    } catch (error) {
      console.error('Error fetching backup info:', error);
      console.error('Request URL:', `${API}/backup/info`);
      if (error.response?.status === 404) {
        toast.error('Endpoint non trouvé. Le backend doit être redéployé sur Render.');
      } else {
        toast.error('Erreur lors du chargement des informations');
      }
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDownloadBackup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/backup`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Vérifier si la réponse est valide
      if (!response.data) {
        throw new Error('Réponse vide du serveur');
      }

      // Créer un blob avec le type correct
      const blob = new Blob([response.data], { type: 'application/json;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `bms_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;
      
      if (contentDisposition) {
        // Gérer les différents formats de Content-Disposition
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/) || 
                             contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer après un court délai
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Sauvegarde téléchargée avec succès !');
    } catch (error) {
      console.error('Error downloading backup:', error);
      console.error('Error response:', error.response);
      console.error('Request URL:', `${API}/backup`);
      
      let errorMessage = 'Erreur lors du téléchargement de la sauvegarde';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Endpoint non trouvé. Le backend doit être redéployé sur Render.';
        } else if (error.response.status === 403) {
          errorMessage = 'Accès refusé. Vous devez être administrateur.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Sauvegarde</h1>
          <p className="text-gray-600 mt-2">
            Sauvegardez toutes vos données d'inventaire de manière sécurisée
          </p>
        </div>

        {/* Informations sur les données */}
        {loadingInfo ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </CardContent>
          </Card>
        ) : backupInfo ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Informations sur les données
              </CardTitle>
              <CardDescription>
                Aperçu des données qui seront sauvegardées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{backupInfo.counts.articles}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{backupInfo.counts.users}</div>
                  <div className="text-sm text-gray-600">Utilisateurs</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{backupInfo.counts.commandes}</div>
                  <div className="text-sm text-gray-600">Commandes</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{backupInfo.counts.postits}</div>
                  <div className="text-sm text-gray-600">Post-its</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Taille estimée :</span>
                  <span className="font-bold text-gray-900">{backupInfo.estimated_size_mb} MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Instructions de sauvegarde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Ce qui sera sauvegardé :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Tous les articles de l'inventaire (pièces et liquides)</li>
                <li>Les utilisateurs (sans les mots de passe pour la sécurité)</li>
                <li>Les paramètres de l'application (logo, couleurs, numéros)</li>
                <li>Les commandes</li>
                <li>Les post-its d'équipe</li>
                <li>Les événements de l'agenda</li>
                <li>Les publicités et offres</li>
                <li>Les statistiques de vues</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Recommandation :</strong> Effectuez une sauvegarde au moins une fois par semaine. 
                  Stockez le fichier dans un endroit sécurisé (Google Drive, Dropbox, disque externe, etc.).
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <strong>Format :</strong> Le fichier de sauvegarde est au format JSON, 
                  ce qui permet de le lire facilement et de le restaurer si nécessaire.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de téléchargement */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Créer une sauvegarde maintenant
                </h3>
                <p className="text-sm text-gray-600">
                  Téléchargez un fichier JSON contenant toutes vos données
                </p>
              </div>
              <Button
                onClick={handleDownloadBackup}
                disabled={loading}
                className={`${theme.bg} ${theme.bgHover} text-white px-8 py-6 text-lg`}
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger la sauvegarde
                  </>
                )}
              </Button>
              {backupInfo && (
                <p className="text-xs text-gray-500 text-center">
                  Taille estimée : {backupInfo.estimated_size_mb} MB
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Note sur la restauration */}
        <Card>
          <CardHeader>
            <CardTitle>Restauration des données</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Pour restaurer une sauvegarde, contactez le support technique. 
              La restauration nécessite un accès direct à la base de données.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminBackup;

