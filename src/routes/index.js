/*
|--------------------------------------------------------------------------
| BARREL EXPORT FILE
|--------------------------------------------------------------------------
| How-To barrel-export components:
| const thingsRouter = require('./things/thingsRouter')
|
| module.exports = {
|   thingsRouter
| }
|
| Why? Readability:
| const { thingsRouter, stuffRouter, userRouter } = require('./routes')
*/
const authRouter = require('./auth.router');
const languageRouter = require('./language.router');
const userRouter = require('./user.router');

module.exports = {
  authRouter,
  languageRouter,
  userRouter,
};
