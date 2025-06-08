// src/components/blocks/UserBlock.tsx

import React from 'react';
import { UserBlock as UserBlockType } from '../../types/canvas';
import { 
  Users, 
  User, 
  Shield, 
  Edit3, 
  Circle,
  Eye,
  Settings,
  CreditCard,
  Key,
  Trash2
} from 'lucide-react';

interface UserBlockProps {
  block: UserBlockType;
  onEdit: () => void;
  onDelete: () => void;
  onConnectionStart: (port: string) => void;
  onConnectionEnd: (port: string) => void;
  isConnecting?: boolean;
}

export const UserBlock: React.FC<UserBlockProps> = ({
  block,
  onEdit,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  isConnecting = false
}) => {
  const getBlockIcon = () => {
    return block.role === 'primary' ? User : Users;
  };

  const getBlockColor = () => {
    switch (block.role) {
      case 'primary':
        return 'bg-gold bg-opacity-20 border-gold';
      case 'secondary':
        return 'bg-gold bg-opacity-15 border-gold border-opacity-70';
      case 'readonly':
        return 'bg-gold bg-opacity-10 border-gold border-opacity-50';
      case 'cardholder':
        return 'bg-gold bg-opacity-25 border-gold';
      default:
        return 'bg-gold bg-opacity-10 border-gold border-opacity-50';
    }
  };

  const getStatusColor = () => {
    switch (block.status) {
      case 'active':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'disabled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleLabel = () => {
    switch (block.role) {
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

  const getRoleIcon = () => {
    switch (block.role) {
      case 'primary':
        return Key;
      case 'secondary':
        return Settings;
      case 'readonly':
        return Eye;
      case 'cardholder':
        return CreditCard;
      default:
        return User;
    }
  };

  const getPermissionLevel = () => {
    if (!block.permissions || block.permissions.length === 0) return 'None';
    
    const hasAll = block.permissions.includes('all');
    const hasTransact = block.permissions.includes('transact');
    const hasView = block.permissions.includes('view');
    const hasManage = block.permissions.includes('manage');

    if (hasAll) return 'Full Access';
    if (hasManage) return 'Manage';
    if (hasTransact) return 'Transact';
    if (hasView) return 'View Only';
    
    return 'Limited';
  };

  const getPermissionColor = () => {
    const level = getPermissionLevel();
    switch (level) {
      case 'Full Access':
        return 'text-red-600 bg-red-100';
      case 'Manage':
        return 'text-orange-600 bg-orange-100';
      case 'Transact':
        return 'text-blue-600 bg-blue-100';
      case 'View Only':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const IconComponent = getBlockIcon();
  const RoleIconComponent = getRoleIcon();

  return (
    <div className={`
      relative w-full h-full 
      bg-white border-2 rounded-lg shadow-sm
      hover:shadow-md transition-all duration-200
      ${getBlockColor()}
      ${isConnecting ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
    `}>
      {/* Block Header */}
      <div className="flex items-center justify-between p-3 border-b border-light-grey">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gold bg-opacity-30 rounded">
            <IconComponent className="w-4 h-4 text-charcoal-grey" />
          </div>
          <div>
            <h3 className="font-montserrat text-sm font-bold text-charcoal-grey leading-tight">
              {block.name}
            </h3>
            <p className="font-montserrat text-xs text-medium-grey">
              {getRoleLabel()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Status indicator */}
          <Circle className={`w-2 h-2 fill-current ${getStatusColor()}`} />
          
          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-medium-grey hover:text-charcoal-grey transition-colors"
            title="Edit permissions"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete "${block.name}"?`)) {
                onDelete();
              }
            }}
            className="p-1 text-medium-grey hover:text-red-600 transition-colors"
            title="Delete user block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-3 space-y-2">
        {/* Role & Access Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <RoleIconComponent className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Role</span>
          </div>
          <span className="font-montserrat text-xs text-charcoal-grey font-medium capitalize">
            {block.role}
          </span>
        </div>

        {/* Permission Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Access</span>
          </div>
          <span className={`
            px-1.5 py-0.5 text-xs rounded font-medium
            ${getPermissionColor()}
          `}>
            {getPermissionLevel()}
          </span>
        </div>

        {/* Access Scope */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Settings className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Scope</span>
          </div>
          <span className="font-montserrat text-xs text-charcoal-grey">
            {block.accessLevel || 'Standard'}
          </span>
        </div>

        {/* Permissions List */}
        {block.permissions && block.permissions.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="font-montserrat text-xs text-medium-grey">Permissions:</span>
            <div className="flex flex-wrap gap-1">
              {block.permissions.slice(0, 3).map((permission, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-medium capitalize"
                >
                  {permission}
                </span>
              ))}
              {block.permissions.length > 3 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                  +{block.permissions.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Special access indicators */}
        {block.role === 'primary' && (
          <div className="flex items-center space-x-1 pt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-montserrat text-xs text-blue-600">
              Full admin access
            </span>
          </div>
        )}

        {block.role === 'cardholder' && (
          <div className="flex items-center space-x-1 pt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-montserrat text-xs text-green-600">
              Card spending enabled
            </span>
          </div>
        )}

        {block.role === 'readonly' && (
          <div className="flex items-center space-x-1 pt-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="font-montserrat text-xs text-gray-600">
              View access only
            </span>
          </div>
        )}
      </div>

      {/* Security indicator */}
      <div className="absolute top-1 right-1">
        <div className="w-3 h-3 bg-gold rounded-full border border-white flex items-center justify-center">
          <Shield className="w-2 h-2 text-white" />
        </div>
      </div>
    </div>
  );
};