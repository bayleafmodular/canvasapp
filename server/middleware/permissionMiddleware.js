const can = (permission) => (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  if (req.user?.permissions?.[permission]) return next();

  return res.status(403).json({ message: 'You do not have permission for this action' });
};

module.exports = can;
