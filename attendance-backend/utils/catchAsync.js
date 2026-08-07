// Wraps async controller functions so we don't need try/catch in every one.
// Any rejected promise is forwarded to Express's error handler.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
