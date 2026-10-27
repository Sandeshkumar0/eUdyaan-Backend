const notFound = (req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || "Internal server error";

  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = err.errors.map((item) => item.message).join(", ");
  } else if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = "A record with those details already exists";
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "A referenced record does not exist";
  }

  const body = {
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message,
    requestId: req.id,
  };

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
