import React, { useEffect, useState } from 'react';
import { profileApi } from './api';
import { useNavigate } from 'react-router-dom';

const emptyExperience = { title: '', company: '', start_date: '', end_date: '', description: '' };
const emptyEducation = { school: '', degree: '', field: '', start_date: '', end_date: '' };

const ProfileEdit: React.FC = () => {
  const [form, setForm] = useState<any>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    website: '',
    headline: '',
    industry: '',
    company: '',
    job_title: '',
    bio: '',
    location: '',
    skills: [],
    experiences: [],
    educations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    profileApi.getProfile().then(data => {
      setForm({
        ...data,
        skills: data.skills || [],
        experiences: data.experiences || [],
        educations: data.educations || [],
      });
      setImagePreview(data.profile_image);
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await profileApi.uploadImage(formData);
      setForm((prev: any) => ({ ...prev, profile_image: response.image_url }));
    } catch (err) {
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-wider" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Edit Profile</h1>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Profile Image Upload */}
        <div className="mb-8">
          <label className="block font-semibold mb-4 text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Profile Image</label>
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-amber-200 shadow-lg">
              {imagePreview ? (
                <img 
                  src={imagePreview.startsWith('data:') ? imagePreview : `http://localhost:5000${imagePreview}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-colors"
                disabled={uploading}
              />
              {uploading && (
                <div className="flex items-center mt-2 text-amber-600">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">First Name</label>
              <input 
                name="first_name" 
                value={form.first_name ?? ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Last Name</label>
              <input 
                name="last_name" 
                value={form.last_name ?? ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-gray-700 mb-2">Username</label>
            <input 
              name="username" 
              value={form.username ?? ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
            />
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-gray-700 mb-2">Email</label>
            <input 
              name="email" 
              value={form.email ?? ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
            />
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-gray-700 mb-2">Professional Headline</label>
            <input 
              name="headline" 
              value={form.headline ?? ''} 
              onChange={handleChange} 
              placeholder="e.g., Senior Software Engineer" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Phone</label>
              <input 
                name="phone" 
                value={form.phone ?? ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Website</label>
              <input 
                name="website" 
                value={form.website ?? ''} 
                onChange={handleChange} 
                placeholder="https://yourwebsite.com" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Industry</label>
              <input 
                name="industry" 
                value={form.industry ?? ''} 
                onChange={handleChange} 
                placeholder="e.g., Technology" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Company</label>
              <input 
                name="company" 
                value={form.company ?? ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Job Title</label>
              <input 
                name="job_title" 
                value={form.job_title ?? ''} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-gray-700 mb-2">Bio</label>
            <textarea 
              name="bio" 
              value={form.bio ?? ''} 
              onChange={handleChange} 
              rows={4} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none" 
            />
          </div>

          <div className="mt-6">
            <label className="block font-semibold text-gray-700 mb-2">Location</label>
            <input 
              name="location" 
              value={form.location ?? ''} 
              onChange={handleChange} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
            />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Skills</h2>
          <div className="space-y-3">
            {form.skills.map((skill: string, idx: number) => (
              <div key={idx} className="flex gap-3">
                <input 
                  value={skill ?? ''} 
                  onChange={e => handleSkillChange(idx, e.target.value)} 
                  placeholder="Enter a skill"
                  className="border border-gray-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                />
              </div>
            ))}
            <button 
              type="button" 
              onClick={addSkill} 
              className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors font-medium"
            >
              + Add Skill
            </button>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Experience</h2>
          <div className="space-y-6">
            {form.experiences.map((exp: any, idx: number) => (
              <div key={idx} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input 
                    placeholder="Job Title" 
                    value={exp.title ?? ''} 
                    onChange={e => handleExpChange(idx, 'title', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                  <input 
                    placeholder="Company" 
                    value={exp.company ?? ''} 
                    onChange={e => handleExpChange(idx, 'company', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input 
                    placeholder="Start Date" 
                    type="date" 
                    value={exp.start_date ?? ''} 
                    onChange={e => handleExpChange(idx, 'start_date', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                  <input 
                    placeholder="End Date" 
                    type="date" 
                    value={exp.end_date ?? ''} 
                    onChange={e => handleExpChange(idx, 'end_date', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                </div>
                <textarea 
                  placeholder="Description" 
                  value={exp.description ?? ''} 
                  onChange={e => handleExpChange(idx, 'description', e.target.value)} 
                  rows={3}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none" 
                />
              </div>
            ))}
            <button 
              type="button" 
              onClick={addExperience} 
              className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors font-medium"
            >
              + Add Experience
            </button>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Education</h2>
          <div className="space-y-6">
            {form.educations.map((ed: any, idx: number) => (
              <div key={idx} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input 
                    placeholder="School" 
                    value={ed.school ?? ''} 
                    onChange={e => handleEduChange(idx, 'school', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                  <input 
                    placeholder="Degree" 
                    value={ed.degree ?? ''} 
                    onChange={e => handleEduChange(idx, 'degree', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                  <input 
                    placeholder="Field of Study" 
                    value={ed.field ?? ''} 
                    onChange={e => handleEduChange(idx, 'field', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Start Date" 
                    type="date" 
                    value={ed.start_date ?? ''} 
                    onChange={e => handleEduChange(idx, 'start_date', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                  <input 
                    placeholder="End Date" 
                    type="date" 
                    value={ed.end_date ?? ''} 
                    onChange={e => handleEduChange(idx, 'end_date', e.target.value)} 
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" 
                  />
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addEducation} 
              className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors font-medium"
            >
              + Add Education
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center pt-6">
          <button 
            type="submit" 
            disabled={saving} 
            className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-8 py-3 rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit; 