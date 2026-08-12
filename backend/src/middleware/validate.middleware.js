const AppError = require('../utils/appError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;
    next();
  } catch (error) {
    if (error.errors) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return next(new AppError(`Validation error: ${errorMessages}`, 400));
    }
    next(error);
  }
};

module.exports = validate;
