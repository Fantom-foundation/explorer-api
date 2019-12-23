const app = require("../../bin/api");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe("route /staker", () => {
  it("returns list of stakers", done => {
    chai
      .request(app)
      .get("/api/v1/staker")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("returns list of stakers with only stakerIDs", done => {
    chai
      .request(app)
      .get("/api/v1/staker?verbosity=0")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("returns list of stakers with base fields", done => {
    chai
      .request(app)
      .get("/api/v1/staker?verbosity=1")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("returns list of stakers with metrics", done => {
    chai
      .request(app)
      .get("/api/v1/staker?verbosity=2")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

async function testWithRealStakerObject(){
  const stakers = await chai.request(app).get("/api/v1/staker?verbosity=2");
  if (!stakers.body.data.stakers.length){
    console.log('\x1b[43m%s\x1b[0m', 'WARNING:', `There is no stakers in DB!`);
    return;
  }
  const staker = stakers.body.data.stakers[0];

  describe("route /staker/address/:address", () => {
    it("returns staker by its address", async () => {   
      const stakerRes = await chai.request(app).get(`/api/v1/staker/address/${staker.address}`);
      expect(stakerRes).to.have.status(200);    
    });
  });
  
  describe("route /staker/id/:id", () => {
    it("returns staker by its id", async () => {
      const stakerRes = await chai.request(app).get(`/api/v1/staker/id/${staker.id}`);
      expect(stakerRes).to.have.status(200);    
    });
  });
  
  describe("route /staker/id/:id/validation-score", () => {
    it("returns staker's validation score", async () => {
      const stakerRes = await chai.request(app).get(`/api/v1/staker/id/${staker.id}/validation-score`);
      expect(stakerRes).to.have.status(200);    
    });
  });
  
  describe("route /staker/id/:id/poi", () => {
    it("returns staker's proof of importance", async () => {
      const stakerRes = await chai.request(app).get(`/api/v1/staker/id/${staker.id}/poi`);
      expect(stakerRes).to.have.status(200);    
    });
  });
  
  describe("route /staker/id/:id/origination-score", () => {
    it("returns staker's origination score", async () => {
      const stakerRes = await chai.request(app).get(`/api/v1/staker/id/${staker.id}/origination-score`);
      expect(stakerRes).to.have.status(200);    
    });
  });
  
  describe("route /staker/id/:id/downtime", () => {
    it("returns staker's downtime", async () => {
      const stakerRes = await chai.request(app).get(`/api/v1/staker/id/${staker.id}/downtime`);
      expect(stakerRes).to.have.status(200);    
    });
  });
  
  describe("route /staker/id/:id/reward-weights", () => {
    it("returns staker's baseRewardWeight and txRewardWeight", async () => {
      const stakerRes = await chai.request(app).get(`/api/v1/staker/id/${staker.id}/reward-weights`);
      expect(stakerRes).to.have.status(200);    
    });
  });
}

testWithRealStakerObject();
