const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: Date, required: true }
});


module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
