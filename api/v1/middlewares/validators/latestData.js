const { query, validationResult } = require('express-validator');
const errors = require('../../../../mixins/errors');
const brI18n = require('../../../../mixins/badRequestI18n');

const maxCount = require('config').get(`validation.maxCount`);

module.exports.get = (req, res, next) => [
  query('count')
    .optional()
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 1 }).bail().withMessage('greaterThanZero')
    .isInt({ max: maxCount }).bail().withMessage('tooLargeNumber')
    .toInt(),
  //

  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      const errorsInProperLanguage = brI18n(req, err.array());
      next(errors.badRequest(errorsInProperLanguage));
    } else {
      next();
    }
  },
];