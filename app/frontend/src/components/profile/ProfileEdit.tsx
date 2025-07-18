import React, { useEffect, useState } from 'react';
import { profileApi } from './api';
import { useNavigate } from 'react-router-dom';

const emptyExperience = { title: '', company: '', start_date: '', end_date: '', description: '' };
const emptyEducation = { school: '', degree: '', field: '', start_date: '', end_date: '' };

const ProfileEdit: React.FC = () => {
  const [form, setForm] = useState<any>({
    username: '',
    email: '',
    bio: '',
    location: '',
    skills: [],
    experiences: [],
    educations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    profileApi.getProfile().then(data => {
      setForm({
        ...data,
        skills: data.skills || [],
        experiences: data.experiences || [],
        educations: data.educations || [],
      });
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (idx: number, value: string) => {
    setForm((prev: any) => {
      const skills = [...prev.skills];
      skills[idx] = value;
      return { ...prev, skills };
    });
  };
  const addSkill = () => setForm((prev: any) => ({ ...prev, skills: [...prev.skills, ''] }));
  const removeSkill = (idx: number) => setForm((prev: any) => ({ ...prev, skills: prev.skills.filter((_: any, i: number) => i !== idx) }));

  const handleExpChange = (idx: number, field: string, value: string) => {
    setForm((prev: any) => {
      const experiences = [...prev.experiences];
      experiences[idx] = { ...experiences[idx], [field]: value };
      return { ...prev, experiences };
    });
  };
  const addExperience = () => setForm((prev: any) => ({ ...prev, experiences: [...prev.experiences, { ...emptyExperience }] }));
  const removeExperience = (idx: number) => setForm((prev: any) => ({ ...prev, experiences: prev.experiences.filter((_: any, i: number) => i !== idx) }));

  const handleEduChange = (idx: number, field: string, value: string) => {
    setForm((prev: any) => {
      const educations = [...prev.educations];
      educations[idx] = { ...educations[idx], [field]: value };
      return { ...prev, educations };
    });
  };
  const addEducation = () => setForm((prev: any) => ({ ...prev, educations: [...prev.educations, { ...emptyEducation }] }));
  const removeEducation = (idx: number) => setForm((prev: any) => ({ ...prev, educations: prev.educations.filter((_: any, i: number) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await profileApi.updateProfile(form);
      navigate('/profile');
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold">Name</label>
            <input name="username" value={form.username} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-semibold">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-semibold">Bio</label>
            <textarea name="bio" value={form.bio || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-semibold">Location</label>
            <input name="location" value={form.location || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-semibold">Skills</label>
            {form.skills.map((skill: string, idx: number) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input value={skill} onChange={e => handleSkillChange(idx, e.target.value)} className="border p-2 rounded flex-1" />
                <button type="button" onClick={() => removeSkill(idx)} className="text-red-500">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addSkill} className="bg-blue-100 px-2 py-1 rounded">Add Skill</button>
          </div>
          <div>
            <label className="block font-semibold">Experience</label>
            {form.experiences.map((exp: any, idx: number) => (
              <div key={idx} className="border p-2 rounded mb-2">
                <input placeholder="Title" value={exp.title} onChange={e => handleExpChange(idx, 'title', e.target.value)} className="border p-1 rounded mr-2" />
                <input placeholder="Company" value={exp.company} onChange={e => handleExpChange(idx, 'company', e.target.value)} className="border p-1 rounded mr-2" />
                <input placeholder="Start Date" type="date" value={exp.start_date} onChange={e => handleExpChange(idx, 'start_date', e.target.value)} className="border p-1 rounded mr-2" />
                <input placeholder="End Date" type="date" value={exp.end_date} onChange={e => handleExpChange(idx, 'end_date', e.target.value)} className="border p-1 rounded mr-2" />
                <textarea placeholder="Description" value={exp.description} onChange={e => handleExpChange(idx, 'description', e.target.value)} className="border p-1 rounded w-full mt-1" />
                <button type="button" onClick={() => removeExperience(idx)} className="text-red-500 mt-1">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addExperience} className="bg-blue-100 px-2 py-1 rounded">Add Experience</button>
          </div>
          <div>
            <label className="block font-semibold">Education</label>
            {form.educations.map((ed: any, idx: number) => (
              <div key={idx} className="border p-2 rounded mb-2">
                <input placeholder="School" value={ed.school} onChange={e => handleEduChange(idx, 'school', e.target.value)} className="border p-1 rounded mr-2" />
                <input placeholder="Degree" value={ed.degree} onChange={e => handleEduChange(idx, 'degree', e.target.value)} className="border p-1 rounded mr-2" />
                <input placeholder="Field" value={ed.field} onChange={e => handleEduChange(idx, 'field', e.target.value)} className="border p-1 rounded mr-2" />
                <input placeholder="Start Date" type="date" value={ed.start_date} onChange={e => handleEduChange(idx, 'start_date', e.target.value)} className="border p-1 rounded mr-2" />
                <input placeholder="End Date" type="date" value={ed.end_date} onChange={e => handleEduChange(idx, 'end_date', e.target.value)} className="border p-1 rounded mr-2" />
                <button type="button" onClick={() => removeEducation(idx)} className="text-red-500 mt-1">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addEducation} className="bg-blue-100 px-2 py-1 rounded">Add Education</button>
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 