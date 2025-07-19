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
      <div className="bg-white rounded-lg shadow p-6">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back to Profile
        </button>
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        
        {/* Profile Image Upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Profile Image</label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {imagePreview ? (
                <img 
                  src={imagePreview.startsWith('data:') ? imagePreview : `http://localhost:5000${imagePreview}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">First Name</label>
              <input name="first_name" value={form.first_name || ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold">Last Name</label>
              <input name="last_name" value={form.last_name || ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div>
            <label className="block font-semibold">Username</label>
            <input name="username" value={form.username} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block font-semibold">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block font-semibold">Professional Headline</label>
            <input name="headline" value={form.headline || ''} onChange={handleChange} placeholder="e.g., Senior Software Engineer" className="w-full border p-2 rounded" />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Phone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold">Website</label>
              <input name="website" value={form.website || ''} onChange={handleChange} placeholder="https://yourwebsite.com" className="w-full border p-2 rounded" />
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold">Industry</label>
              <input name="industry" value={form.industry || ''} onChange={handleChange} placeholder="e.g., Technology" className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold">Company</label>
              <input name="company" value={form.company || ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-semibold">Job Title</label>
              <input name="job_title" value={form.job_title || ''} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div>
            <label className="block font-semibold">Bio</label>
            <textarea name="bio" value={form.bio || ''} onChange={handleChange} rows={4} className="w-full border p-2 rounded" />
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