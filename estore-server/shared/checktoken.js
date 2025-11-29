const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send({ message: "No token provided!" });
    }
    jwt.verify(token, process.env.JWT_SECRET || "estore-secret-key");
    next();
  } catch (error) {
    res.status(401).send({ message: "Authorization failed!" });
  }
};
