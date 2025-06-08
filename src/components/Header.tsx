import React from 'react';
import { Settings, User, Bell, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-deep-navy text-cream border-b border-charcoal-grey">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Fixed with proper Raleway font and dusty pink asterisk */}
          <div className="flex items-center space-x-3">
            <div className="font-raleway text-headline font-bold text-cream">
              Brilliant<span className="text-dusty-pink">*</span>
            </div>
            <div className="h-6 w-px bg-light-medium-grey"></div>
            <h1 className="font-playfair text-h4 text-cream">
              Liquidity Canvas Builder
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button className="font-montserrat text-subtitle text-cream hover:text-gold transition-colors">
              Canvas
            </button>
            <button className="font-montserrat text-subtitle text-cream hover:text-gold transition-colors">
              Clients
            </button>
            <button className="font-montserrat text-subtitle text-cream hover:text-gold transition-colors">
              Templates
            </button>
            <button className="font-montserrat text-subtitle text-cream hover:text-gold transition-colors">
              Reports
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-cream hover:text-gold transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-cream hover:text-gold transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="text-cream hover:text-gold transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-light-medium-grey"></div>
            <button className="flex items-center space-x-2 text-cream hover:text-gold transition-colors">
              <User className="w-5 h-5" />
              <span className="font-montserrat text-subtitle">Advisor</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};