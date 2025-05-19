export const getLast6MonthsBoundaries = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};
