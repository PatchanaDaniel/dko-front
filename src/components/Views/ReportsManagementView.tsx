import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  Search,
  Plus,
  Eye,
  Users
} from 'lucide-react';
import { reportsAPI, teamsAPI } from '../../services/api';
import { Report, Team } from '../../types';
import { ReportModal } from '../Common/ReportModal';

export const ReportsManagementView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // États pour l'assignation
  const [selectedTeam, setSelectedTeam] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadReports();
    loadTeams();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getAll();
      if (response.success && response.data?.results) {
        setReports(response.data.results);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await teamsAPI.getAll();
      if (response.success && response.data?.results) {
        setTeams(response.data.results);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  // CRUD Operations
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) return;

    try {
      const response = await reportsAPI.delete(reportId);
      if (response.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        alert('Signalement supprimé avec succès');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
    try {
      const response = await reportsAPI.update(reportId, { status: newStatus });
      if (response.success) {
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status: newStatus } : r
        ));
        alert('Statut mis à jour avec succès');
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleAssignToTeam = async () => {
    if (!selectedReport || !selectedTeam) return;

    setIsAssigning(true);
    try {
      const teamData = teams.find(t => t.id === selectedTeam);
      const response = await reportsAPI.update(selectedReport.id, { 
        assignedTo: teamData?.name || selectedTeam,
        status: 'in_progress'
      });
      
      if (response.success) {
        setReports(prev => prev.map(r => 
          r.id === selectedReport.id 
            ? { ...r, assignedTo: teamData?.name || selectedTeam, status: 'in_progress' }
            : r
        ));
        setShowAssignModal(false);
        setSelectedTeam('');
        setAssignmentNote('');
        alert('Signalement assigné avec succès');
      } else {
        alert('Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      alert('Erreur lors de l\'assignation');
    } finally {
      setIsAssigning(false);
    }
  };

  // Fonctions utilitaires
  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: Report['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Inconnue';
    }
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'overflow': return '🗑️';
      case 'damage': return '🔧';
      case 'illegal_dump': return '⚠️';
      case 'missed_collection': return '📅';
      default: return '❓';
    }
  };

  const getTypeText = (type: Report['type']) => {
    switch (type) {
      case 'overflow': return 'Débordement';
      case 'damage': return 'Dommage';
      case 'illegal_dump': return 'Dépôt sauvage';
      case 'missed_collection': return 'Collecte manquée';
      default: return 'Autre';
    }
  };

  // Filtrage des signalements
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reported_by.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-gray-500">Chargement des signalements...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-orange-600" />
              Gestion des Signalements
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez les signalements des citoyens et assignez-les aux équipes
            </p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nouveau signalement
          </button>
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
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {reports.filter(r => r.priority === 'urgent' || r.priority === 'high').length}
            </div>
            <div className="text-sm text-red-700">Prioritaires</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolus</option>
            <option value="cancelled">Annulés</option>
          </select>

          {/* Filtre par priorité */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">Urgente</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>

          {/* Filtre par type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous les types</option>
            <option value="overflow">Débordement</option>
            <option value="damage">Dommage</option>
            <option value="illegal_dump">Dépôt sauvage</option>
            <option value="missed_collection">Collecte manquée</option>
            <option value="other">Autre</option>
          </select>

          {/* Bouton reset filtres */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setTypeFilter('all');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2 inline" />
            Reset
          </button>
        </div>
      </div>

      {/* Liste des signalements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Signalements ({filteredReports.length})
          </h2>
          
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement</h3>
              <p className="text-gray-600">Aucun signalement ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(report.type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getTypeText(report.type)}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                        {getPriorityText(report.priority)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {report.location.address}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {report.reported_by}
                    </div>
                    {report.reporter_contact?.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {report.reporter_contact.phone}
                      </div>
                    )}
                    {report.assignedTo && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Assigné à: {report.assignedTo}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </button>

                    {report.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowAssignModal(true);
                        }}
                        className="flex items-center px-3 py-1 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Assigner
                      </button>
                    )}

                    {report.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="flex items-center px-3 py-1 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Marquer résolu
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="flex items-center px-3 py-1 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/édition de signalement */}
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          loadReports(); // Recharger la liste après création
        }}
      />

      {/* Modal d'assignation à une équipe */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAssignModal(false)} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <UserPlus className="mr-2 h-6 w-6 text-green-600" />
                  Assigner à une équipe
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Signalement</h3>
                  <p className="text-sm text-gray-600">
                    {getTypeText(selectedReport.type)} - {selectedReport.location.address}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Équipe *
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loadingTeams}
                  >
                    <option value="">Sélectionner une équipe</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} - {team.specialization} ({team.members.length} membres)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note d'assignation (optionnel)
                  </label>
                  <textarea
                    value={assignmentNote}
                    onChange={(e) => setAssignmentNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Instructions spéciales pour l'équipe..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignToTeam}
                  disabled={!selectedTeam || isAssigning}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAssigning ? 'Attribution...' : 'Assigner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailsModal(false)} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="mr-2 h-6 w-6 text-blue-600" />
                  Détails du signalement
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      <p className="text-gray-900 flex items-center">
                        <span className="mr-2">{getTypeIcon(selectedReport.type)}</span>
                        {getTypeText(selectedReport.type)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Priorité:</span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedReport.priority)} ml-2`}>
                        {getPriorityText(selectedReport.priority)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Statut:</span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)} ml-2`}>
                        {getStatusText(selectedReport.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date de création:</span>
                      <p className="text-gray-900">
                        {new Date(selectedReport.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Localisation */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Localisation</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {selectedReport.location.address}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Coordonnées: {selectedReport.location.latitude}, {selectedReport.location.longitude}
                    </p>
                  </div>
                </div>

                {/* Informations du rapporteur */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Informations du rapporteur</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {selectedReport.reported_by}
                    </p>
                    {selectedReport.reporter_contact?.phone && (
                      <p className="text-gray-700 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {selectedReport.reporter_contact.phone}
                      </p>
                    )}
                    {selectedReport.reporter_contact?.email && (
                      <p className="text-gray-700 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedReport.reporter_contact.email}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Type de rapporteur: {selectedReport.reporter_type === 'citizen' ? 'Citoyen' : 
                                         selectedReport.reporter_type === 'collector' ? 'Collecteur' : 'Agent'}
                    </p>
                  </div>
                </div>

                {/* Assignation */}
                {selectedReport.assignedTo && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Assignation</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-900 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Assigné à: {selectedReport.assignedTo}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                {selectedReport.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowAssignModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Assigner à une équipe
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
