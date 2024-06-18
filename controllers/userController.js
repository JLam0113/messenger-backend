const User = require("../models/user");

const { query, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.search = [
  query("user", "content must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.sendStatus(500)
    }
    else {
      const allUsers = await User.find({ $text: { $search: req.query.user } }, { _id: 1, username: 1 }).sort({ username: 1 }).exec();
      res.status(200).json({ users: allUsers })
    }
  }),];