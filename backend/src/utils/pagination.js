const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

/**
 * Every list endpoint (products, orders, customers) took `limit` straight
 * from req.query and cast it to Number with no upper bound — ?limit=999999
 * worked. This clamps it server-side. Also guards against page < 1 and
 * non-numeric input falling through as NaN.
 */
const sanitizePagination = ({ page, limit } = {}, defaultLimit = DEFAULT_LIMIT) => {
  let p = Number(page);
  let l = Number(limit);

  if (!Number.isFinite(p) || p < 1) p = 1;
  if (!Number.isFinite(l) || l < 1) l = defaultLimit;
  if (l > MAX_LIMIT) l = MAX_LIMIT;

  return { page: p, limit: l };
};

module.exports = { sanitizePagination, MAX_LIMIT };
