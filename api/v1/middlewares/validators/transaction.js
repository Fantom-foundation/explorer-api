const { query, validationResult } = require('express-validator');
const errors = require('../../../../mixins/errors');
const brI18n = require('../../../../mixins/badRequestI18n');
const { Transaction } = require('../../../../db.js');

const maxCount = require('config').get(`validation.maxCount`);

module.exports.get = (req, res, next) => [
  query('transactionHash')
    .exists().bail().withMessage(`required`)
    .isString().bail().withMessage('shouldBeString')
    .isLength({ min: 66, max: 66 }).bail().withMessage(`stringLength66`)
    .custom((hash, { req }) => Transaction.findOne({ hash }, '-_id').lean(true).then(trx => {
      if (!trx) {
        return Promise.reject();
      }

      req.foundTrx = trx;
    }))
    .withMessage('notFound'),
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

module.exports.list = (req, res, next) => [
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
    .isInt({ max: maxCount }).bail().withMessage('tooLargeNumber')
    .toInt(),
  //
  query('order')
    .optional()
    .isInt().bail().withMessage('shouldBeNumber')
    .toInt()
    .custom(order => order === -1 || order === 1).withMessage('invalidValue'),
  //
  query('block')
    .optional()
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000000 }).bail().withMessage('tooLargeNumber')
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

