const { query, param, validationResult } = require('express-validator');
const utils = require('web3-utils');
const errors = require('../../../../mixins/errors');
const brI18n = require('../../../../mixins/badRequestI18n');
const fantomRPC = require('../../../../mixins/fantomRPC');

module.exports.getByAddress = (req, res, next) => [
  query('verbosity')
    .optional()
    .isInt({ min: 0, max: 2}).withMessage(`invalidValue`),
  param('address')
    .exists().bail().withMessage(`required`)
    .isString().bail().withMessage('shouldBeString')
    .isLength({ min: 42, max: 42 }).bail().withMessage(`stringLength42`)
    .customSanitizer(address => address.toLowerCase())
    .custom(async (address, { req }) => {
      const method = `sfc_getStakerByAddress`;   

      const verbosity = req.query.verbosity ? req.query.verbosity : 0;
      const verbosityHex = `0x` + verbosity.toString(16);

      const params = [address, verbosityHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const staker = await fantomRPC({ method, params, id: reqId });

      if (staker.result === null) return Promise.reject();
      if (staker.error) return Promise.reject(staker.error.message);

      req.foundStaker = staker.result;
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

module.exports.getById = (req, res, next) => [
  query('verbosity')
    .optional()
    .isInt({ min: 1, max: 2}).withMessage(`invalidValue`),
  param('id')
    .exists().bail().withMessage(`required`)
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000 }).bail().withMessage('tooLargeNumber')
    .toInt()
    .custom(async (id, { req }) => {
      const method = `sfc_getStaker`;   

      const verbosity = req.query.verbosity ? req.query.verbosity : 1;
      const verbosityHex = `0x` + verbosity.toString(16);
      
      const idHex = `0x` + id.toString(16);

      const params = [idHex, verbosityHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const staker = await fantomRPC({ method, params, id: reqId });

      if (staker.result === null) return Promise.reject();
      if (staker.error) return Promise.reject(staker.error.message);

      req.foundStaker = staker.result;
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

module.exports.getDowntime = (req, res, next) => [
  param('id')
    .exists().bail().withMessage(`required`)
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000 }).bail().withMessage('tooLargeNumber')
    .toInt()
    .custom(async (id, { req }) => {
      const method = `sfc_getDowntime`;         
      const idHex = `0x` + id.toString(16);

      const params = [idHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const downtime = await fantomRPC({ method, params, id: reqId });

      if (downtime.result === null) return Promise.reject();
      if (downtime.error) return Promise.reject(downtime.error.message);

      req.foundDowntime = downtime.result;
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

module.exports.getOriginationScore = (req, res, next) => [
  param('id')
    .exists().bail().withMessage(`required`)
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000 }).bail().withMessage('tooLargeNumber')
    .toInt()
    .custom(async (id, { req }) => {
      const method = `sfc_getOriginationScore`;         
      const idHex = `0x` + id.toString(16);

      const params = [idHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const origScore = await fantomRPC({ method, params, id: reqId });

      if (origScore.result === null) return Promise.reject();
      if (origScore.error) return Promise.reject(origScore.error.message);

      req.foundOrigScore = parseInt(origScore.result, 16);
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

module.exports.getPoi = (req, res, next) => [
  param('id')
    .exists().bail().withMessage(`required`)
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000 }).bail().withMessage('tooLargeNumber')
    .toInt()
    .custom(async (id, { req }) => {
      const method = `sfc_getStakerPoI`;         
      const idHex = `0x` + id.toString(16);

      const params = [idHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const poi = await fantomRPC({ method, params, id: reqId });

      if (poi.result === null) return Promise.reject();
      if (poi.error) return Promise.reject(poi.error.message);

      req.foundPoi = parseInt(poi.result, 16);
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

module.exports.getValidationScore = (req, res, next) => [
  param('id')
    .exists().bail().withMessage(`required`)
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000 }).bail().withMessage('tooLargeNumber')
    .toInt()
    .custom(async (id, { req }) => {
      const method = `sfc_getValidationScore`;         
      const idHex = `0x` + id.toString(16);

      const params = [idHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const validScore = await fantomRPC({ method, params, id: reqId });

      if (validScore.result === null) return Promise.reject();
      if (validScore.error) return Promise.reject(validScore.error.message);

      req.foundValidScore = parseInt(validScore.result, 16);
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

module.exports.list = (req, res, next) => [
  query('verbosity')
    .optional()
    .isInt({ min: 0, max: 2}).withMessage(`invalidValue`),

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

module.exports.getRewardWeights = (req, res, next) => [
  param('id')
    .exists().bail().withMessage(`required`)
    .isInt().bail().withMessage('shouldBeNumber')
    .isInt({ min: 0 }).bail().withMessage('positive')
    .isInt({ max: 100000000 }).bail().withMessage('tooLargeNumber')
    .toInt()
    .custom(async (id, { req }) => {
      const method = `sfc_getRewardWeights`;         
      const idHex = `0x` + id.toString(16);

      const params = [idHex];
      const reqId = 1; // required by fantom node rpc-api, intended for request accounting (this ability not using now)
      const rewardWeights = await fantomRPC({ method, params, id: reqId });

      if (rewardWeights.result === null) return Promise.reject();
      if (rewardWeights.error) return Promise.reject(rewardWeights.error.message);
      
      req.foundRewardWeights = rewardWeights.result;
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
