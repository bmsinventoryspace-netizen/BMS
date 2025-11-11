import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useLogo = () => {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        if (response.data.logo) {
          setLogo(response.data.logo);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return { logo, loading };
};

// Composant Logo réutilisable
export const Logo = ({ size = 'md', className = '' }) => {
  const { logo } = useLogo();

  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg overflow-hidden ${className}`}>
      {logo ? (
        <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
      ) : (
        <span className={`text-white font-bold ${textSizes[size]}`}>B</span>
      )}
    </div>
  );
};

