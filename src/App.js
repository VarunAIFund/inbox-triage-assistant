import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthSection from './components/AuthSection';
import ClustersList from './components/ClustersList';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isAuthenticated, isLoading, error, authenticate, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-5">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">📧 Inbox Triage Assistant</h1>
          <p className="text-gray-600">Smart email clustering for better inbox management</p>
        </header>
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5">
      <header className="text-center mb-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">📧 Inbox Triage Assistant</h1>
            <p className="text-gray-600">Smart email clustering for better inbox management</p>
          </div>
          {isAuthenticated && (
            <button 
              onClick={logout} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              🚪 Logout
            </button>
          )}
        </div>
      </header>

      <main className="mt-5">
        {!isAuthenticated ? (
          <AuthSection 
            onAuthenticate={authenticate}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <ClustersList />
        )}
      </main>
    </div>
  );
}

export default App;
