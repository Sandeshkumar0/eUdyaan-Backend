exports.successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Authentication responses also expose token/user at the top level so the
// existing Android client can deserialize them without a breaking release.
exports.authResponse = (res, message, token, user, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user,
    data: { token, user },
  });
};

exports.errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
