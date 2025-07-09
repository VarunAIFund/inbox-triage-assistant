import React, { useState } from 'react';
import EmailItem from './EmailItem';

const ClusterCard = ({ cluster, onArchive, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const emailsToShow = isExpanded ? cluster.emails : cluster.emails.slice(0, 3);

  const getDateRange = (emails) => {
    if (emails.length === 0) return 'No emails';
    
    const dates = emails.map(email => new Date(email.date)).sort((a, b) => a - b);
    const oldest = dates[0];
    const newest = dates[dates.length - 1];
    
    const diffDays = Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday - Today';
    if (diffDays <= 7) return `${diffDays} days`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await onArchive(cluster.emails.map(email => email.id));
    } catch (error) {
      console.error('Failed to archive:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-semibold">{cluster.name}</div>
        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {cluster.type}
        </div>
      </div>
      
      <div className="text-gray-600 mb-4">{cluster.description}</div>
      
      <div className="flex gap-5 mb-5 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>📧</span>
          <span>{cluster.emails.length} emails</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔵</span>
          <span>{cluster.unreadCount} unread</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{getDateRange(cluster.emails)}</span>
        </div>
      </div>
      
      <div className="max-h-72 overflow-y-auto border border-gray-300 rounded mb-4">
        {emailsToShow.map((email, emailIndex) => (
          <EmailItem key={email.id} email={email} />
        ))}
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={handleArchive}
          disabled={isArchiving}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded transition-colors"
        >
          {isArchiving ? 'Archiving...' : `📁 Archive All (${cluster.emails.length})`}
        </button>
        
        {cluster.emails.length > 3 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded border border-gray-300 transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show All (${cluster.emails.length})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClusterCard;