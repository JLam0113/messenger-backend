const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  user: { type: Schema.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});


module.exports = mongoose.model("Token", TokenSchema);
