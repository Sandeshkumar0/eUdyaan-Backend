const paginationFrom = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

const paginatedData = (rows, count, page, limit) => ({
  items: rows,
  pagination: {
    page,
    limit,
    totalItems: count,
    totalPages: Math.ceil(count / limit),
  },
});

module.exports = { paginationFrom, paginatedData };
