const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated. Authorization header missing.',
        });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated. Invalid token.',
            error: err.message,
        });
    }

    if (!decodedToken) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated.',
        });
    }

    req.user = decodedToken; // Attach decoded token (user info) to request
    next();
};
