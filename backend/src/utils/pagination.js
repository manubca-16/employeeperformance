const parsePagination = (req) => {
  const limitRaw = parseInt(req.query.limit || "100", 10);
  const skipRaw = parseInt(req.query.skip || "0", 10);

  const limit = Number.isNaN(limitRaw) ? 100 : Math.min(limitRaw, 200);
  const skip = Number.isNaN(skipRaw) ? 0 : Math.max(skipRaw, 0);

  return { limit, skip };
};

module.exports = { parsePagination };
