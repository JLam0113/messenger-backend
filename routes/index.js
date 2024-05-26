const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require("passport");
const dotenv = require('dotenv').config()
const Token = require("../models/token");
const uuid = require('uuid');
const ObjectId = require('mongoose').Types.ObjectId;

router.post(
  '/login',
  async (req, res, next) => {
    passport.authenticate(
      'login',
      async (err, user, info) => {
        try {
          if (err || !user) {
            const error = new Error('An error occurred.');

            return next(error);
          }
          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);

              const body = { _id: user._id, username: user.username };
              const authToken = jwt.sign({ user: body }, dotenv.parsed.SECRET, { expiresIn: '15m' });
              let d1 = new Date();
              const refreshToken = new Token({
                user: new ObjectId(user._id),
                token: uuid.v4(),
                expiryDate: new Date().setMinutes(d1.getDay + 1)
              });
              const result = await refreshToken.save();

              res.cookie('authToken', authToken, { maxAge: 900000, httpOnly: true })
              res.cookie('refreshToken', refreshToken.token, { maxAge: 900000, httpOnly: true })
              res.json({ username: user.username });
            }
          );
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  }
);

router.get('/auth', verifyJWT, (req, res) => {

  res.json(req.user);
})

function verifyJWT(req, res, next) {
  const authToken = req.cookies['authToken'];

  // If there is no cookie, return an error
  if (authToken == null) return res.sendStatus(401);

  jwt.verify(authToken, dotenv.parsed.SECRET, async (err, authData) => {
    if (err) {
      refreshJWT
    } else {
      next();
    }
  })
}

async function refreshJWT(req, res, next) {
  const refreshToken = req.cookies['refreshToken'];

  // If there is no cookie, return an error
  if (refreshToken == null) return res.sendStatus(401);

  const token = await Token.find({ "token": refreshToken }).sort({ name: 1 }).exec();
  if(new Date() < token.Date){
    // Create new auth token
  }
  else {
    res.sendStatus(403)
  }
}

module.exports = router;