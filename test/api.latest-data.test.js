const app = require("../bin/api");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe("route /get-latest-data", () => {
  it("returns latest blocks and transactions", done => {
    chai
      .request(app)
      .get("/api/v1/get-latest-data")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});