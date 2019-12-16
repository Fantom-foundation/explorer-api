const { body, validationResult } = require('express-validator');
const errors = require('../../../../mixins/errors');
const brI18n = require('../../../../mixins/badRequestI18n');

const acceptedMethods = [
  'sfc_getDelegator',
  'sfc_getDelegatorsOf',
  'ftm_currentEpoch',
  'ftm_getEpochStats',
  'sfc_getStakers',
]

module.exports.post = (req, res, next) => [
    body('method')
        .exists().bail().withMessage('required')
        .isString().bail().withMessage('shouldBeString')
        .custom((method, {req}) => {
          if (acceptedMethods.indexOf(method) === -1) {
            return Promise.reject();
          }

          return Promise.resolve();
        }).withMessage('notFound'),
    //
    body('params')
        .exists().bail().withMessage('required')
        .isArray({ min: 0, max: 2 }).bail().withMessage('invalidValue'),
    //
    body('params.*')
        .isString().withMessage('invalidValue')
        .trim()
        .isLength({ min: 1 }),
    //
    body('id')
        .exists().bail().withMessage('required')
        .isInt().bail().withMessage('shouldBeNumber')
        .isInt({ min: 0 }).bail().withMessage('invalidValue')
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