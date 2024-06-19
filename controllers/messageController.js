const Message = require("../models/message");
const ObjectId = require('mongoose').Types.ObjectId;
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ChatRoom = require("../models/chatroom");


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
      const session = await mongoose.startSession()
      try {
        session.startTransaction()

        const createdMessage = await message.save({ session })
        await ChatRoom.findByIdAndUpdate(req.body.chatroom, { lastMessage: message.date }, { session: session })

        await session.commitTransaction()
        res.status(200).json(createdMessage)
      } catch (err) {
        await session.abortTransaction()
        console.error(err)
      } finally {
        await session.endSession()
      }
    }
  }),];