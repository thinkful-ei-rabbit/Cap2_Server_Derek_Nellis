const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const {
  NODE_ENV,
  CORS_ORIGIN_DEV,
  CORS_ORIGIN_PROD,
} = require('./config');

const {
  authRouter,
  languageRouter,
  userRouter,
} = require('./routes');
const { app, error } = require('./middlewares');

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'dev';
const morganSkip = { skip: () => NODE_ENV === 'test' };
const corsOrigin = {
  origin:
    NODE_ENV === 'production' ? CORS_ORIGIN_PROD : CORS_ORIGIN_DEV,
};

app.use(morgan(morganOption, morganSkip));
app.use(cors(corsOrigin));
app.use(helmet());

app.get('/', (req, res) => {
  res.send('Express boilerplate initialized!');
});

/*
| ROUTES HERE -------------------------
*/

app.use('/api/auth', authRouter);
app.use('/api/language', languageRouter);
app.use('/api/user', userRouter);

/*
|--------------------------------------
*/

app.use(error.notFound);
app.use(error.errorHandler);

module.exports = app;
