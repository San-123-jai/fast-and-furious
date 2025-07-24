const API_URL = import.meta.env.VITE_API_URL || 'https://fast-and-furious-backend-3sqe.onrender.com';

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

  deleteProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  undoDeleteProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile/undo-delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
}; 