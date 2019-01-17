const express = require("express");
const bodyParser = require("body-parser");
const csurf = require("csurf");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const middleware = require("./middleware");
const bcrypt = require("./bcrypt");

app.disable("x-powered-by"); //removes the X-Powered-By header

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(function(req, res, next) {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
});

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.engine("handlebars", hb());

app.set("view engine", "handlebars");

// app.use(require("cookie-parser")()); --ovo ne trebamo vise jer koristimo cookie session middleware
app.use(express.static(__dirname + "/public"));

app.use(csurf()); //mora biti iza cookie sessiona i body parsera

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

//route handler

app.get("/", (req, res) => {
    if (req.session.signId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
});

app.get("/register", middleware.requireLoggedOutUser, function(req, res) {
    res.render("register", {
        layout: "main"
    });
});

app.post("/register", middleware.requireLoggedOutUser, function(req, res) {
    if (
        !req.body.first ||
        !req.body.last ||
        !req.body.email ||
        !req.body.password
    ) {
        console.log(req.body);
        res.render("register", {
            layout: "main",
            errorMessage:
                "Ooops, something went wrong! Make sure you filled all the required fields!"
        });
    } else {
        bcrypt
            .hashPassword(req.body.password)
            .then(function(hash) {
                db.registerUser(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash
                )
                    .then(function(result) {
                        req.session.userId = result.rows[0].id;
                        res.redirect("/petition");
                    })
                    .catch(function(err) {
                        if (err) {
                            console.log("ERROR", err);
                            res.render("register", {
                                layout: "main",
                                errorMessage: "An error has occured!"
                            });
                        }
                    });
            })
            .catch(function(err) {
                if (err) {
                    console.log("ERROR", err);
                    res.render("register", {
                        layout: "main",
                        errorMessage: "Something went wrong!"
                    });
                }
            });
    }
});

app.get("/login", middleware.requireLoggedOutUser, function(req, res) {
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", middleware.requireLoggedOutUser, function(req, res) {
    if (req.body.email && req.body.password) {
        db.getUserPass(req.body.email)
            .then(function(password) {
                return bcrypt
                    .compare(req.body.password, password.rows[0].password)
                    .then(function(bool) {
                        if (bool == true) {
                            req.session.userId = password.rows[0].id;
                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                error: true
                            });
                        }
                    });
            })
            .catch(function(err) {
                res.render("login", {
                    layout: "main",
                    error: "error"
                });
            });
    } else {
        res.render("login", {
            layout: "main",
            error: true
        });
    }
});

app.get("/thanks", middleware.requireSiganture, function(req, res) {
    db.getSig(req.session.sigId)
        .then(function(result) {
            console.log("result final: ", result.rows);
            res.render("thanks", {
                layout: "main",
                sig: result.rows[0].signature //this is url
            });
        })
        .catch(function(err) {
            res.render("petition", {
                layout: "main",
                errorMessage: err.message
            });
        });
});

app.get("/signers", middleware.requireSiganture, function(req, res) {
    db.getSigners()
        .then(function(signers) {
            res.render("signers", {
                signers: signers.rows,
                layout: "main"
            });
        })
        .catch(function(err) {
            res.render("petition", {
                layout: "main",
                errorMessage: err.message
            });
        });
});

// app.get("/profile", (req, res) => {
//     res.render("profile", {
//         layout: "main"
//     });
// });

//petition not working, not redirecting to thanks, rendering {{error}}
app.get("/petition", function(req, res) {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
});

app.post("/petition", (req, res) => {
    const firstName = req.body.first;
    const lastName = req.body.last;
    const signature = req.body.signature;
    const userId = req.session.userId;

    db.addSignature(firstName, lastName, signature, userId)
        .then(result => {
            console.log("result: ", result);
            req.session.sigId = result.rows[0].id;
            res.cookie("personCookie", firstName + lastName);
            res.redirect("/thanks");
            console.log("req.body: ", req.body);
        })
        .catch(function(err) {
            console.log("error: ", err);
            res.render("petition", {
                errorMessage: true,
                layout: "main"
            });
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.render("logout", {
        layout: "main"
    });
});

app.listen(8080, () => console.log("listening"));
