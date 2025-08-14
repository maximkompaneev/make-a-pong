import { create } from "zustand";
import gameConfig from "../config/gameConfig";

type GameSettings = typeof gameConfig;

type GameStore = {
  settings: GameSettings;
  update: <K1 extends keyof GameSettings, K2 extends keyof GameSettings[K1]>(
    category: K1,
    key: K2,
    value: GameSettings[K1][K2]
  ) => void;
  reset: () => void;
};

export const useGameSettings = create<GameStore>((set) => ({
  settings: { ...gameConfig },

  update: (category, key, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [category]: {
          ...state.settings[category],
          [key]: value,
        },
      },
    })),

  reset: () => ({ settings: { ...gameConfig } }),
}));
