import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileApi } from './api';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        // Defensive: check for error in response
        if (data.error || data.msg) {
          setError(data.error || data.msg || 'Failed to load profile');
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNotifications = () => {
    // TODO: Implement notifications functionality
    alert('Notifications feature coming soon!');
  };

  const handleMessages = () => {
    // TODO: Implement messages functionality
    alert('Messages feature coming soon!');
  };

  if (loading) return <div className="text-center p-8">Loading profile...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!profile) return <div className="text-center p-8">Profile not found</div>;

  // Defensive: fallback for fullName
  const fullName = ((profile.first_name || '') + ' ' + (profile.last_name || '')).trim() || profile.username || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logout */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-wider" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>BOSS</h1>
          <div className="flex items-center space-x-4">
            {/* Notification Icon - Modern Bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" onClick={handleNotifications}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                3
              </span>
            </button>
            
            {/* Message Icon - Modern Chat Bubble */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" onClick={handleMessages}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              {/* Message Badge */}
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                2
              </span>
            </button>
            
            {/* Posts Button */}
            <Link to="/posts" className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-2 rounded hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
              Posts
            </Link>
            
            <Link to="/profile/edit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header - Classic Elegant Style */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative">
            {/* Classic damask pattern overlay */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 80c-16.6 0-30-13.4-30-30s13.4-30 30-30 30 13.4 30 30-13.4 30-30 30zm0-50c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            {/* Elegant border accent */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"></div>
            {/* Subtle inner shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
            {/* Classic corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-amber-400 opacity-60"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-2 border-amber-400 opacity-60"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-amber-400 opacity-60"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-amber-400 opacity-60"></div>
          </div>
          
          {/* Profile Image and Basic Info */}
          <div className="relative px-6 pb-6">
            <div className="absolute -top-16 left-6">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
                {profile.profile_image ? (
                  <img 
                    src={`http://localhost:5000${profile.profile_image}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const nextSibling = target.nextElementSibling as HTMLElement;
                      if (nextSibling) {
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl bg-gray-100" style={{ display: profile.profile_image ? 'none' : 'flex' }}>
                  {fullName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="pt-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h1>
              {profile.headline && (
                <p className="text-lg text-gray-600 mb-2">{profile.headline}</p>
              )}
              {profile.company && profile.job_title && (
                <p className="text-gray-600 mb-1">{profile.job_title} at {profile.company}</p>
              )}
              {profile.location && (
                <p className="text-gray-500 text-sm mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content - Classic Elegant Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profile.bio && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>About</h2>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Experience */}
            {profile.experiences && profile.experiences.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Experience</h2>
                <div className="space-y-6">
                  {profile.experiences.map((exp: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-amber-500 pl-4 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-amber-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 text-lg">{exp.title}</h3>
                      <p className="text-amber-600 font-medium">{exp.company}</p>
                      <p className="text-gray-500 text-sm mb-2">
                        {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                        {exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.educations && profile.educations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Education</h2>
                <div className="space-y-6">
                  {profile.educations.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-slate-500 pl-4 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-slate-500 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 text-lg">{edu.school}</h3>
                      <p className="text-gray-600">{edu.degree} in {edu.field}</p>
                      <p className="text-gray-500 text-sm">
                        {edu.start_date && new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                        {edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  to="/posts" 
                  className="flex items-center justify-between w-full bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 px-4 py-3 rounded-lg hover:from-amber-100 hover:to-yellow-100 transition-all duration-200 border border-amber-200 hover:border-amber-300"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">View My Posts</span>
                  </div>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                <Link 
                  to="/posts/create" 
                  className="flex items-center justify-between w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-3 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200 hover:border-blue-300"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Create New Post</span>
                  </div>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Contact Info</h2>
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {profile.email}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {profile.phone}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5a1 1 0 011.414 0l1.5 1.5a1 1 0 001.414-1.414l-1.5-1.5a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3a2 2 0 012.828 0z" clipRule="evenodd" />
                    </svg>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Info */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Professional Info</h2>
              <div className="space-y-3">
                {profile.industry && (
                  <div>
                    <span className="text-gray-500 text-sm">Industry</span>
                    <p className="text-gray-900 font-medium">{profile.industry}</p>
                  </div>
                )}
                {profile.company && (
                  <div>
                    <span className="text-gray-500 text-sm">Company</span>
                    <p className="text-gray-900 font-medium">{profile.company}</p>
                  </div>
                )}
                {profile.job_title && (
                  <div>
                    <span className="text-gray-500 text-sm">Job Title</span>
                    <p className="text-gray-900 font-medium">{profile.job_title}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="mt-8 text-center">
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 