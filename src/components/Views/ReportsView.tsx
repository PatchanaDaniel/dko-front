import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  X 
} from 'lucide-react';
import { Report, Team } from '../../types';
import { reportsAPI, teamsAPI } from '../../services/api';

interface ReportsViewProps {
  onClose?: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ onClose }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newReport, setNewReport] = useState<Partial<Report>>({
    type: 'overflow',
    priority: 'medium',
    description: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    },
    reported_by: '',
    reporter_type: 'citizen'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsResponse, teamsResponse] = await Promise.all([
        reportsAPI.getAll(),
        teamsAPI.getAll()
      ]);

      if (reportsResponse.success && reportsResponse.data) {
        setReports(reportsResponse.data.results);
      }

      if (teamsResponse.success && teamsResponse.data) {
        setTeams(teamsResponse.data.results);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      const response = await reportsAPI.create(newReport as Omit<Report, 'id' | 'createdAt' | 'status'>);
      if (response.success) {
        await loadData();
        setShowCreateModal(false);
        setNewReport({
          type: 'overflow',
          priority: 'medium',
          description: '',
          location: {
            latitude: 0,
            longitude: 0,
            address: ''
          },
          reported_by: '',
          reporter_type: 'citizen'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;

    try {
      const response = await reportsAPI.update(selectedReport.id, selectedReport);
      if (response.success) {
        await loadData();
        setShowEditModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      return;
    }

    try {
      const response = await reportsAPI.delete(reportId);
      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleAssignTeam = async (teamId: string) => {
    if (!selectedReport) return;

    try {
      const response = await reportsAPI.assignTeam(selectedReport.id, teamId);
      if (response.success) {
        await loadData();
        setShowAssignModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <AlertTriangle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Gestion des Signalements
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Signalement
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par description ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* Tableau des signalements */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signalement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Priorité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Équipe Assignée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {report.description}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">
                      {report.type === 'overflow' ? 'Débordement' :
                       report.type === 'damage' ? 'Dommage' :
                       report.type === 'illegal_dump' ? 'Dépôt illégal' :
                       report.type === 'missed_collection' ? 'Collecte manquée' :
                       report.type === 'other' ? 'Autre' : report.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                      {report.priority === 'low' ? 'Faible' :
                       report.priority === 'medium' ? 'Moyenne' :
                       report.priority === 'high' ? 'Élevée' :
                       report.priority === 'urgent' ? 'Urgente' : report.priority}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {report.location.address}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="ml-1">
                      {report.status === 'pending' ? 'En attente' :
                       report.status === 'in_progress' ? 'En cours' :
                       report.status === 'resolved' ? 'Résolu' :
                       report.status === 'closed' ? 'Fermé' : report.status}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  {report.assignedTo ? (
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {teams.find(t => t.id === report.assignedTo)?.name || 'Équipe inconnue'}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Non assigné</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowAssignModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Assigner une équipe"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Modifier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun signalement trouvé.
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Nouveau Signalement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value as Report['type'] })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="overflow">Débordement</option>
                  <option value="damage">Dommage</option>
                  <option value="illegal_dump">Dépôt illégal</option>
                  <option value="missed_collection">Collecte manquée</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={newReport.priority}
                  onChange={(e) => setNewReport({ ...newReport, priority: e.target.value as Report['priority'] })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Décrivez le problème..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  value={newReport.location?.address || ''}
                  onChange={(e) => setNewReport({ 
                    ...newReport, 
                    location: { 
                      ...newReport.location, 
                      address: e.target.value,
                      latitude: newReport.location?.latitude || 0,
                      longitude: newReport.location?.longitude || 0
                    } 
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Adresse ou point de repère..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Modifier le Signalement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={selectedReport.type}
                  onChange={(e) => setSelectedReport({ ...selectedReport, type: e.target.value as Report['type'] })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="overflow">Débordement</option>
                  <option value="damage">Dommage</option>
                  <option value="illegal_dump">Dépôt illégal</option>
                  <option value="missed_collection">Collecte manquée</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={selectedReport.priority}
                  onChange={(e) => setSelectedReport({ ...selectedReport, priority: e.target.value as Report['priority'] })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={selectedReport.status}
                  onChange={(e) => setSelectedReport({ ...selectedReport, status: e.target.value as Report['status'] })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedReport.description}
                  onChange={(e) => setSelectedReport({ ...selectedReport, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  value={selectedReport.location.address}
                  onChange={(e) => setSelectedReport({ 
                    ...selectedReport, 
                    location: { 
                      ...selectedReport.location, 
                      address: e.target.value 
                    } 
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'assignation d'équipe */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Assigner une Équipe</h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Signalement: {selectedReport.description}
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleAssignTeam(team.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-gray-500">{team.members?.length || 0} membres</div>
                    </div>
                    {selectedReport.assignedTo === team.id && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
