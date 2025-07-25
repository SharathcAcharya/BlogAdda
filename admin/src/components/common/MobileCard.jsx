import React from 'react';

const MobileCard = ({ title, subtitle, avatar, stats, actions, badges = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {avatar && (
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              {avatar}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map((badge, index) => (
              <span key={index} className={`px-2 py-1 text-xs rounded-full ${badge.className}`}>
                {badge.text}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-2">
              <div className="text-sm font-semibold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Actions */}
      {actions && (
        <div className="flex justify-end space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default MobileCard;
