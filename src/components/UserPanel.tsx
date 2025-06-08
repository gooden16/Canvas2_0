// src/components/UserPanel.tsx

import React, { useState } from 'react';
import { Users, Plus, MoreVertical, Edit3, Trash2, Shield, Eye, Key, CreditCard } from 'lucide-react';

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
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('readonly');

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'primary':
        return <Key className="w-4 h-4 text-blue-600" />;
      case 'secondary':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'readonly':
        return <Eye className="w-4 h-4 text-gray-600" />;
      case 'cardholder':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'primary':
        return 'Primary User';
      case 'secondary':
        return 'Secondary User';
      case 'readonly':
        return 'Read Only';
      case 'cardholder':
        return 'Card Holder';
      default:
        return 'User';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'secondary':
        return 'bg-green-100 text-green-800';
      case 'readonly':
        return 'bg-gray-100 text-gray-800';
      case 'cardholder':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const handleAddUser = () => {
    if (newUserName.trim()) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: newUserName,
        role: newUserRole,
        avatar: '👤',
        status: 'offline'
      };
      onUserUpdate([...users, newUser]);
      setNewUserName('');
      setNewUserRole('readonly');
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    onUserUpdate(users.filter(user => user.id !== userId));
    setSelectedUser(null);
  };

  const handleUpdateUserRole = (userId: string, newRole: User['role']) => {
    onUserUpdate(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="font-montserrat text-lg font-semibold text-gray-800">
              Users & Access
            </h2>
          </div>
          <button
            onClick={() => setIsAddingUser(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add User"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-gray-500">
          {users.length} user{users.length !== 1 ? 's' : ''} with access
        </div>
      </div>

      {/* Add user form */}
      {isAddingUser && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as User['role'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="readonly">Read Only</option>
                <option value="cardholder">Card Holder</option>
                <option value="secondary">Secondary User</option>
                <option value="primary">Primary User</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg font-montserrat text-sm hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
              <button
                onClick={() => setIsAddingUser(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-montserrat text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`
                p-3 rounded-lg border transition-all duration-200 cursor-pointer
                ${selectedUser === user.id 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar with status */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>
                    <div className={`
                      absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
                      ${getStatusColor(user.status)}
                    `}></div>
                  </div>

                  {/* User info */}
                  <div>
                    <h3 className="font-montserrat text-sm font-semibold text-gray-800">
                      {user.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="font-montserrat text-xs text-gray-600">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role badge */}
                <div className="flex items-center space-x-2">
                  <span className={`
                    px-2 py-1 rounded-full font-montserrat text-xs font-medium
                    ${getRoleColor(user.role)}
                  `}>
                    {user.role}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(selectedUser === user.id ? null : user.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded user details */}
              {selectedUser === user.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="space-y-2">
                    <div>
                      <label className="block font-montserrat text-xs font-medium text-gray-700 mb-1">
                        Change Role
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value as User['role'])}
                        className="w-full px-2 py-1 border border-gray-300 rounded font-montserrat text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="readonly">Read Only</option>
                        <option value="cardholder">Card Holder</option>
                        <option value="secondary">Secondary User</option>
                        <option value="primary">Primary User</option>
                      </select>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded font-montserrat text-xs hover:bg-gray-200 transition-colors">
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      
                      {user.role !== 'primary' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded font-montserrat text-xs hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span>Access Levels:</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Key className="w-3 h-3 text-blue-600" />
              <span>Primary: Full control</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-green-600" />
              <span>Secondary: Manage & transact</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-3 h-3 text-purple-600" />
              <span>Cardholder: Spend only</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-3 h-3 text-gray-600" />
              <span>Read Only: View access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};