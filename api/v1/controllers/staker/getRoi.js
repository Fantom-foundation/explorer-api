const errors = require('../../../../mixins/errors');
const okResp = require('../../../../mixins/okResponseConstructor');
const Web3 = require('web3');
const BN = Web3.utils.BN;
const {calcValidatorRewards, getEpochSnapshot, getCurrentEpoch, stakers} = require('../../../../mixins/contractsMethods')
const zeroInt = new BN(0);

const ErrEpochNumIsTooBig = "current epoch is less than number of epochs requested for calculation";
const ErrMissingRequestParameters = (req) => `Missing request parameters: id: ${req.id}, epochs: ${req.epochsNum}`;

module.exports = async (req, res, next) => {
  if (!req.params.id || !req.params.epochsNum) {
      throw ErrMissingRequestParameters(req);
  }

  const second = 1;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  // we have to ensure that epochsNum is represented as string
  let epochNumber = req.params.epochsNum.toString();
  let epochNum = new BN(epochNumber);
  let stkrId = req.params.id.toString();
  let currentEpochRes = await getCurrentEpoch();
  let currentEpoch = new BN(currentEpochRes);
  if (currentEpoch.sub(epochNum).cmp(zeroInt) === -1) {
      throw ErrEpochNumIsTooBig;
  }

  let epochNumInt = parseInt(epochNumber);
  let calcRewardsStartEpoch = new BN(currentEpoch).sub(epochNum);
  let rewards = await calcValidatorRewards(stkrId, calcRewardsStartEpoch, epochNum);
  let totalDuration = new BN(0);
  for (let i=0; i < epochNumInt; i++) {
      let targetEpoch = currentEpoch.sub(new BN(i+1));
      let snapshot = await getEpochSnapshot(targetEpoch);
      totalDuration = totalDuration.add(new BN(snapshot.duration));
  }

  let staker = await stakers(stkrId);
  let stake = new BN(staker.stakeAmount);
  let reward = new BN(rewards[0]);
  let rewardYearScale = reward.mul(new BN(year));
  let rewardPerYear = rewardYearScale.div(totalDuration);
  let roi = rewardPerYear.div(stake);
  
  try {          
    return res.json(okResp({ roi: roi.toString() }));
  }
  catch (err){
    next( errors.internalServerError );
  }
};