function respond(req, res, code = 200, data = null) {
  // Complete HTTP status code definitions
  const STATUS_CODES = {
    // 2xx Success
    200: "OK",
    201: "Created",
    202: "Accepted",
    204: "No Content",

    // 3xx Redirection
    301: "Moved Permanently",
    302: "Found",
    304: "Not Modified",

    // 4xx Client Error
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",

    // 5xx Server Error
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };

  // Validate status code
  if (!Number.isInteger(code) || code < 100 || code > 599) {
    throw new Error(`Invalid HTTP status code: ${code}`);
  }

  // Determine status category based on first digit
  const getStatusCategory = (statusCode) => {
    const firstDigit = Math.floor(statusCode / 100);
    switch (firstDigit) {
      case 2:
        return "success";
      case 3:
        return "redirect";
      case 4:
        return "fail";
      case 5:
        return "error";
      default:
        return "unknown";
    }
  };

  // Build base response object
  const baseResponse = {
    code,
    status: getStatusCategory(code),
    message: STATUS_CODES[code] || "Unknown Status",
  };

  // Handle different data types
  if (data === null || data === false) {
    // Simple status response
    return res.status(code).json(baseResponse);
  }

  if (typeof data === "string") {
    // String message override
    return res.status(code).json({
      ...baseResponse,
      message: data,
    });
  }

  if (typeof data === "object" && data !== null) {
    // Handle pagination links if present
    if (data.links && req) {
      const baseUrl = `${req.protocol}://${req.hostname}${
        req.originalUrl.split("?")[0]
      }?`;

      const linkFields = ["self", "first", "previous", "next", "last"];
      linkFields.forEach((field) => {
        if (data.links[field]) {
          data.links[field] = baseUrl + data.links[field];
        }
      });
    }

    // Return merged response
    return res.status(code).json({
      ...baseResponse,
      ...data,
    });
  }

  // Fallback for unexpected data types
  return res.status(code).json({
    ...baseResponse,
    data,
  });
}

function debug(output, detail = null) {
  // TODO: re-enable if statement below
  if (process.env.NODE_ENV !== "production") {
    const err = new Error();
    const stack = err.stack.split("\n");
    const callerLine = stack[2];
    const callerInfo = callerLine.match(/\((.*):(\d+):\d+\)/);
    const lineNumber = callerInfo ? callerInfo[2] : "unknown";
    const functionName = debug.caller ? debug.caller.name : "anonymous";
    console.log(
      `====== Function: ${functionName} | Line: ${lineNumber} | Detail: ${detail}  ======`
    );
    console.log(output);
    // //old
    // +console.log(============= function ${debug.caller.name} ${detail ? ': ' + detail : ''} =============== );
    // console.log(output);
  }
}
// Optional: Export with additional helper methods
module.exports = {
  respond,
  debug,
  // Convenience methods for common responses
  success: (req, res, data = null) => respond(req, res, 200, data),
  created: (req, res, data = null) => respond(req, res, 201, data),
  badRequest: (req, res, message = null) => respond(req, res, 400, message),
  unauthorized: (req, res, message = null) => respond(req, res, 401, message),
  forbidden: (req, res, message = null) => respond(req, res, 403, message),
  notFound: (req, res, message = null) => respond(req, res, 404, message),
  serverError: (req, res, message = null) => respond(req, res, 500, message),
};
