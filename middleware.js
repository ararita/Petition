module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireSiganture = (req, res, next) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireNoSiganture = (req, res, next) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};
