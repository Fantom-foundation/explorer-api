const app = require("../bin/api");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe("route /get-transactions", () => {
  it("returns trxs with default pagination", done => {
    chai
      .request(app)
      .get("/api/v1/get-transactions")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("returns trxs with default pagination filtered by block number", done => {
    chai
      .request(app)
      .get("/api/v1/get-transactions?block=0")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe("route /get-transaction", () => {
  it("returns transaction by hash", async () => {
    const trxsRes = await chai.request(app).get("/api/v1/get-transactions");

    if (!trxsRes.body.data.transactions.length) {
      console.log('\x1b[43m%s\x1b[0m', 'WARNING:', `No transactions in db, so result is not truly`);
      return;
    }

    const trxHash = trxsRes.body.data.transactions[0].hash;
    
    const trxRes = await chai.request(app).get(`/api/v1/get-transaction?transactionHash=${trxHash}`);

    expect(trxRes).to.have.status(200);    
  });
});
