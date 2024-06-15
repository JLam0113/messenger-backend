const Message = require("../models/message");
const ObjectId = require('mongoose').Types.ObjectId;
const chatroom_controller = require("../controllers/chatroomController")

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.create = [
  body("chatroom", "content must be specified").trim().isLength({ min: 1 }).escape(),
  body("user", "content must be specified").trim().isLength({ min: 1 }).escape(),
  body("message", "content must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const message = new Message({
      chatroom: new ObjectId(req.body.chatroom),
      user: new ObjectId(req.body.user),
      date: new Date(),
      message: req.body.message,
    });

    if (!errors.isEmpty()) {
      res.sendStatus(500)
    }
    else {
      await message.save().then((response) => {
        chatroom_controller.updateTime
        res.json({ response })
      })
    }
  }),];