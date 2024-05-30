const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    chatroom: { type: Schema.ObjectId, ref: "ChatRoom", required: true },
    user: { type: Schema.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    message: { type: String, required: true }
});


module.exports = mongoose.model("Token", TokenSchema);
