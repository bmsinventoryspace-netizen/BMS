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

const DealFire = () => {
  const { theme } = useTheme();
  const { socket } = useContext(AuthContext);
  const [deals, setDeals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hasNew, setHasNew] = useState(false);

  const loadDeals = async () => {
    try {
      const res = await axios.get(`${API}/deals`);
      setDeals(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg?.type === 'deal_created') {
        setHasNew(true);
        loadDeals();
      }
    };
    socket.on('message', handler);
    return () => {
      socket.off('message', handler);
    };
  }, [socket]);

  return (
    <Layout>
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
                  {d.image ? (
                    <img src={d.image} alt={d.nom} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-400">🔥</span>
                    </div>
                  )}
                  {!d.disponible && (
                    <div className="absolute top-3 left-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Hors stock
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
                    <Button className={`${theme.bg} ${theme.bgHover} text-white`} onClick={() => setSelected(d)}>
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
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
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DealFire;


