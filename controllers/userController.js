const User = require("../models/user");
const ObjectId = require('mongoose').Types.ObjectId;

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.search = [
  body("user", "content must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.sendStatus(500)
    }
    else {
      const allUsers = await User.find({ $text: { $search: req.body.user}}).sort({ username: 1 }).exec();
      res.json({ users: allUsers })
    }
  }),];