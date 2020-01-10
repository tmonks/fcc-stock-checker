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

// configure Like schema and model
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
      throw err;
    } else {
      console.log("Ignoring error from duplicate like");
    }
  }
};

// get the current number of Likes for stock
const getLikes = async stock => {
  try {
    const likes = await Like.find({ stock });
    return likes.length;
  } catch (err) {
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
    throw new Error("Error retrieving price for " + stock);
  }
};

module.exports = app => {
  app.route("/api/stock-prices").get(async (req, res, next) => {
    const stock = typeof req.query.stock === "string" 
      ? req.query.stock.toUpperCase() 
      : req.query.stock[0].toUpperCase();

    try {
      if (!stock) {
        throw new Error("No stock provided");
      }

      const [ipAddress] = req.headers["x-forwarded-for"].split(",");
      const likeIt = req.query.like ? req.query.like : false;

      console.log("stock type: ", typeof req.query.stock);
      console.log(ipAddress, likeIt ? "liked" : "not liked");

      // Try to add a Like for this IP
      if (likeIt) {
        await likeStock(stock, ipAddress);
      }

      // Retrieve the current likes for this stock
      const likeCount = await getLikes(stock);
      // Fetch the stock price
      const price = await getPrice(stock);
      console.log(price);

      res.json({
        stockData: {
          stock,
          price,
          likes: likeCount
        }
      });
    } catch (err) {
      next(err);
    }
  });
};
