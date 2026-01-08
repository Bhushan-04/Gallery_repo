import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    name: string;
    color: string;
}

interface AppState {
    user: User | null;
    activeImageId: string | null;
    isFeedOpen: boolean;
    setUser: (user: User) => void;
    setActiveImageId: (id: string | null) => void;
    setIsFeedOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            activeImageId: null,
            isFeedOpen: false, // Default closed for immersive view
            setUser: (user) => set({ user }),
            setActiveImageId: (id) => set({ activeImageId: id }),
            setIsFeedOpen: (isOpen) => set({ isFeedOpen: isOpen }),
        }),
        {
            name: 'gallery-storage',
            partialize: (state) => ({ user: state.user }), // Only persist user
        }
    )
);

export const generateRandomUser = (): User => {
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Riley', 'Avery'];

    return {
        id: crypto.randomUUID(),
        name: names[Math.floor(Math.random() * names.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
    };
};
