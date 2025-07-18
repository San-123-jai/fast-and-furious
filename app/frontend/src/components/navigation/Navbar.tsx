import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-blue-700 font-semibold hover:underline">Profile</Link>
            {/* Add more navigation items here if needed */}
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hello, <b>{user.username}</b></span>
              <button onClick={handleSignOut} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Sign Out</button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 