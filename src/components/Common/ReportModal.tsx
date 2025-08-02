import React, { useState } from 'react';
import { X, MapPin, Camera, AlertTriangle } from 'lucide-react';
import { reportsAPI } from '../../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    { value: 'overflow', label: 'Débordement de conteneur', icon: '🗑️' },
    { value: 'damage', label: 'Matériel endommagé', icon: '🔧' },
    { value: 'illegal_dump', label: 'Dépôt sauvage', icon: '⚠️' },
    { value: 'missed_collection', label: 'Collecte manquée', icon: '📅' },
    { value: 'other', label: 'Autre problème', icon: '❓' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Appel API réel avec Django backend
      const newReport = {
        type: reportType as any,
        description,
        location: {
          latitude: 48.8566, // À remplacer par la géolocalisation réelle
          longitude: 2.3522,
          address: location
        },
        reported_by: reporterName || 'Citoyen anonyme',
        reporter_contact: {
          name: reporterName,
          phone: reporterPhone,
          email: reporterEmail
        },
        reporter_type: 'citizen' as any,
        priority: priority as any
      };
      
      const response = await reportsAPI.create(newReport);
      
      if (response.success) {
      
      // Reset form
      setReportType('');
      setDescription('');
      setLocation('');
      setPriority('medium');
      setReporterName('');
      setReporterPhone('');
      setReporterEmail('');
      
        alert('Signalement envoyé avec succès !');
        onClose();
      } else {
        alert('Erreur lors de l\'envoi du signalement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du signalement:', error);
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6 text-orange-600" />
              Signaler un problème
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations de contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3">Vos informations de contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reporterName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="reporterName"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Votre nom et prénom"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reporterPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="reporterPhone"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-700">
                Votre nom et téléphone nous permettront de vous recontacter si nécessaire pour le suivi de votre signalement.
              </p>
            </div>

            {/* Type de signalement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de problème *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={`
                      flex items-center p-3 border rounded-lg text-left transition-colors
                      ${reportType === type.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <span className="text-lg mr-3">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description détaillée *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Décrivez le problème en détail..."
                required
              />
            </div>

            {/* Localisation */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse ou point de repère *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Indiquez l'adresse ou un point de repère proche"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Plus l'adresse est précise, plus nous pourrons intervenir rapidement
              </p>
            </div>

            {/* Priorité */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Urgence
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">Faible - Peut attendre quelques jours</option>
                <option value="medium">Moyenne - À traiter dans la journée</option>
                <option value="high">Haute - Intervention rapide nécessaire</option>
                <option value="urgent">Urgente - Danger immédiat</option>
              </select>
            </div>

            {/* Photos (simulé) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (optionnel)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Cliquez pour ajouter des photos du problème
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Les photos nous aident à mieux comprendre le problème
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!reportType || !description || !location || !reporterName || isSubmitting}
                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer le signalement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};