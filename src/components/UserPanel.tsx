import React, { useState } from 'react';
import { Users, Plus, Edit3, X, Save, UserCheck, UserX, Clock } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: 'primary' | 'secondary' | 'readonly' | 'cardholder';
  avatar: string;
  status: 'online' | 'away' | 'offline';
}

interface UserPanelProps {
  users: User[];
  onUserUpdate: (users: User[]) => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({ users, onUserUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    role: 'readonly' as const,
    avatar: '👤'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-deep-olive';
      case 'away': return 'bg-gold';
      case 'offline': return 'bg-medium-grey';
      default: return 'bg-medium-grey';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary': return 'bg-deep-navy text-cream';
      case 'secondary': return 'bg-light-blue text-deep-navy';
      case 'readonly': return 'bg-light-grey text-charcoal-grey';
      case 'cardholder': return 'bg-gold text-deep-navy';
      default: return 'bg-light-grey text-charcoal-grey';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return UserCheck;
      case 'away': return Clock;
      case 'offline': return UserX;
      default: return UserX;
    }
  };

  const addUser = () => {
    if (!newUser.name.trim()) return;
    
    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name.trim(),
      role: newUser.role,
      avatar: newUser.avatar,
      status: 'offline'
    };
    
    onUserUpdate([...users, user]);
    setNewUser({ name: '', role: 'readonly', avatar: '👤' });
    setIsAddingUser(false);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    onUserUpdate(users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
    setEditingUser(null);
  };

  const removeUser = (userId: string) => {
    onUserUpdate(users.filter(user => user.id !== userId));
  };

  const toggleStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const statusCycle = { online: 'away', away: 'offline', offline: 'online' };
    const newStatus = statusCycle[user.status as keyof typeof statusCycle] as User['status'];
    updateUser(userId, { status: newStatus });
  };

  return (
    <div className="absolute top-4 right-4 z-30">
      <div className={`bg-white border border-light-medium-grey rounded-xl shadow-card transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-light-grey hover:bg-opacity-50 transition-colors rounded-t-xl"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-charcoal-grey" />
            <span className="font-montserrat text-caption font-bold text-charcoal-grey">
              Users ({users.length})
            </span>
          </div>
          
          {/* User Avatars Preview */}
          {!isExpanded && (
            <div className="flex items-center space-x-1">
              {users.slice(0, 3).map((user) => (
                <div key={user.id} className="relative">
                  <div className="w-6 h-6 rounded-full bg-light-grey flex items-center justify-center text-xs">
                    {user.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${getStatusColor(user.status)}`}></div>
                </div>
              ))}
              {users.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-medium-grey text-white flex items-center justify-center text-xs font-bold">
                  +{users.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-light-medium-grey">
            {/* User List */}
            <div className="max-h-64 overflow-y-auto">
              {users.map((user) => {
                const StatusIcon = getStatusIcon(user.status);
                const isEditing = editingUser === user.id;
                
                return (
                  <div key={user.id} className="p-3 border-b border-light-grey last:border-b-0 hover:bg-light-grey hover:bg-opacity-30 transition-colors">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => updateUser(user.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
                        />
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => updateUser(user.id, { role: e.target.value as User['role'] })}
                            className="flex-1 px-2 py-1 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
                          >
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="readonly">Read Only</option>
                            <option value="cardholder">Cardholder</option>
                          </select>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-deep-olive hover:text-charcoal-grey transition-colors p-1"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeUser(user.id)}
                            className="text-burgundy hover:text-charcoal-grey transition-colors p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-light-grey flex items-center justify-center">
                              {user.avatar}
                            </div>
                            <button
                              onClick={() => toggleStatus(user.id)}
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${getStatusColor(user.status)} hover:scale-110 transition-transform cursor-pointer`}
                            >
                              <StatusIcon className="w-2 h-2 text-white mx-auto" />
                            </button>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-montserrat text-caption font-bold text-charcoal-grey truncate">
                              {user.name}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleColor(user.role)}`}>
                                {user.role.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="text-medium-grey hover:text-charcoal-grey transition-colors p-1 opacity-0 group-hover:opacity-100"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add User Section */}
            <div className="p-3 border-t border-light-medium-grey bg-light-grey bg-opacity-30">
              {isAddingUser ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="User name..."
                    className="w-full px-2 py-1 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                      className="flex-1 px-2 py-1 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
                    >
                      <option value="readonly">Read Only</option>
                      <option value="cardholder">Cardholder</option>
                      <option value="secondary">Secondary</option>
                      <option value="primary">Primary</option>
                    </select>
                    <button
                      onClick={addUser}
                      className="bg-deep-navy text-cream px-2 py-1 rounded text-xs font-bold hover:bg-opacity-90 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingUser(false)}
                      className="text-medium-grey hover:text-charcoal-grey transition-colors p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="w-full flex items-center justify-center space-x-2 py-2 border border-dashed border-medium-grey rounded-lg hover:border-charcoal-grey hover:bg-light-grey hover:bg-opacity-50 transition-colors group"
                >
                  <Plus className="w-4 h-4 text-medium-grey group-hover:text-charcoal-grey transition-colors" />
                  <span className="font-montserrat text-caption text-medium-grey group-hover:text-charcoal-grey transition-colors">
                    Add User
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};