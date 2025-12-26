import { create } from "zustand";

type ChartLayout = "horizontal" | "vertical";

interface ChartLayoutStore {
  layout: ChartLayout;
  setLayout: (layout: ChartLayout) => void;
  toggleLayout: () => void;
}

export const useChartLayoutStore = create<ChartLayoutStore>((set) => ({
  layout: "horizontal",
  setLayout: (layout) => set({ layout }),
  toggleLayout: () =>
    set((state) => ({
      layout: state.layout === "horizontal" ? "vertical" : "horizontal",
    })),
}));
