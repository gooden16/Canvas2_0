// src/components/Header.tsx

import React from 'react';
import { Settings, Bell, User, HelpCircle, MoreHorizontal } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="font-playfair text-xl font-bold text-gray-900">
                Liquidity Canvas
              </h1>
              <p className="font-montserrat text-sm text-gray-500">
                Financial Building Blocks
              </p>
            </div>
          </div>
        </div>

        {/* Center - Canvas title */}
        <div className="flex-1 max-w-md mx-8">
          <div className="text-center">
            <h2 className="font-montserrat text-lg font-semibold text-gray-800">
              My Financial Canvas
            </h2>
            <p className="font-montserrat text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right side - Actions and user */}
        <div className="flex items-center space-x-3">
          {/* Help */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="hidden md:block">
              <p className="font-montserrat text-sm font-medium text-gray-700">
                John Smith
              </p>
              <p className="font-montserrat text-xs text-gray-500">
                Primary User
              </p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};