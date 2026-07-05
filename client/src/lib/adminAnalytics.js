const toArray = (value) => (Array.isArray(value) ? value : []);

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const toNumber = (...values) => {
  const value = firstDefined(...values);
  if (value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const normalizeAdminAnalytics = (payload) => {
  const source = payload?.data && typeof payload.data === 'object' ? payload.data : payload || {};
  const users = source.users || {};
  const books = source.books || {};
  const reading = source.reading || source.library || {};
  const activity = source.activity || {};

  return {
    totalUsers: toNumber(source.totalUsers, users.total, users.totalUsers),
    newUsersToday: toNumber(source.newUsersToday, users.newToday, users.today),
    newUsersThisWeek: toNumber(source.newUsersThisWeek, users.newThisWeek, users.thisWeek),
    activeReadersToday: toNumber(source.activeReadersToday, users.activeToday, reading.activeToday),
    activeReadersThisWeek: toNumber(source.activeReadersThisWeek, users.activeThisWeek, reading.activeThisWeek),
    totalBooks: toNumber(source.totalBooks, books.total, books.totalBooks),
    publishedBooks: toNumber(source.publishedBooks, books.published, books.publishedBooks),
    totalPagesRead: toNumber(source.totalPagesRead, reading.totalPagesRead, reading.pagesRead),
    completedBooks: toNumber(source.completedBooks, reading.completedBooks, books.completedBooks),
    totalLibraryItems: toNumber(source.totalLibraryItems, reading.totalLibraryItems, reading.total),
    topBooks: toArray(firstDefined(source.topBooks, books.topBooks, books.top)),
    recentUsers: toArray(firstDefined(source.recentUsers, users.recentUsers, users.recent)),
    recentActivity: toArray(firstDefined(source.recentActivity, activity.recentActivity, activity.recent, reading.recentActivity)),
  };
};
