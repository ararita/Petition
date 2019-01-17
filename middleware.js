module.exports.requireLoggedOutUser = (req, res, next) => {
    //to see this page user mustn't be logged in; if loged in, send away
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireSiganture = (req, res, next) => {
    if (!req.session.sigId) {
        //do it in /thanks and /signers
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireNoSiganture = (req, res, next) => {
    if (req.session.sigId) {
        //do it in /petition
        res.redirect("/thanks");
    } else {
        next();
    }
};

// app.get("/login", requireLoggedOutUser, (req, res) => {
//
// });
// app.post("/login", requireLoggedOutUser, (req, res) => {
//
// });
