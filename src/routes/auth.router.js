const { AuthService } = require('../services');
const {
  requireAuth,
  Router,
  jsonBodyParser,
} = require('../middlewares');

const authRouter = Router();

authRouter
  .route('/token')
  .post(jsonBodyParser, async (req, res, next) => {
    const { username, password } = req.body;
    const loginUser = { username, password };

    const entries = Object.entries(loginUser);
    const missingField = entries.find(([, value]) => !value);

    if (missingField) {
      const field = missingField[0];
      res.status(400).json({
        error: `Missing '${field}' in request body`,
      });
      return;
    }

    try {
      const dbUser = await AuthService.getUserWithUserName(
        req.app.get('db'),
        loginUser.username,
      );

      if (!dbUser) {
        res.status(400).json({
          error: 'Incorrect username or password',
        });
        return;
      }

      const compareMatch = await AuthService.comparePasswords(
        loginUser.password,
        dbUser.password,
      );

      if (!compareMatch) {
        res.status(400).json({
          error: 'Incorrect username or password',
        });
        return;
      }

      const sub = dbUser.username;
      const payload = {
        user_id: dbUser.id,
        name: dbUser.name,
      };

      res.send({
        authToken: AuthService.createJwt(sub, payload),
      });
    } catch (error) {
      next(error);
    }
  })

  .put(requireAuth, (req, res) => {
    const sub = req.user.username;
    const payload = {
      user_id: req.user.id,
      name: req.user.name,
    };

    res.send({
      authToken: AuthService.createJwt(sub, payload),
    });
  });

module.exports = authRouter;
