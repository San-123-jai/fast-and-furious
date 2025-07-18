import React, { useEffect, useState } from 'react';
import { profileApi } from './api';
import { Link } from 'react-router-dom';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi.getProfile().then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center p-8">Loading profile...</div>;
  if (!profile) return <div className="text-center p-8 text-red-500">Profile not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <Link to="/profile/edit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Profile</Link>
        </div>
        <p className="text-gray-600 mb-2">{profile.email}</p>
        {profile.bio && <p className="mb-4">{profile.bio}</p>}
        {profile.location && <p className="mb-4"><b>Location:</b> {profile.location}</p>}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Skills</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill: string, idx: number) => (
              <li key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</li>
            )) : <span className="text-gray-400">No skills listed.</span>}
          </ul>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Experience</h2>
          {profile.experiences && profile.experiences.length > 0 ? (
            <ul>
              {profile.experiences.map((exp: any) => (
                <li key={exp.id} className="mb-2">
                  <div className="font-semibold">{exp.title} at {exp.company}</div>
                  <div className="text-sm text-gray-500">{exp.start_date} - {exp.end_date || 'Present'}</div>
                  <div>{exp.description}</div>
                </li>
              ))}
            </ul>
          ) : <span className="text-gray-400">No experience listed.</span>}
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Education</h2>
          {profile.educations && profile.educations.length > 0 ? (
            <ul>
              {profile.educations.map((ed: any) => (
                <li key={ed.id} className="mb-2">
                  <div className="font-semibold">{ed.degree} in {ed.field}</div>
                  <div className="text-sm text-gray-500">{ed.school} ({ed.start_date} - {ed.end_date || 'Present'})</div>
                </li>
              ))}
            </ul>
          ) : <span className="text-gray-400">No education listed.</span>}
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 