const { query, param, validationResult } = require('express-validator');
const errors = require('../../../../mixins/errors');
const brI18n = require('../../../../mixins/badRequestI18n');
const fantomRPC = require('../../../../mixins/fantomRPC');

module.exports.get = (req, res, next) => [
  query('verbosity')
    .optional()
    .isInt({ min: 1, max: 2}).withMessage(`invalidValue`),
  param('address')
    .exists().bail().withMessage(`required`)
    .isString().bail().withMessage('shouldBeString')
    .isLength({ min: 42, max: 42 }).bail().withMessage(`stringLength42`)
    .customSanitizer(address => address.toLowerCase())
    .custom(async (address, { req }) => {
      const method = `sfc_getDelegator`;   

      const verbosity = req.query.verbosity ? req.query.verbosity : 1;
      const verbosityHex = `0x` + verbosity.toString(16);

      const params = [address, verbosityHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const delegator = await fantomRPC({ method, params, id: reqId });

      if (delegator.result === null) return Promise.reject();
      if (delegator.error) return Promise.reject(delegator.error.message);

      req.foundDelegator = delegator.result;
      return true;
    })
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

module.exports.getListByStaker = (req, res, next) => [
  query('verbosity')
    .optional()
    .isInt({ min: 0, max: 2}).withMessage(`invalidValue`),
  param('staker')
    .exists().bail().withMessage(`required`)
    .isString().bail().withMessage('shouldBeString')
    .isLength({ min: 1, max: 42 }).bail().withMessage(`unnacceptableLength`)
    .custom(async (staker, { req }) => {
      let method; 
      
      if (!staker.startsWith(`0x`)) {
        staker = `0x` + staker;
        method = `sfc_getStaker`;
      } else {
        staker = staker.toLowerCase();  
        method = `sfc_getStakerByAddress`;
      }

      const params = [staker, `0x1`];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const foundStaker = await fantomRPC({ method, params, id: reqId });

      if (foundStaker.result === null) return Promise.reject();
      if (foundStaker.error) return Promise.reject(foundStaker.error.message);

      req.processedStaker = staker;
      
      return true;
    })
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