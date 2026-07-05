import { useCallback, useState } from "react";

const STORAGE_KEY = "readnest:lastStreakCelebration";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function useStreakCelebration() {
  const [celebration, setCelebration] = useState({
    isOpen: false,
    previousStreak: 0,
    newStreak: 1,
    weeklyProgress: [],
    milestone: false,
  });

  const closeStreakCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showStreakCelebration = useCallback((data = {}) => {
    const today = getTodayKey();
    const nextStreak = Number(data.newStreak ?? 1);
    const storageValue = `${today}:${nextStreak}`;
    const lastShown = localStorage.getItem(STORAGE_KEY);

    if (!data.force && lastShown === storageValue) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, storageValue);

    setCelebration({
      isOpen: true,
      previousStreak: Number(data.previousStreak ?? Math.max(nextStreak - 1, 0)),
      newStreak: nextStreak,
      weeklyProgress: data.weeklyProgress ?? [],
      milestone: Boolean(data.milestone ?? [7, 14, 30, 50, 100, 365].includes(nextStreak)),
    });
  }, []);

  return {
    ...celebration,
    showStreakCelebration,
    closeStreakCelebration,
  };
}
