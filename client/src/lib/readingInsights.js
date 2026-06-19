const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getReadDateSet = (readDates = []) => {
  return new Set(readDates.map(toDateKey).filter(Boolean));
};

export const buildLast7Days = (readDates = []) => {
  const readSet = getReadDateSet(readDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = toDateKey(date);

    return {
      date: key,
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
      isToday: offset === 0,
      read: readSet.has(key),
    };
  });
};

export const buildReadingHeatmap = (readDates = [], weeks = 10) => {
  const readSet = getReadDateSet(readDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = weeks * 7;
  const start = new Date(today);
  start.setDate(today.getDate() - totalDays + 1);

  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toDateKey(date);

    return {
      date: key,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
      read: readSet.has(key),
      isToday: key === toDateKey(today),
    };
  });

  return Array.from({ length: weeks }, (_, weekIndex) =>
    days.slice(weekIndex * 7, weekIndex * 7 + 7)
  );
};

export const getBestStreakFromDates = (readDates = []) => {
  const keys = [...getReadDateSet(readDates)].sort();
  if (!keys.length) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < keys.length; i += 1) {
    const previous = new Date(`${keys[i - 1]}T00:00:00`);
    const currentDate = new Date(`${keys[i]}T00:00:00`);
    const diff = Math.round((currentDate - previous) / 86400000);

    if (diff === 1) {
      current += 1;
    } else if (diff > 1) {
      current = 1;
    }

    best = Math.max(best, current);
  }

  return best;
};

