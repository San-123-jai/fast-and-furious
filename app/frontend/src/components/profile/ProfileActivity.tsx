import React, { useState } from 'react';

interface ActivityItem {
  id: number;
  type: 'post' | 'like' | 'comment' | 'connection';
  content: string;
  date: string;
}

interface ProfileActivityProps {
  activity: ActivityItem[];
  connectionCount: number;
  mutualConnections: string[];
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({ activity, connectionCount, mutualConnections }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const showMore = () => setVisibleCount((c) => c + 5);

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="text-lg font-semibold text-gray-800">Activity</div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <span className="text-blue-700 font-bold">{connectionCount}</span> Connections
          {mutualConnections.length > 0 && (
            <span className="text-gray-500">· {mutualConnections.length} mutual</span>
          )}
        </div>
      </div>
      <ul className="space-y-3">
        {activity.slice(0, visibleCount).map((item) => (
          <li key={item.id} className="bg-gray-50 p-3 rounded shadow-sm border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">{new Date(item.date).toLocaleString()}</div>
            <div className="text-gray-800">{item.content}</div>
          </li>
        ))}
      </ul>
      {visibleCount < activity.length && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={showMore}
        >
          Show More
        </button>
      )}
    </div>
  );
};

export default ProfileActivity; 