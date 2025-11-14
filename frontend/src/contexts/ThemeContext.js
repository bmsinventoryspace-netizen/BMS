import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState('blue');

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setThemeColor(response.data.theme_color || 'blue');
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };
    fetchTheme();
  }, []);

  const getColorClass = (type, shade = '600') => {
    const colorMap = {
      blue: {
        bg: `bg-blue-${shade}`,
        text: `text-blue-${shade}`,
        border: `border-blue-${shade}`,
        hover: `hover:bg-blue-${parseInt(shade) + 100}`,
        gradient: 'from-blue-600 via-blue-700 to-blue-800',
        light: 'from-blue-50 via-white to-gray-50',
        borderLight: 'border-blue-100',
        textDark: 'text-blue-900',
        textLight: 'text-blue-600',
        bgLight: 'bg-blue-50',
        borderInput: 'border-blue-200',
        focus: 'focus:border-blue-400',
      },
      green: {
        bg: `bg-green-${shade}`,
        text: `text-green-${shade}`,
        border: `border-green-${shade}`,
        hover: `hover:bg-green-${parseInt(shade) + 100}`,
        gradient: 'from-green-600 via-green-700 to-green-800',
        light: 'from-green-50 via-white to-gray-50',
        borderLight: 'border-green-100',
        textDark: 'text-green-900',
        textLight: 'text-green-600',
        bgLight: 'bg-green-50',
        borderInput: 'border-green-200',
        focus: 'focus:border-green-400',
      },
      red: {
        bg: `bg-red-${shade}`,
        text: `text-red-${shade}`,
        border: `border-red-${shade}`,
        hover: `hover:bg-red-${parseInt(shade) + 100}`,
        gradient: 'from-red-600 via-red-700 to-red-800',
        light: 'from-red-50 via-white to-gray-50',
        borderLight: 'border-red-100',
        textDark: 'text-red-900',
        textLight: 'text-red-600',
        bgLight: 'bg-red-50',
        borderInput: 'border-red-200',
        focus: 'focus:border-red-400',
      },
      purple: {
        bg: `bg-purple-${shade}`,
        text: `text-purple-${shade}`,
        border: `border-purple-${shade}`,
        hover: `hover:bg-purple-${parseInt(shade) + 100}`,
        gradient: 'from-purple-600 via-purple-700 to-purple-800',
        light: 'from-purple-50 via-white to-gray-50',
        borderLight: 'border-purple-100',
        textDark: 'text-purple-900',
        textLight: 'text-purple-600',
        bgLight: 'bg-purple-50',
        borderInput: 'border-purple-200',
        focus: 'focus:border-purple-400',
      },
      orange: {
        bg: `bg-orange-${shade}`,
        text: `text-orange-${shade}`,
        border: `border-orange-${shade}`,
        hover: `hover:bg-orange-${parseInt(shade) + 100}`,
        gradient: 'from-orange-600 via-orange-700 to-orange-800',
        light: 'from-orange-50 via-white to-gray-50',
        borderLight: 'border-orange-100',
        textDark: 'text-orange-900',
        textLight: 'text-orange-600',
        bgLight: 'bg-orange-50',
        borderInput: 'border-orange-200',
        focus: 'focus:border-orange-400',
      },
      teal: {
        bg: `bg-teal-${shade}`,
        text: `text-teal-${shade}`,
        border: `border-teal-${shade}`,
        hover: `hover:bg-teal-${parseInt(shade) + 100}`,
        gradient: 'from-teal-600 via-teal-700 to-teal-800',
        light: 'from-teal-50 via-white to-gray-50',
        borderLight: 'border-teal-100',
        textDark: 'text-teal-900',
        textLight: 'text-teal-600',
        bgLight: 'bg-teal-50',
        borderInput: 'border-teal-200',
        focus: 'focus:border-teal-400',
      },
      pink: {
        bg: `bg-pink-${shade}`,
        text: `text-pink-${shade}`,
        border: `border-pink-${shade}`,
        hover: `hover:bg-pink-${parseInt(shade) + 100}`,
        gradient: 'from-pink-600 via-pink-700 to-pink-800',
        light: 'from-pink-50 via-white to-gray-50',
        borderLight: 'border-pink-100',
        textDark: 'text-pink-900',
        textLight: 'text-pink-600',
        bgLight: 'bg-pink-50',
        borderInput: 'border-pink-200',
        focus: 'focus:border-pink-400',
      },
      indigo: {
        bg: `bg-indigo-${shade}`,
        text: `text-indigo-${shade}`,
        border: `border-indigo-${shade}`,
        hover: `hover:bg-indigo-${parseInt(shade) + 100}`,
        gradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
        light: 'from-indigo-50 via-white to-gray-50',
        borderLight: 'border-indigo-100',
        textDark: 'text-indigo-900',
        textLight: 'text-indigo-600',
        bgLight: 'bg-indigo-50',
        borderInput: 'border-indigo-200',
        focus: 'focus:border-indigo-400',
      },
    };

    const colors = colorMap[themeColor] || colorMap.blue;
    return colors[type] || '';
  };

  const value = {
    themeColor,
    setThemeColor,
    getColorClass,
    // Helpers pour les cas courants
    primary: {
      bg: getColorClass('bg', '600'),
      hover: getColorClass('hover', '600'),
      text: getColorClass('text', '600'),
      gradient: getColorClass('gradient'),
      light: getColorClass('light'),
      border: getColorClass('borderLight'),
      textDark: getColorClass('textDark'),
      textLight: getColorClass('textLight'),
      bgLight: getColorClass('bgLight'),
      borderInput: getColorClass('borderInput'),
      focus: getColorClass('focus'),
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

