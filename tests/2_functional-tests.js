/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("GET /api/stock-prices => stockData object", () => {
    
    let likes;
    
    test("1 stock", done => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .set("X-Forwarded-For", "127.0.0.1")
        .query({ stock: "goog" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData", "stockData object is returned");
          assert.property(res.body.stockData, "stock", "stockData has stock property");
          assert.equal(res.body.stockData.stock, "GOOG", "stock is equal to the one provided, in uppercase");
          assert.property(res.body.stockData, 'likes', "stockData has likes property");
          assert.property(res.body.stockData, 'price', "stockData has price property")
          done();
        });
    }).timeout(10000);

    test("1 stock with like", (done) => {
      chai.request(server)
        .get("/api/stock-prices")
        .set("X-Forwarded-For", "127.0.0.1")
        .query({ stock: "goog", like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData", "stockData object is returned");
          assert.property(res.body.stockData, "stock", "stockData has stock property");
          assert.equal(res.body.stockData.stock, "GOOG", "stock is equal to the one provided, in uppercase");
          assert.property(res.body.stockData, 'likes', "stockData has likes property");
          likes = res.body.stockData.likes;
          assert.property(res.body.stockData, 'price', "stockData has price property");
          done();
        });
    });

    test("1 stock with like again (ensure likes arent double counted)", (done) => {
      chai.request(server)
        .get("/api/stock-prices")
        .set("X-Forwarded-For", "127.0.0.1")
        .query({ stock: "goog", like: "true" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData", "stockData object is returned");
          assert.property(res.body.stockData, "stock", "stockData has stock property");
          assert.equal(res.body.stockData.stock, "GOOG", "stock is equal to the one provided, in uppercase");
          assert.property(res.body.stockData, 'likes', "stockData has likes proerty");
          assert.equal(res.body.stockData.likes, likes, "number of likes has not increased for this IP");
          assert.property(res.body.stockData, 'price', "stockData has price property");
          done();
        });
      
    });

    test("2 stocks", (done) => {
      chai.request(server)
        .get("/api/stock-prices")
        .set("X-Forwarded-For", "127.0.0.1")
        .query({ stock: ["goog", "msft"] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData", "stockData object returned");
          assert.isArray(res.body.stockData, "stockData is an array");
          assert.equal(res.body.stockData.length, 2, "stockData is an array with 2 items");
          assert.property(res.body.stockData[0], 'stock', "stockData[0] has stock property");
          assert.equal(res.body.stockData[0].stock, "GOOG", "the first stock is equal to the one provided, in uppercase");
          assert.property(res.body.stockData[0], 'price', "stockData[0] has price proerty");
          assert.property(res.body.stockData[0], 'rel_likes', "stockData[0] has rel_like property");
          assert.property(res.body.stockData[1], 'stock', "stockData[1] has stock property");
          assert.equal(res.body.stockData[1].stock, "MSFT", "the second stock is equal to the one provided, in uppercase");
          assert.property(res.body.stockData[1], 'price', "stockData[1] has price property");
          assert.property(res.body.stockData[1], 'rel_likes', "stockData[1] has rel_likes property");
          assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0), "the sum of rel_likes equals 0";
          done();
        });
    });

    test("2 stocks with like", (done) => {
      chai.request(server)
        .get("/api/stock-prices")
        .set("X-Forwarded-For", "127.0.0.1")
        .query({ stock: ["goog", "msft"], like: "true" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData", "stockData object is returned");
          assert.isArray(res.body.stockData, "stockData is an array");
          assert.equal(res.body.stockData.length, 2, "stockData has 2 items");
          assert.property(res.body.stockData[0], 'stock', "stockData[0] has stock property");
          assert.equal(res.body.stockData[0].stock, "GOOG", "the first stock is equal to the one provided, in uppercase");
          assert.property(res.body.stockData[0], 'price', "stockData[0] has price property");
          assert.property(res.body.stockData[0], 'rel_likes', "stockData[0] has rel_like property");
          assert.property(res.body.stockData[1], 'stock', "stockData[1] has stock property");
          assert.equal(res.body.stockData[1].stock, "MSFT", "the second stock is equal to the one provided, in uppercase");
          assert.property(res.body.stockData[1], 'price', "stockData[1] has price property");
          assert.property(res.body.stockData[1], 'rel_likes', "stockData[1] has rel_likes property");
          assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0, "the sum of rel_likes equals 0");
          done();
        });
    });
  });
});
