const app = require("../bin/api");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe("route /get-blocks", () => {
  it("returns blocks with default pagination", done => {
    chai
      .request(app)
      .get("/api/v1/get-blocks")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("checks if total blocks number in database is correct", done => {
    chai
      .request(app)
      .get("/api/v1/get-blocks")
      .end((err, res) => {

        if (res.body.data.blocks.length > 0){
          expect(res.body.data.blocks[0]).to.have.property('number');
          const lastBlockNumberPlusFirstBlock = res.body.data.blocks[0].number + 1; // because first block number is zero
          expect(res.body.data.total).to.equal(lastBlockNumberPlusFirstBlock);
        }

        done();
      });
  });
});

describe("route /get-block", () => {
  it("returns block by its number", done => {
    chai
      .request(app)
      .get("/api/v1/get-block?blockNumber=0")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
