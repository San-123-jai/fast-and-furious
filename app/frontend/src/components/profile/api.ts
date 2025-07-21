const API_URL = 'http://localhost:5000';

export const profileApi = {
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  uploadImage: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },
}; 