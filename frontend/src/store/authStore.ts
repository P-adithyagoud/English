import { create } from 'zustand';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  learning_goal?: string;
  english_level?: string;
  confidence_level?: number;
  weak_areas?: string[];
  learning_style?: string;
  daily_goal?: string;
  streak: number;
  xp: number;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('fluentflow_token'),
  user: localStorage.getItem('fluentflow_user') 
    ? JSON.parse(localStorage.getItem('fluentflow_user')!) 
    : null,
  isAuthenticated: !!localStorage.getItem('fluentflow_token'),
  
  setAuth: (token, user) => {
    localStorage.setItem('fluentflow_token', token);
    localStorage.setItem('fluentflow_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  
  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem('fluentflow_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },
  
  logout: () => {
    localStorage.removeItem('fluentflow_token');
    localStorage.removeItem('fluentflow_user');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
