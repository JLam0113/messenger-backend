const ChatRoom = require("../models/chatroom");
const Message = require("../models/message");
const ObjectId = require('mongoose').Types.ObjectId;

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const allChatRooms = await ChatRoom.find({ users: req.param.id }).sort({ lastMessage: 1 }).exec();
  res.json({ chatrooms: allChatRooms })
});

exports.messages = asyncHandler(async (req, res, next) => {
  const allMessages = await Message.find({ "chatroom": new ObjectId(req.params.id) }).sort({ date: 1 }).exec();
  res.json({ messages: allMessages })
});

// TODO Users is empty when saved
exports.create = [
  body("users", "content must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const users = []
    req.body.users.forEach(user => {
      users.push(new ObjectId(user))
    });
    const chatRoom = new ChatRoom({
      users: users,
      lastMessage: new Date(),
    });

    if (!errors.isEmpty()) {
      res.sendStatus(500)
    }
    else {
      await chatRoom.save().then((response) => res.json({ id: response.id, result: 'Chat room created' }))
    }
  }),];

exports.updateTime = [
  asyncHandler(async (req, res, next) => {
    const chatRoom = new ChatRoom({
      lastMessage: new Date(),
    });
    await chatRoom.findByIdAndUpdate(req.body.chatroom, chatRoom, {});
    next();
  }),];