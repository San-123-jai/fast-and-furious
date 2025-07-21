import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  lines = 1, 
  height = 'h-4' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded ${height} mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex space-x-4">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}; 