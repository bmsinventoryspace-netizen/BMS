import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, TrendingUp } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Stats = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats/articles`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const chartData = stats.slice(0, 10).map(s => ({
    nom: s.nom,
    vues: s.views,
  }));

  return (
    <Layout>
      <div className="space-y-6" data-testid="stats-page">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Statistiques</h1>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="glass rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top 10 articles les plus vus</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nom" angle={-45} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
                <YAxis label={{ value: 'Vues', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="vues" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Stats */}
        <div className="glass rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques détaillées</h2>
          {stats.length === 0 ? (
            <p className="text-gray-500">Aucune statistique disponible</p>
          ) : (
            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.article_id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
                  data-testid={`stat-${stat.article_id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                      {stat.photo ? (
                        <LazyLoadImage
                          src={stat.photo}
                          alt={stat.nom}
                          effect="blur"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">B</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{stat.nom}</h3>
                      <p className="text-sm text-gray-600">Réf: {stat.ref || 'N/A'}</p>
                      {stat.last_viewed && (
                        <p className="text-xs text-gray-500">
                          Dernière vue: {new Date(stat.last_viewed).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">{stat.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
