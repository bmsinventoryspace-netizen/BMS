import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useTheme = () => {
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

  const getThemeClasses = (baseClasses) => {
    const colorMap = {
      blue: {
        primary: 'blue',
        gradient: 'from-blue-600 via-blue-700 to-blue-800',
        light: 'from-blue-50 via-white to-gray-50',
        border: 'border-blue-100',
        text: 'text-blue-900',
        textLight: 'text-blue-600',
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        bgLight: 'bg-blue-50',
        borderInput: 'border-blue-200',
        focus: 'focus:border-blue-400',
      },
      green: {
        primary: 'green',
        gradient: 'from-green-600 via-green-700 to-green-800',
        light: 'from-green-50 via-white to-gray-50',
        border: 'border-green-100',
        text: 'text-green-900',
        textLight: 'text-green-600',
        bg: 'bg-green-600',
        bgHover: 'hover:bg-green-700',
        bgLight: 'bg-green-50',
        borderInput: 'border-green-200',
        focus: 'focus:border-green-400',
      },
      red: {
        primary: 'red',
        gradient: 'from-red-600 via-red-700 to-red-800',
        light: 'from-red-50 via-white to-gray-50',
        border: 'border-red-100',
        text: 'text-red-900',
        textLight: 'text-red-600',
        bg: 'bg-red-600',
        bgHover: 'hover:bg-red-700',
        bgLight: 'bg-red-50',
        borderInput: 'border-red-200',
        focus: 'focus:border-red-400',
      },
      purple: {
        primary: 'purple',
        gradient: 'from-purple-600 via-purple-700 to-purple-800',
        light: 'from-purple-50 via-white to-gray-50',
        border: 'border-purple-100',
        text: 'text-purple-900',
        textLight: 'text-purple-600',
        bg: 'bg-purple-600',
        bgHover: 'hover:bg-purple-700',
        bgLight: 'bg-purple-50',
        borderInput: 'border-purple-200',
        focus: 'focus:border-purple-400',
      },
      orange: {
        primary: 'orange',
        gradient: 'from-orange-600 via-orange-700 to-orange-800',
        light: 'from-orange-50 via-white to-gray-50',
        border: 'border-orange-100',
        text: 'text-orange-900',
        textLight: 'text-orange-600',
        bg: 'bg-orange-600',
        bgHover: 'hover:bg-orange-700',
        bgLight: 'bg-orange-50',
        borderInput: 'border-orange-200',
        focus: 'focus:border-orange-400',
      },
      teal: {
        primary: 'teal',
        gradient: 'from-teal-600 via-teal-700 to-teal-800',
        light: 'from-teal-50 via-white to-gray-50',
        border: 'border-teal-100',
        text: 'text-teal-900',
        textLight: 'text-teal-600',
        bg: 'bg-teal-600',
        bgHover: 'hover:bg-teal-700',
        bgLight: 'bg-teal-50',
        borderInput: 'border-teal-200',
        focus: 'focus:border-teal-400',
      },
      pink: {
        primary: 'pink',
        gradient: 'from-pink-600 via-pink-700 to-pink-800',
        light: 'from-pink-50 via-white to-gray-50',
        border: 'border-pink-100',
        text: 'text-pink-900',
        textLight: 'text-pink-600',
        bg: 'bg-pink-600',
        bgHover: 'hover:bg-pink-700',
        bgLight: 'bg-pink-50',
        borderInput: 'border-pink-200',
        focus: 'focus:border-pink-400',
      },
      indigo: {
        primary: 'indigo',
        gradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
        light: 'from-indigo-50 via-white to-gray-50',
        border: 'border-indigo-100',
        text: 'text-indigo-900',
        textLight: 'text-indigo-600',
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        bgLight: 'bg-indigo-50',
        borderInput: 'border-indigo-200',
        focus: 'focus:border-indigo-400',
      },
    };

    const colors = colorMap[themeColor] || colorMap.blue;
    
    // Remplacer les classes de couleur dans baseClasses
    let result = baseClasses;
    Object.keys(colorMap.blue).forEach(key => {
      const regex = new RegExp(`\\b${colorMap.blue[key]}\\b`, 'g');
      result = result.replace(regex, colors[key]);
    });
    
    return result;
  };

  return { themeColor, getThemeClasses };
};

