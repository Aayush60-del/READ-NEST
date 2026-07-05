import { useCallback, useState } from "react";

const STORAGE_KEY = "readnest:lastStreakCelebration";
const STREAK_MILESTONES = [7, 14, 30, 50, 100, 365];

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
    type: "streak",
    title: "",
    message: "",
    ctaLabel: "",
  });

  const closeStreakCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showStreakCelebration = useCallback((data = {}) => {
    const today = getTodayKey();
    const nextStreak = Number(data.newStreak ?? 1);
    const type = data.type || "streak";
    const achievementKey = data.achievementKey || `${today}:${type}:${nextStreak}`;
    const storageKey = `${STORAGE_KEY}:${achievementKey}`;
    const storageValue = achievementKey;
    const hasShownAchievement = localStorage.getItem(storageKey);

    if (!data.force && hasShownAchievement) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, storageValue);
    localStorage.setItem(storageKey, "1");

    setCelebration({
      isOpen: true,
      previousStreak: Number(data.previousStreak ?? Math.max(nextStreak - 1, 0)),
      newStreak: nextStreak,
      weeklyProgress: data.weeklyProgress ?? [],
      milestone: Boolean(data.milestone ?? STREAK_MILESTONES.includes(nextStreak)),
      type,
      title: data.title || "",
      message: data.message || "",
      ctaLabel: data.ctaLabel || "",
    });
  }, []);

  return {
    ...celebration,
    showStreakCelebration,
    closeStreakCelebration,
  };
}
