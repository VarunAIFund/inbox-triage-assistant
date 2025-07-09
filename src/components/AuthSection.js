import React from 'react';

const AuthSection = ({ onAuthenticate, isLoading, error }) => {
  const handleAuthClick = async () => {
    try {
      await onAuthenticate();
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-96">
      <div className="bg-white border border-gray-300 rounded-lg p-10 text-center max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Connect to Gmail</h2>
        <p className="mb-6 text-gray-600">Authorize access to your Gmail account to start organizing your emails.</p>
        
        {error && (
          <div className="text-red-600 mb-4 p-3 bg-red-50 rounded border border-red-200">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleAuthClick} 
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded text-base transition-colors"
        >
          {isLoading ? 'Connecting...' : 'Connect Gmail'}
        </button>
      </div>
    </div>
  );
};

export default AuthSection;