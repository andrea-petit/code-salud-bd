function autenticacion(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
        return;
    }
}

module.exports = autenticacion;