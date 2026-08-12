// Pass-through auth middleware since authentication is disabled per owner preference
const protect = async (req, res, next) => {
  req.user = {
    _id: 'owner-admin-id',
    name: 'Business Owner',
    email: 'admin@tiffin.com',
    role: 'admin',
  };
  next();
};

module.exports = { protect };
