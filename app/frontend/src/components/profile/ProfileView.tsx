import React from 'react';
import { Link } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import ProfileActivity from './ProfileActivity';
import { mockProfile } from './mockProfileData';

const ProfileView: React.FC = () => {
  // In real app, fetch profile data from API. Here, use mockProfile for classic LinkedIn look.
  const profile = mockProfile;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-end mb-4">
        <Link to="/profile/edit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Profile</Link>
      </div>
      <ProfileHeader
        avatarUrl={profile.avatarUrl}
        name={profile.name}
        title={profile.title}
        location={profile.location}
        socialLinks={profile.socialLinks}
      />
      <ProfileInfo
        bio={profile.bio}
        skills={profile.skills}
        experiences={profile.experiences}
        educations={profile.educations}
        contact={profile.contact}
      />
      <ProfileActivity
        activity={profile.activity}
        connectionCount={profile.connectionCount}
        mutualConnections={profile.mutualConnections}
      />
    </div>
  );
};

export default ProfileView; 