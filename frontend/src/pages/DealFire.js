import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useTheme } from '../hooks/useTheme';
import { AuthContext } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const discountOf = (prix, prixRef) => {
  if (!prix || !prixRef || prixRef <= 0) return null;
  const pct = Math.round(((prixRef - prix) / prixRef) * 100);
  return pct > 0 ? pct : null;
};

// Component to load deal image on-demand
const DealThumbnail = ({ dealId, dealNom }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loading) {
          const loadImage = async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await axios.get(`${API}/deals/${dealId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.data.image) {
                setImage(response.data.image);
              }
            } catch (error) {
              console.error('Error loading deal image:', error);
            } finally {
              setLoading(false);
            }
          };
          loadImage();
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, dealId, loading]);

  return (
    <div ref={setRef} className="w-full h-full">
      {loading ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-400">🔥</span>
        </div>
      ) : image ? (
        <img src={image} alt={dealNom} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <span className="text-4xl font-bold text-gray-400">🔥</span>
        </div>
      )}
    </div>
  );
};

const DealFire = () => {
  const { theme } = useTheme();
  const { socket } = useContext(AuthContext);
  const [deals, setDeals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hasNew, setHasNew] = useState(false);
  const [error, setError] = useState(null);
  const [loadingDealDetails, setLoadingDealDetails] = useState(false);

  const loadDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/deals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeals(res.data);
      setError(null);
    } catch (e) {
      console.error('DealFire load error:', e);
      setError(e?.response?.data?.detail || 'Erreur de chargement');
    }
  };

  const loadDealDetails = async (dealId) => {
    try {
      setLoadingDealDetails(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelected(response.data);
    } catch (error) {
      console.error('Error loading deal details:', error);
    } finally {
      setLoadingDealDetails(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (event) => {
      try {
        const msg = typeof event?.data === 'string' ? JSON.parse(event.data) : event;
        if (msg?.type === 'deal_created') {
          setHasNew(true);
          loadDeals();
        }
      } catch {}
    };
    if (typeof socket.addEventListener === 'function') {
      socket.addEventListener('message', onMessage);
      return () => socket.removeEventListener('message', onMessage);
    }
    if (typeof socket.on === 'function') {
      socket.on('message', onMessage);
      return () => {
        if (typeof socket.off === 'function') socket.off('message', onMessage);
      };
    }
  }, [socket]);

  return (
    <Layout>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${theme.text}`}>DealFire</h1>
        {hasNew && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-white bg-red-600 animate-pulse">
            Nouveau
          </span>
        )}
      </div>

      {deals.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Aucun deal pour le moment</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((d) => {
            const pct = discountOf(d.prix, d.prix_ref);
            return (
              <div key={d.id} className="glass rounded-2xl overflow-hidden shadow-md">
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                  {d.has_image ? (
                    <DealThumbnail dealId={d.id} dealNom={d.nom} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-400">🔥</span>
                    </div>
                  )}
                  {d.disponible === false && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-4xl font-extrabold text-red-600 drop-shadow-md">OOS</span>
                    </div>
                  )}
                  {pct && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      -{pct}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{d.nom}</h3>
                  {d.prix != null && (
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xl font-bold ${theme.textLight}`}>{d.prix}€</span>
                      {d.prix_ref && d.prix_ref !== d.prix && (
                        <span className="text-sm text-gray-500 line-through">{d.prix_ref}€</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Button className={`${theme.bg} ${theme.bgHover} text-white`} onClick={() => loadDealDetails(d.id)}>
                      Voir
                    </Button>
                    {d.lien && (
                      <Button variant="outline" onClick={() => window.open(d.lien, '_blank', 'noopener')}>
                        Je veux ce deal
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected || loadingDealDetails} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {loadingDealDetails ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des détails...</p>
            </div>
          ) : selected ? (
            <>
              <DialogHeader>
                <DialogTitle className={`text-2xl ${theme.text}`}>{selected.nom}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selected.image && (
                  <img src={selected.image} alt={selected.nom} className="w-full rounded-xl object-cover max-h-96" />
                )}
                {selected.description && <p className="text-gray-900">{selected.description}</p>}
                <div className="flex items-center gap-4">
                  {selected.prix != null && <span className={`text-2xl font-bold ${theme.textLight}`}>{selected.prix}€</span>}
                  {selected.prix_ref && selected.prix_ref !== selected.prix && (
                    <span className="text-gray-500 line-through">{selected.prix_ref}€</span>
                  )}
                </div>
                {selected.lien && (
                  <Button className={`${theme.bg} ${theme.bgHover} text-white`} onClick={() => window.open(selected.lien, '_blank', 'noopener')}>
                    Je veux ce deal
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DealFire;


