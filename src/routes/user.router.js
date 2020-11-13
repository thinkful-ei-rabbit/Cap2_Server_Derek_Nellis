const path = require('path');

const { UserService } = require('../services');
const { Router, jsonBodyParser } = require('../middlewares');

const userRouter = Router();

userRouter.post('/', jsonBodyParser, async (req, res, next) => {
  const { password, username, name } = req.body;

  const fields = ['name', 'username', 'password'];
  const missingField = fields.find((field) => !req.body[field]);

  if (missingField) {
    res.status(400).json({
      error: `Missing '${missingField}' in request body`,
    });
    return;
  }

  try {
    const passwordError = UserService.validatePassword(password);

    if (passwordError) {
      res.status(400).json({ error: passwordError });
      return;
    }

    const hasUserWithUserName = await UserService.hasUserWithUserName(
      req.app.get('db'),
      username,
    );

    if (hasUserWithUserName) {
      res.status(400).json({ error: `Username already taken` });
      return;
    }

    const hashedPassword = await UserService.hashPassword(password);

    const newUser = {
      username,
      password: hashedPassword,
      name,
    };

    const user = await UserService.insertUser(
      req.app.get('db'),
      newUser,
    );

    await UserService.populateUserWords(req.app.get('db'), user.id);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UserService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

module.exports = userRouter;
