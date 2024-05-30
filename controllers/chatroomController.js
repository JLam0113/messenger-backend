const ChatRoom = require("../models/chatroom");
const Message = require("../models/message");
const ObjectId = require('mongoose').Types.ObjectId;

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.get = asyncHandler(async (req, res, next) => {
  const allComments = await Comment.find({ "post": new ObjectId(req.params.id) }).sort({ name: 1 }).exec();
  res.json({ posts: allComments })
});

exports.create = [
  body("content", "content must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const comment = new Comment({
      content: req.body.content,
      date: new Date(),
      post: new ObjectId(req.body.post),
    });

    if (!errors.isEmpty()) {
      res.sendStatus(500)
    }
    else {
      await comment.save();
      res.json({ message: 'Comment created' })
    }
  }),];
  
exports.update = [
  body("content", "content must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const comment = new Comment({
      content: req.body.content,
      date: new Date(),
      post: new ObjectId(req.body.post),
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.sendStatus(500)
    }
    else {
      await Comment.findByIdAndUpdate(req.params.id, comment, {});
      res.json({ message: 'Comment updated' })
    }
  }),];