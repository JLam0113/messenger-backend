const ChatRoom = require("../models/chatroom");
const Message = require("../models/message");
const ObjectId = require('mongoose').Types.ObjectId;

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const allChatRooms = await ChatRoom.find({ users: req.query.id }).populate('users', 'username -_id').sort({ lastMessage: 1 }).exec();
  res.status(200).json({ chatrooms: allChatRooms })
});

exports.messages = asyncHandler(async (req, res, next) => {
  const allMessages = await Message.find({ "chatroom": new ObjectId(req.params.id) }).populate('user', 'username -_id').sort({ date: 1 }).exec();
  res.status(200).json({ messages: allMessages })
});

exports.create = [
  body("users", "content must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const users = req.body.users.map((user) => {
      return new ObjectId(user)
    });
    const chatRoom = new ChatRoom({
      users: users,
      lastMessage: new Date(),
    });

    if (!errors.isEmpty()) {
      res.sendStatus(500)
    }
    else {
      await chatRoom.save().then((response) => res.status(201).json({ id: response.id, result: 'Chat room created' }))
    }
  }),];