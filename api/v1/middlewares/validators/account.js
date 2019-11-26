const { query, validationResult } = require('express-validator');
const errors = require('../../../../mixins/errors');
const brI18n = require('../../../../mixins/badRequestI18n');
const { Account } = require('../../../../db.js');

module.exports.get = (req, res, next) => [
  query('address')
    .exists().bail().withMessage(`required`)
    .isString().bail().withMessage('shouldBeString')
    .isLength({ min: 42, max: 42 }).bail().withMessage(`stringLength42`)
    .custom((address, { req }) => Account.findOne({ address }, '-_id balance address').lean(true).then(account => {
      if (!account) {
        return Promise.reject();
      }

      req.foundAccount = account;
    }))
    .withMessage('notFound'),
  //
  query('offset')
    .optional()
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000 }).bail().withMessage('tooLargeNumber')
    .toInt(),
  //
  query('count')
    .optional()
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 1 }).bail().withMessage('greaterThanZero')
    .isInt({ max: 20 }).bail().withMessage('tooLargeNumber')
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

