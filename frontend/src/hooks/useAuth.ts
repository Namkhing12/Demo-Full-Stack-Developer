import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    role: string;
    tenant: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('accessToken') || null,
    login: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', token);
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        set({ user: null, token: null });
    },
}));
