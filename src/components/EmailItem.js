import React from 'react';

const EmailItem = ({ email }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`px-4 py-3 border-b border-gray-200 last:border-b-0 flex justify-between items-center ${email.isUnread ? 'bg-blue-50 font-semibold' : ''}`}>
      <div className="text-sm flex-1 mr-3">
        {email.subject || '(No subject)'}
      </div>
      <div className="text-xs text-gray-600 max-w-48 overflow-hidden text-ellipsis whitespace-nowrap">
        {email.from}
      </div>
      <div className="text-xs text-gray-400 min-w-20 text-right ml-3">
        {formatDate(email.date)}
      </div>
    </div>
  );
};

export default EmailItem;