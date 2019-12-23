const app = require("../../bin/api");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe("route /get-accounts", () => {
  it("returns accounts with default pagination", done => {
    chai
      .request(app)
      .get("/api/v1/get-accounts")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe("route /get-account", () => {
  it("returns account by address", async () => {
    const accountsRes = await chai.request(app).get("/api/v1/get-accounts");

    if (!accountsRes.body.data.accounts.length) {
      console.log('\x1b[43m%s\x1b[0m', 'WARNING:', `No accounts in db, so result is not truly`);
      return;
    }

    const address = accountsRes.body.data.accounts[0].address;
    
    const accountRes = await chai.request(app).get(`/api/v1/get-account?address=${address}`);

    expect(accountRes).to.have.status(200);    
  });
});

