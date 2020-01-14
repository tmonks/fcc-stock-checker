/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const expect = require("chai").expect;
const fetch = require("node-fetch");
const mongoose = require("mongoose");

// configure schema and model for "likes"
const likeSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  ipAddress: { type: String, required: true }
});
likeSchema.index({ stock: 1, ipAddress: 1 }, { unique: true });
const Like = mongoose.model("Like", likeSchema);

// Add a like for the stock from ipAddress
const likeStock = async (stock, ipAddress) => {
  try {
    const newLike = new Like({ stock, ipAddress });
    const result = await newLike.save();
    console.log("likeStock successful");
  } catch (err) {
    if (!err.code === 11000) {
      // ignore error code 11000, which means the like
      // for this IP already exists
      throw err;
    }
  }
};

// get the current number of Likes for stock
const getLikes = async stock => {
  try {
    const likes = await Like.find({ stock });
    return likes.length;
  } catch (err) {
    console.log(err);
    throw new Error("Error retrieving likes");
  }
};

// fetch current stock price
const getPrice = async stock => {
  try {
    const response = await fetch(
      "https://repeated-alpaca.glitch.me/v1/stock/" + stock + "/quote"
    );
    const json = await response.json();
    return json.latestPrice;
  } catch (err) {
    console.log(err);
    throw new Error("Error retrieving price for " + stock);
  }
};

module.exports = app => {
  app.route("/api/stock-prices").get(async (req, res, next) => {
    let stock, stock2;
    if (typeof req.query.stock === "string") {
      // only one stock was passed
      stock = req.query.stock.toUpperCase();
    } else {
      // array of 2 stocks was passed
      stock = req.query.stock[0].toUpperCase();
      stock2 = req.query.stock[1].toUpperCase();
    }

    try {
      if (!stock) {
        throw new Error("No stock provided");
      }

      const [ipAddress] = req.headers["x-forwarded-for"].split(",");
      const likeIt = req.query.like ? req.query.like : false;

      if (likeIt) {
        // Add a Like for this IP
        await likeStock(stock, ipAddress);
      }
      // Retrieve the current likes for this stock
      const likeCount = await getLikes(stock);
      // Retrieve the stock price
      const price = await getPrice(stock);

      if (!stock2) {
        // return results for 1 stock
        res.json({ stockData: { stock, price, likes: likeCount } });
      } else {
        // process 2nd stock... 
        if (likeIt) {
          await likeStock(stock2, ipAddress);
        }
        const likeCount2 = await getLikes(stock2);
        const price2 = await getPrice(stock2);
        // return both stocks with relative likes
        res.json({
          stockData: [
            { stock: stock, price: price, rel_likes: likeCount - likeCount2 },
            { stock: stock2, price: price2, rel_likes: likeCount2 - likeCount }
          ]
        });
      }
    } catch (err) {
      next(err);
    }
  });
};
