const { JsonWebTokenError } = require('jsonwebtoken');

const { AuthService } = require('../services');

const requireAuth = async (req, res, next) => {
  const authToken = req.get('Authorization') || '';

  if (!authToken.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const bearerToken = authToken.slice(7, authToken.length);

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    const user = await AuthService.getUserWithUserName(
      req.app.get('db'),
      payload.sub,
    );

    if (!user) {
      res.status(401).json({ error: 'Unauthorized request' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({ error: 'Unauthorized request' });
      return;
    }

    next(error);
  }
};

module.exports = {
  requireAuth,
};
