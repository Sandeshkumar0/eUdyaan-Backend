const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = parsed.body ?? req.body;
    req.validatedParams = parsed.params ?? req.params;
    req.validatedQuery = parsed.query ?? req.query;
    next();
  } catch (error) {
    if (!(error instanceof ZodError)) return next(error);

    return res.status(400).json({
      success: false,
      message: "Invalid request",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
      requestId: req.id,
    });
  }
};

module.exports = validate;
