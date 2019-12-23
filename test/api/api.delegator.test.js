const app = require("../../bin/api");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe("route /delegator/staker/:id", () => {
  it("returns delegators by staker", async () => {
    const delegatorsRes = await chai.request(app).get(`/api/v1/delegator/staker/1/?verbosity=2`);
    expect(delegatorsRes).to.have.status(200);    
  });
});

async function testWithRealDelegatorObject(){
  let stakers = await chai.request(app).get("/api/v1/staker?verbosity=2");
  if (!stakers.body.data.stakers.length){
    console.log('\x1b[43m%s\x1b[0m', 'WARNING:', `There is no stakers in DB!`);
    return;
  }
  
  let delegator;
  stakers = stakers.body.data.stakers;
  for (const index in stakers){
    const delegators = await chai.request(app).get(`/api/v1/delegator/staker/${stakers[index].id}/?verbosity=2`);
    if (delegators.body.data.delegators.length){
      delegator = delegators.body.data.delegators[0];
      break;
    }
  }

  if (!delegator){
    console.log('\x1b[43m%s\x1b[0m', 'WARNING:', `Delegator not found!`);
    return;
  }

  describe("route /delegator/address/:address", () => {
    it("returns delegator by its address", async () => {   
      const delegatorRes = await chai.request(app).get(`/api/v1/delegator/address/${delegator.address}`);
      expect(delegatorRes).to.have.status(200);    
    });
  });
}

testWithRealDelegatorObject();