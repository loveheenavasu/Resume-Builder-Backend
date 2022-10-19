const { verifySignUp, authJwt } = require("../middlewares");
const auth = require("../controllers/auth.controller");
const user = require("../controllers/user.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    // simple route
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to Resume Builder backend APP." });
    });

    app.post("/api/auth/signup", [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], auth.signup);
    app.post("/api/auth/signin", auth.signin);
    app.get("/api/auth/email/test", auth.emailTest);

    app.get("/api/users", [authJwt.verifyToken], user.getAll);
    app.get("/api/user/:id", [authJwt.verifyToken], user.getSingle);
    app.put("/api/user/:id", [authJwt.verifyToken], user.update);
    app.delete("/api/user/:id", [authJwt.verifyToken], user.delete);
}