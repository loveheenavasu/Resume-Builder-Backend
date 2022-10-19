const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  try {
    let token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Token Expired!" });
      }
      req.userId = decoded.id;
      req.userRole = decoded.roleName;
      next();
    });
  } catch (e) {
    return res.status(401).send({ message: e })
  }
};

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      Role.findById(user.role).exec((err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (role?.name === "admin") {
          req.authUser = user;
          next();
          return;
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
      );
    } else {
      res.status(403).send({ message: "User not found." });
      return;
    }
  });
};

isUser = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: user.role
      },
      (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (role.length) {
          if (role[0].name === "user") {
            req.authUser = user;
            next();
            return;
          }
        }
        res.status(403).send({ message: "Require user Role!" });
        return;
      }
    );
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isUser
};
module.exports = authJwt;
