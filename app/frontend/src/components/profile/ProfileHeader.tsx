import React from 'react';

interface ProfileHeaderProps {
  avatarUrl?: string;
  name: string;
  title?: string;
  location?: string;
  socialLinks?: { label: string; url: string; icon?: React.ReactNode }[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  name,
  title,
  location,
  socialLinks = [],
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
      <img
        src={avatarUrl || '/default-avatar.png'}
        alt="User avatar"
        className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-md"
      />
      <div className="flex-1 flex flex-col items-center md:items-start">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{name}</h1>
        {title && <p className="text-blue-700 text-lg mt-1">{title}</p>}
        {location && <p className="text-gray-500 mt-1">{location}</p>}
        {socialLinks.length > 0 && (
          <div className="flex gap-4 mt-3 flex-wrap">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader; 