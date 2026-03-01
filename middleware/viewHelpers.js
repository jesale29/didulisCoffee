module.exports = (req, res, next) => {
    // Laravel-style asset() helper
    res.locals.asset = (path) => {
        return path.startsWith('/') ? path : `/${path}`;
    };

    // Laravel-style storage() helper
    res.locals.storage = (path) => {
        return `/storage/${path.replace(/^\//, '')}`;
    };

    next();
};