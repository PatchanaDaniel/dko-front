import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Leaf,
  Target,
  Calendar,
  MapPin,
  Activity,
  Award,
  Zap,
  Recycle,
  ThumbsUp,
  TrendingDown,
  PieChart,
  Filter
} from 'lucide-react';
import { mockStatistics, mockReports, mockSchedules, mockTrucks, detailedStatistics } from '../../data/mockData';

export const MunicipalityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const stats = mockStatistics;
  const resolvedReports = mockReports.filter(r => r.status === 'resolved').length;
  const totalReports = mockReports.length;

  const kpiCards = [
    {
      title: 'Collectes totales',
      value: stats.totalCollections.toLocaleString(),
      change: '+12%',
      icon: Truck,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Déchets collectés',
      value: `${stats.totalWaste.toLocaleString()} tonnes`,
      change: '+8%',
      icon: BarChart3,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Taux de recyclage',
      value: `${stats.recyclingRate}%`,
      change: '+5%',
      icon: Recycle,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Temps de réponse',
      value: `${stats.averageResponseTime}h`,
      change: '-15%',
      icon: CheckCircle,
      color: 'orange',
      trend: 'down'
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'red': return 'text-red-600 bg-red-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
           trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de Bord Municipal</h1>
            <p className="text-gray-600">Analyse complète des performances de gestion des déchets pour {stats.period}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
              { id: 'environment', label: 'Impact environnemental', icon: Leaf },
              { id: 'districts', label: 'Quartiers', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((kpi, index) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                          <div className={`flex items-center mt-1 text-sm ${getChangeColor(kpi.trend)}`}>
                            {getTrendIcon(kpi.trend)}
                            <span className="ml-1">{kpi.change} vs mois précédent</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${getIconColor(kpi.color)}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphiques principaux */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Évolution mensuelle */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des collectes</h3>
                  <div className="space-y-4">
                    {detailedStatistics.monthlyData.slice(-6).map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="w-12 text-sm font-medium">{month.month}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Collectes du mois de  {month.month}: {month.collections}</span>
                              
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{width: `${month.collections/39.345}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                       
                      </div>
                    ))}
                  </div>
                </div>

                {/* Répartition des déchets */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des déchets</h3>
                  <div className="space-y-4">
                    {detailedStatistics.wasteTypes.map((waste) => (
                      <div key={waste.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{backgroundColor: waste.color}}
                          ></div>
                          <span className="text-sm font-medium">{waste.type}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{waste.quantity}t</span>
                          <span className="text-sm font-medium">{waste.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total collecté:</span>
                      <span className="font-bold">{detailedStatistics.wasteTypes.reduce((sum, w) => sum + w.quantity, 0)}t</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Autres onglets avec contenu basique */}
          {activeTab !== 'overview' && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                Contenu de l'onglet "{activeTab}" en cours de développement
              </div>
              <p className="text-sm text-gray-400">
                Cette section sera disponible dans une prochaine version
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};