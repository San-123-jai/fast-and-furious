import React, { useState } from 'react';

interface Experience {
  id: number;
  title: string;
  company: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  start_date?: string;
  end_date?: string;
}

interface ProfileInfoProps {
  bio?: string;
  skills?: string[];
  experiences?: Experience[];
  educations?: Education[];
  contact?: { email?: string; phone?: string; };
}

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button
        className="w-full flex justify-between items-center py-2 px-3 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-gray-700">{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="p-3 bg-white border rounded-b shadow-sm">{children}</div>}
    </div>
  );
};

const ProfileInfo: React.FC<ProfileInfoProps> = ({ bio, skills, experiences, educations, contact }) => {
  return (
    <div className="mt-6">
      <Section title="Bio">
        <p className="text-gray-800 whitespace-pre-line">{bio || 'No bio provided.'}</p>
      </Section>
      <Section title="Skills">
        {skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{skill}</span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">No skills listed.</span>
        )}
      </Section>
      <Section title="Experience">
        {experiences && experiences.length > 0 ? (
          <ul className="space-y-3">
            {experiences.map((exp) => (
              <li key={exp.id} className="border-b pb-2">
                <div className="font-semibold text-gray-800">{exp.title} @ {exp.company}</div>
                <div className="text-gray-500 text-sm">
                  {exp.start_date} - {exp.end_date || 'Present'}
                </div>
                {exp.description && <div className="mt-1 text-gray-700 text-sm">{exp.description}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500">No experience listed.</span>
        )}
      </Section>
      <Section title="Education">
        {educations && educations.length > 0 ? (
          <ul className="space-y-3">
            {educations.map((ed) => (
              <li key={ed.id} className="border-b pb-2">
                <div className="font-semibold text-gray-800">{ed.degree} in {ed.field}</div>
                <div className="text-gray-500 text-sm">{ed.school} ({ed.start_date} - {ed.end_date || 'Present'})</div>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500">No education listed.</span>
        )}
      </Section>
      <Section title="Contact Information">
        <div className="space-y-1">
          <div>Email: <span className="text-gray-700">{contact?.email || 'N/A'}</span></div>
          <div>Phone: <span className="text-gray-700">{contact?.phone || 'N/A'}</span></div>
        </div>
      </Section>
    </div>
  );
};

export default ProfileInfo; 