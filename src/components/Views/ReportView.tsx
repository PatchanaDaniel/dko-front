import React, { useState } from 'react';
import { AlertTriangle, Plus, MapPin, Clock, User, Filter } from 'lucide-react';
import { ReportModal } from '../Common/ReportModal';
import { reportsAPI } from '../../services/api';
import { Report } from '../../types';

export const ReportView: React.FC = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les signalements depuis l'API
  React.useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await reportsAPI.getAll();
        if (response.success) {
          setReports(response.data.results);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des signalements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Normale';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'overflow': return 'Débordement';
      case 'damage': return 'Dommage';
      case 'illegal_dump': return 'Dépôt sauvage';
      case 'missed_collection': return 'Collecte manquée';
      case 'other': return 'Autre';
      default: return 'Non spécifié';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overflow': return '🗑️';
      case 'damage': return '🔧';
      case 'illegal_dump': return '⚠️';
      case 'missed_collection': return '📅';
      case 'other': return '❓';
      default: return '📝';
    }
  };

  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'all') return true;
    return report.status === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-orange-600" />
              Signalements
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez et suivez tous les signalements des citoyens
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filtre */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tous les signalements</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolus</option>
                <option value="closed">Fermés</option>
              </select>
            </div>
            
            {/* Bouton nouveau signalement */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nouveau signalement
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-700">En attente</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-sm text-blue-700">En cours</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-sm text-green-700">Résolus</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {reports.length}
            </div>
            <div className="text-sm text-gray-700">Total</div>
          </div>
        </div>
      </div>

      {/* Liste des signalements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-gray-500">Chargement des signalements...</div>
            </div>
          ) : (
          filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className={`p-6 cursor-pointer transition-colors ${
                  selectedReport === report.id ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{getTypeIcon(report.type)}</span>
                      <h3 className="text-lg font-medium text-gray-900">{getTypeText(report.type)}</h3>
                      <div className="ml-3 flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                          {getPriorityText(report.priority)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{report.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {report.location.address}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {report.reporterContact?.name || report.reportedBy} ({report.reporterType === 'citizen' ? 'Citoyen' : 
                                            report.reporterType === 'collector' ? 'Collecteur' : 'Agent'})
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')} à {new Date(report.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                      </div>
                    </div>

                    {/* Informations de contact */}
                    {report.reporterContact && (
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-4">
                          {report.reporterContact.phone && (
                            <span>📞 {report.reporterContact.phone}</span>
                          )}
                          {report.reporterContact.email && (
                            <span>✉️ {report.reporterContact.email}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {report.assignedTo && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Assigné à:</strong> {report.assignedTo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions et détails étendus */}
                {selectedReport === report.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="space-x-3">
                        {report.status === 'pending' && (
                          <>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Prendre en charge
                            </button>
                            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                              Assigner à une équipe
                            </button>
                          </>
                        )}
                        {report.status === 'in_progress' && (
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Marquer comme résolu
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Voir sur la carte
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Ajouter un commentaire
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        ID: {report.id}
                      </div>
                    </div>

                    {report.images && report.images.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Photos jointes</h4>
                        <div className="flex space-x-2">
                          {report.images.map((image, index) => (
                            <div key={index} className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                              Photo {index + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement</h3>
              <p className="text-gray-600 mb-4">
                {selectedFilter === 'all' 
                  ? 'Aucun signalement n\'a été créé pour le moment.'
                  : `Aucun signalement avec le statut "${selectedFilter}".`
                }
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <Plus className="mr-2 h-5 w-5" />
                Créer un signalement
              </button>
            </div>
          )
          )}
        </div>
      </div>

      {/* Modal de signalement */}
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};