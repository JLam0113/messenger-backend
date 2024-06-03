const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
  users: { type: [{ type: Schema.ObjectId, ref: "User" }], required: true },
  lastMessage: { type: Date, required: true }
});


module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
