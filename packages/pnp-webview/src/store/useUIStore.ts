import { create } from 'zustand';

interface UIState {
    // State (using array instead of Set for serializability)
    expandedGroups: string[];
    theme: 'light' | 'dark';

    // Actions
    toggleGroup: (groupName: string) => void;
    expandGroup: (groupName: string) => void;
    collapseGroup: (groupName: string) => void;
    isGroupExpanded: (groupName: string) => boolean;
    setTheme: (theme: 'light' | 'dark') => void;
    reset: () => void;
}

const initialState = {
    expandedGroups: [],
    theme: 'light' as const,
};

export const useUIStore = create<UIState>((set, get) => ({
    ...initialState,

    toggleGroup: (groupName) =>
        set((state) => {
            const isExpanded = state.expandedGroups.includes(groupName);
            if (isExpanded) {
                return { expandedGroups: state.expandedGroups.filter(g => g !== groupName) };
            } 
            return { expandedGroups: [...state.expandedGroups, groupName] };
        }),

    expandGroup: (groupName) =>
        set((state) => {
            if (state.expandedGroups.includes(groupName)) {
                return state; // No change needed
            }
            return { expandedGroups: [...state.expandedGroups, groupName] };
        }),

    collapseGroup: (groupName) =>
        set((state) => ({
            expandedGroups: state.expandedGroups.filter(g => g !== groupName),
        })),

    isGroupExpanded: (groupName) => {
        const state = get();
        return state.expandedGroups.includes(groupName);
    },

    setTheme: (theme) => set({ theme }),

    reset: () => set(initialState),
}));
