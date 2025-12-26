import { create } from "zustand";

interface FiltersStore {
  service: string;
  region: string;
  eventType: string;
  setService: (service: string) => void;
  setRegion: (region: string) => void;
  setEventType: (eventType: string) => void;
  clearService: () => void;
  clearRegion: () => void;
  clearEventType: () => void;
  clearAll: () => void;
}

export const useFiltersStore = create<FiltersStore>((set) => ({
  service: "all",
  region: "all",
  eventType: "all",
  setService: (service) => set({ service }),
  setRegion: (region) => set({ region }),
  setEventType: (eventType) => set({ eventType }),
  clearService: () => set({ service: "all" }),
  clearRegion: () => set({ region: "all" }),
  clearEventType: () => set({ eventType: "all" }),
  clearAll: () => set({ service: "all", region: "all", eventType: "all" }),
}));
