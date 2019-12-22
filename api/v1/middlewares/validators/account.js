const { query, validationResult } = require('express-validator');
const errors = require('../../../../mixins/errors');
const brI18n = require('../../../../mixins/badRequestI18n');
const { Account } = require('../../../../db.js');

const maxCount = require('config').get(`validation.maxCount`);
const acceptedFilterParams = [
  'from',
  'to',
  'contract'
]
const trxsFilterMaxLength = acceptedFilterParams.join().length;

module.exports.get = (req, res, next) => [
  query('address')
    .exists().bail().withMessage(`required`)
    .isString().bail().withMessage('shouldBeString')
    .isLength({ min: 42, max: 42 }).bail().withMessage(`stringLength42`)
    .customSanitizer(address => address.toLowerCase())
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
    .isInt({ max: maxCount }).bail().withMessage('tooLargeNumber')
    .toInt(),
  //
  query('trxsFilter')
    .optional()
    .isLength({ max: trxsFilterMaxLength }).bail().withMessage('unnacceptableLength')
    .custom((trxsFilter, {req}) => {
      const filterParamsarray = trxsFilter.split(`,`);

      const duplicatesExists = new Set(filterParamsarray).size != filterParamsarray.length;
      if (duplicatesExists){
        return Promise.reject(`duplicatesNotAcceptable`);
      }
      
      let allParamsAcceptable = true;
      for (let param of filterParamsarray){
        if (acceptedFilterParams.indexOf(param) === -1) {
          allParamsAcceptable = false;
          break;
        }
      }

      if (allParamsAcceptable) {
        req.query.trxsFilter = filterParamsarray;
      }
      
      return allParamsAcceptable;
    }).withMessage('someFilterParamsAreNotAcceptable'),
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

