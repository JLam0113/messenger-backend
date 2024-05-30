const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require("passport");
const dotenv = require('dotenv').config()
const Token = require("../models/token");
const uuid = require('uuid');
const ObjectId = require('mongoose').Types.ObjectId;
const jwtToken = require('../public/javascripts/jwtToken')

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
              let d1 = new Date(Date.now() + 60 * 60 * 24 * 1000);
              const refreshToken = new Token({
                user: new ObjectId(user._id),
                token: uuid.v4(),
                expiryDate: d1
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

router.get('/auth', jwtToken.verifyJWT, (req, res) => {
  res.json({ username: res.locals.user.username })
});

module.exports = router;