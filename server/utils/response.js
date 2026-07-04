// Success Response
export const sendSuccess = (res, message = "Success", data = {}, code = 200) => {
  res.status(code).json({
    success: true,
    message,
    data,
  });
};

// Error Response
export const sendError = (res, message = "Something went wrong", code = 500) => {
  res.status(code).json({
    success: false,
    message,
  });
};
