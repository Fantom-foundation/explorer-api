const app = require("../../bin/api");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);

describe("route /epoch/latest", () => {
  it("returns last ended epoch stats", async () => {
    const epochRes = await chai.request(app).get(`/api/v1/epoch/latest`);
    expect(epochRes).to.have.status(200);    
  });
});