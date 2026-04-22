function errorHandler(err, req, res, next) {
  console.error("🔥 FULL ERROR:", err); // important

  res.status(500).json({
    message: err.message,
    stack: err.stack, // optional for debugging
  });
}

module.exports = { errorHandler };