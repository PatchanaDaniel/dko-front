import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, UserPlus, Phone, Mail, Crown } from 'lucide-react';
import { Team, TeamMember, User } from '../../types';
import { usersAPI } from '../../services/api';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: Team | null;
  mode: 'create' | 'edit';
  onSubmit?: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, team, mode, onSubmit }) => {
  // Synchronize form state with the team prop when opening or changing team
  const [teamName, setTeamName] = useState(team?.name || '');
  const [specialization, setSpecialization] = useState(team?.specialization || 'general');
  const [members, setMembers] = useState<TeamMember[]>(team?.members || []);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'collector' as 'leader' | 'collector' | 'driver',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New: state for leader selection
  const [users, setUsers] = useState<User[]>([]);
  const [leaderId, setLeaderId] = useState<string>(team?.leaderId || '');

  const specializations = [
    { value: 'general', label: 'Collecte générale' },
    { value: 'recycling', label: 'Recyclage' },
    { value: 'organic', label: 'Déchets organiques' },
    { value: 'hazardous', label: 'Déchets dangereux' }
  ];

  const roles = [
    { value: 'leader', label: 'Chef d\'équipe', icon: Crown },
    { value: 'collector', label: 'Collecteur', icon: Users },
    { value: 'driver', label: 'Conducteur', icon: UserPlus }
  ];

  useEffect(() => {
    if (isOpen) {
      setTeamName(team?.name || '');
      setSpecialization(team?.specialization || 'general');
      setMembers(team?.members || []);
      setLeaderId(team?.leaderId || '');
      // Fetch only users with role 'collector'
      usersAPI.getAll().then(res => {
        if (res.success && res.data?.results) {
          setUsers(res.data.results.filter((u: User) => u.role === 'collector'));
        }
      });
    }
  }, [isOpen, team]);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      role: newMember.role,
      phone: newMember.phone,
      email: newMember.email,
      joinedAt: new Date().toISOString()
    };

    setMembers([...members, member]);
    setNewMember({ name: '', role: 'collector', phone: '', email: '' });
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use leaderId from select
      if (!leaderId) {
        alert("Vous devez sélectionner un chef d'équipe (leader) dans la liste.");
        setIsSubmitting(false);
        return;
      }
      const teamData: any = {
        name: teamName,
        specialization,
        status: 'active',
        leader: leaderId,
      };

      if (onSubmit) {
        await onSubmit(teamData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'opération. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    const roleData = roles.find(r => r.value === role);
    const Icon = roleData?.icon || Users;
    return <Icon className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'bg-yellow-100 text-yellow-800';
      case 'driver': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="mr-2 h-6 w-6 text-blue-600" />
              {mode === 'create' ? 'Créer une équipe' : 'Modifier l\'équipe'}
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
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'équipe *
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Équipe Alpha"
                  required
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialisation
                </label>
                <select
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* New: Leader selection */}
              <div className="md:col-span-2">
                <label htmlFor="leader" className="block text-sm font-medium text-gray-700 mb-1">
                  Chef d'équipe (collecteur existant) *
                </label>
                <select
                  id="leader"
                  value={leaderId}
                  onChange={e => setLeaderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un chef d'équipe</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Membres existants */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Membres de l'équipe ({members.length})
              </h3>
              
              {members.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                              {roles.find(r => r.value === member.role)?.label}
                            </span>
                            {member.phone && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {member.phone}
                              </span>
                            )}
                            {member.email && (
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Aucun membre dans cette équipe</p>
                </div>
              )}
            </div>

            {/* Ajouter un membre */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Ajouter un membre</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Téléphone"
                  />
                </div>
                <div>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!newMember.name || !newMember.email}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </button>
                </div>
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
                // Enable submit as soon as leaderId is chosen and teamName is filled
                disabled={!teamName || !leaderId || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer l\'équipe' : 'Modifier l\'équipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};