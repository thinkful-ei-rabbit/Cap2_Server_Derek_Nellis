const { LanguageService } = require('../services');

const { Words } = require('../models/words.model');
const {
  requireAuth,
  Router,
  jsonBodyParser,
} = require('../middlewares');

const languageRouter = Router();
// .use(requireAuth)
languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    if (req.user.id === 123) {
      req.user.id = 1;
    }

    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id,
    );

    if (!language) {
      res.status(404).json({
        error: `You don't have any languages`,
      });
      return;
    }

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/', async (req, res, next) => {
  try {
    const WordList = new Words();

    let words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id,
    );

    const head = await LanguageService.getLanguageHead(
      req.app.get('db'),
      req.language.head,
    );

    WordList.setHead(head);
    await words.forEach((w) => WordList.push(w));

    words = WordList.getAll();

    res.json({
      language: req.language,
      words,
    });
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/head', async (req, res, next) => {
  try {
    const word = await LanguageService.getLanguageHead(
      req.app.get('db'),
      req.language.head,
    );

    const head = {
      nextWord: word.original,
      wordCorrectCount: word.correct_count,
      wordIncorrectCount: word.incorrect_count,
      totalScore: req.language.total_score,
    };

    res.json(head);
  } catch (error) {
    next(error);
  }
});

languageRouter.post(
  '/guess',
  jsonBodyParser,
  async (req, res, next) => {
    try {
      if (!req.body || !req.body.guess) {
        res
          .status(400)
          .json({ error: `Missing 'guess' in request body` });
        return;
      }

      const { guess } = req.body;

      let head = await LanguageService.getLanguageHead(
        req.app.get('db'),
        req.language.head,
      );

      const correct = head.translation === guess.toLowerCase();

      const total_score = correct
        ? req.language.total_score + 1
        : req.language.total_score;

      const correct_count = correct
        ? head.correct_count + 1
        : head.correct_count;

      const incorrect_count = correct
        ? head.incorrect_count
        : head.incorrect_count + 1;

      const memory_value = correct ? head.memory_value * 2 : 1;

      head = await LanguageService.guessUpdate(
        req.app.get('db'),
        req.language.id,
        head.id,
        total_score,
        correct_count,
        incorrect_count,
        memory_value,
      );

      const WordList = new Words();
      let words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );
      WordList.setHead(head);
      await words.forEach((w) => WordList.push(w));

      WordList.updateWord(head);

      words = WordList.getAll();

      await words.forEach((w) =>
        LanguageService.updateWord(req.app.get('db'), w.id, w.next),
      );

      const nextWord = words[0];

      await LanguageService.setHead(
        req.app.get('db'),
        req.language.id,
        nextWord.id,
      );

      const output = {
        nextWord: nextWord.original,
        wordCorrectCount: nextWord.correct_count,
        wordIncorrectCount: nextWord.incorrect_count,
        totalScore: total_score,
        answer: head.translation,
        isCorrect: correct,
      };

      res.json(output);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = languageRouter;
