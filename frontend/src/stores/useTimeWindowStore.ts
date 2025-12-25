import { create } from "zustand";

const TIME_WINDOWS = ["Live", "5m", "30m", "1h"] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

interface TimeWindowStore {
  timeWindow: TimeWindow;
  setTimeWindow: (window: TimeWindow) => void;
  lastRefresh: number;
  triggerRefresh: () => void;
}

export const useTimeWindowStore = create<TimeWindowStore>((set) => ({
  timeWindow: "Live",
  setTimeWindow: (window) => set({ timeWindow: window }),
  lastRefresh: Date.now(),
  triggerRefresh: () => set({ lastRefresh: Date.now() }),
}));
