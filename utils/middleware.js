const logger = require("./logger");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userExtractor = async (request, response, next) => {
  const authorization = request.get("authorization");
  // Check if the Authorization header exists and starts with "Bearer "
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.replace("Bearer ", "");

    try {
      // Verify the token and decode it
      const decodedToken = jwt.verify(token, process.env.SECRET);
      request.token = decodedToken; // Store decoded token in the request object

      // If the decoded token does not have an id, return an error
      if (!decodedToken.id) {
        return response.status(401).json({ error: "Token is invalid" });
      }

      // Find the user based on the decoded token ID
      const user = await User.findById(decodedToken.id);

      // If the user is not found, return an error
      if (!user) {
        return response.status(401).json({ error: "User not found" });
      }

      // Attach the user to the request object
      request.user = user;

      // Proceed to the next middleware or route handler

      next();
    } catch (error) {
      // If any error occurs during verification or user lookup
      return response.status(401).json({ error: "Token verification failed" });
    }
  } else {
    // If the Authorization header is missing or not formatted correctly
    return response
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.replace("Bearer ", "");
    try {
      // Verify the token and decode it
      const decodedToken = jwt.verify(token, process.env.SECRET);
      request.token = decodedToken; // Store decoded token in the request object
    } catch (error) {
      return response
        .status(401)
        .json({ error: "Token is invalid or expired" });
    }
  } else {
    return response
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }
  next(); // Call next middleware or route handler
};

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
