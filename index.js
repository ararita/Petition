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

app.use(express.static(__dirname + "/public"));

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

app.use(csurf()); //mora biti iza cookie sessiona i body parsera

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

//to make sure that person can't navigate anywhere if isn't registered
app.use(function(req, res, next) {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
});

const checkUrl = function(link) {
    if (
        !link.startsWith("http://") &&
        !link.startsWith("https://") &&
        !link.startsWith("//")
    ) {
        link = null;
    }
    return link;
};

//route handler

app.get("/", (req, res) => {
    if (req.session.sigId) {
        //ako vec postoji signature u db-u
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
                "Ooops, something went wrong! Make sure you filled all required fields!"
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
                        res.redirect("/profile");
                    })
                    .catch(function(err) {
                        if (err) {
                            // console.log("ERROR", err);
                            res.render("register", {
                                layout: "main",
                                errorMessage:
                                    "You're already a member, please log in"
                            });
                        }
                    });
            }) //check with somebody what kind of error we handle here
            .catch(function(err) {
                if (err) {
                    // console.log("ERROR", err);
                    res.render("register", {
                        layout: "main",
                        errorMessage: "Something went wrong!"
                    });
                }
            });
    }
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    db.addProfile(
        req.body.age,
        req.body.city,
        checkUrl(req.body.url),
        req.session.userId
    )
        .then(function() {
            res.redirect("/petition");
        })
        .catch(function(err) {
            res.render("profile", {
                layout: "main",
                errorMessage: err.message
            });
        });
    // console.log("url.body: ", req.body.url);
});

app.get("/profile/edit", (req, res) => {
    db.editProfileInfo(req.session.userId).then(result => {
        res.render("edit", {
            layout: "main",
            first: result.rows[0].first,
            last: result.rows[0].last,
            email: result.rows[0].email,
            age: result.rows[0].age || null,
            city: result.rows[0].city || null,
            homepage: result.rows[0].url || null
        });
    });
});
//not sure why url and not homepage in result.rows[0].url || null

app.post("/profile/edit", function(req, res) {
    if (req.body.password !== "") {
        bcrypt.hashPassword(req.body.password).then(hash => {
            Promise.all([
                db.updateUserWithNewPass(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash,
                    req.session.userId
                ),
                db.updateProfile(
                    req.body.age,
                    req.body.city,
                    checkUrl(req.body.url),
                    req.session.userId
                )
            ])
                .then(function() {
                    res.redirect("/thanks");
                })
                .catch(function(result) {
                    res.render("edit", {
                        layout: "main",
                        first: result.rows[0].first,
                        last: result.rows[0].last,
                        email: result.rows[0].email,
                        age: result.rows[0].age || null,
                        city: result.rows[0].city || null,
                        homepage: result.rows[0].url || null
                    });
                });
        });
    } else {
        Promise.all([
            db.updateUserWithoutNewPass(
                req.body.first,
                req.body.last,
                req.body.email,
                req.session.userId
            ),
            db.updateProfile(
                req.body.age,
                req.body.city,
                checkUrl(req.body.url),
                req.session.userId
            )
        ])
            .then(() => {
                res.redirect("/thanks");
            })
            .catch(function(err) {
                "Something went wrong!";
            });
    }
});

app.get("/signers/:city", (req, res) => {
    const city = req.params.city;
    db.getSignersByCity(city).then(function(signers) {
        res.render("signers", {
            layout: "main",
            signers: signers.rows
        });
    });
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
                            req.session.sigId = password.rows[0].sig;

                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                errorMessage:
                                    "Invalid email address or password"
                            });
                        }
                    });
            })
            .catch(function(err) {
                console.log("error: ", err);
                res.render("login", {
                    layout: "main",
                    errorMessage: "Invalid email address or password"
                });
            });
    } else {
        res.render("login", {
            layout: "main",
            errorMessage: "All fields required"
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

app.post("/thanks", (req, res) => {
    db.deleteSig(req.session.userId)
        .then(() => {
            req.session.sigId = null; //deleting from cookie
        })
        .then(() => {
            res.redirect("/petition");
        })
        .catch(err => {
            console.log(err);
            res.render("thanks", {
                layout: "main",
                errorMessage: err.message
            });
        });
});

app.get("/signers", middleware.requireSiganture, function(req, res) {
    console.log("whatever");
    db.getSigners()
        .then(function(signers) {
            console.log("signers: ", signers);
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

    db.addSignature(signature, userId)
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
                errorMessage: "Something went wrong!",
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

app.listen(process.env.PORT || 8080, () => console.log("listening"));
