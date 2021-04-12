const server = require("../../server");
const chai = require("chai");
const request = require("supertest");

const expect = chai.expect

describe("API Tests", () => {
    const testUrl = "https://somnathpathak.github.io/web";

    describe("Get crawled url site map", () => {
        it("should crawl url and get site map", (done) => {
            request(server).get(`/crawl?url=${testUrl}`).end(function (err, res) {
                console.log("Response", res);
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.be.an("object");
                done();
            });
        });
    });
})
