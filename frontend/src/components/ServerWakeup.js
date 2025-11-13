import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ServerWakeup = ({ onReady }) => {
  const [isWaking, setIsWaking] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animation des points
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  useEffect(() => {
    // Countdown
    if (isWaking && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isWaking, countdown]);

  useEffect(() => {
    // Vérifier si le serveur est prêt
    const checkServer = async () => {
      try {
        await axios.get(`${BACKEND_URL}/api/settings`, { timeout: 5000 });
        setIsWaking(false);
        if (onReady) onReady();
      } catch (error) {
        // Réessayer après 3 secondes
        setTimeout(checkServer, 3000);
      }
    };

    checkServer();
  }, [onReady]);

  if (!isWaking) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center z-50">
      <div className="text-center text-white">
        {/* Logo */}
        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white font-bold text-4xl">B</span>
        </div>
        
        {/* Texte de chargement */}
        <h2 className="text-2xl font-bold mb-2">BMS Inventory</h2>
        <p className="text-blue-100 mb-4">
          Démarrage du serveur{dots}
        </p>
        
        {/* Spinner */}
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
        
        {/* Countdown */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl px-6 py-4 inline-block">
          <p className="text-sm text-blue-100 mb-1">Temps estimé</p>
          <p className="text-4xl font-mono font-bold">
            {countdown}s
          </p>
        </div>
        
        <p className="text-xs text-blue-200 mt-4 max-w-md mx-auto">
          ℹ️ Le serveur gratuit se met en veille après 15 minutes d'inactivité.
          <br />
          Premier démarrage : ~30-60 secondes
        </p>
      </div>
    </div>
  );
};

export default ServerWakeup;

