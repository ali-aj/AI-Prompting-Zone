import axios from 'axios';

export interface StudentProgress {
  prompts: number;
  appsUnlocked: string[];
  customAgentsCreated?: number;
}

export const progressService = {
  // Get progress for the currently authenticated student
  getProgress: async (): Promise<StudentProgress> => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student-progress/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  // Update progress for the currently authenticated student
  updateProgress: async (progress: Partial<StudentProgress>): Promise<StudentProgress> => {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/student-progress/me`,
      progress,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },
}; 