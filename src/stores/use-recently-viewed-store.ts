import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TRecentlyViewedPerson = {
  id: string;
  first_name: string;
  last_name: string;
};

type RecentlyViewedStore = {
  recentlyViewed: TRecentlyViewedPerson[];
  addPerson: (person: TRecentlyViewedPerson) => void;
  clearRecentlyViewed: () => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      addPerson: (person) =>
        set((state) => {
          // Remove if person already exists
          const filtered = state.recentlyViewed.filter((p) => p.id !== person.id);
          // Add new person to start of array, limit to 5 items
          const updated = [person, ...filtered].slice(0, 5);
          return { recentlyViewed: updated };
        }),
      clearRecentlyViewed: () => set({ recentlyViewed: [] })
    }),
    {
      name: 'recently-viewed-storage'
    }
  )
);
