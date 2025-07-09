import React, { useState, useEffect } from 'react';
import ClusterCard from './ClusterCard';
import LoadingSpinner from './LoadingSpinner';
import { emailAPI } from '../services/api';

const ClustersList = () => {
  const [clusters, setClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClusters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await emailAPI.getClusters();
      setClusters(response.data.clusters);
    } catch (err) {
      setError('Failed to load email clusters');
      console.error('Error loading clusters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveCluster = async (emailIds) => {
    try {
      const response = await emailAPI.archiveEmails(emailIds);
      
      if (response.data.success) {
        setClusters(prevClusters => 
          prevClusters
            .map(cluster => ({
              ...cluster,
              emails: cluster.emails.filter(email => !emailIds.includes(email.id)),
              unreadCount: cluster.emails.filter(email => 
                !emailIds.includes(email.id) && email.isUnread
              ).length
            }))
            .filter(cluster => cluster.emails.length > 0)
        );
        
        console.log(`Archived ${response.data.archivedCount} emails successfully!`);
      }
    } catch (err) {
      console.error('Failed to archive emails:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Analyzing your emails..." />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="bg-white border border-red-500 rounded-lg p-10 text-center max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4">❌ Error</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button 
            onClick={loadClusters} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalEmails = clusters.reduce((sum, cluster) => sum + cluster.emails.length, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 p-5 bg-gray-50 rounded-lg">
        <button 
          onClick={loadClusters} 
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded transition-colors"
        >
          🔄 Refresh
        </button>
        <div className="flex gap-5 text-gray-600 text-sm">
          <span>{totalEmails} emails analyzed</span>
          <span>{clusters.length} clusters found</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
        {clusters.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-600">
            <p>No email clusters found. Your inbox might be empty or already well organized!</p>
          </div>
        ) : (
          clusters.map((cluster, index) => (
            <ClusterCard
              key={`${cluster.type}-${cluster.name}-${index}`}
              cluster={cluster}
              onArchive={handleArchiveCluster}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ClustersList;