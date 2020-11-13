const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id });
  },

  getLanguageHead(db, language_head) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where('id', language_head)
      .first();
  },

  async getNextWord(db, id) {
    const word = await db
      .from('word')
      .select('*')
      .where({ id })
      .first();

    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where('id', word.next)
      .first();
  },

  async guessUpdate(
    db,
    lang_id,
    word_id,
    total_score,
    correct_count,
    incorrect_count,
    memory_value,
  ) {
    await db
      .from('language')
      .where('id', lang_id)
      .update({ total_score });

    await db
      .from('word')
      .where('id', word_id)
      .update({ correct_count, incorrect_count, memory_value });

    return db.from('word').select('*').where('id', word_id).first();
  },

  setHead(db, id, head) {
    return db('language').where({ id }).update({ head });
  },

  async updateWord(db, id, next) {
    return db('word').where({ id }).update({ next });
  },
};

module.exports = LanguageService;
