const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require("passport");
const dotenv = require('dotenv').config()

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
              const token = jwt.sign({ user: body }, dotenv.parsed.SECRET, { expiresIn: '15m' });

              res.cookie('authToken', token, { maxAge: 900000, httpOnly: true })
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

router.get('auth/me', verifyJWT, (req, res) => {
  /* If the checkToken function succeeds, the API reaches this block. 
  At this point, you have the freedom to perform any desired actions. 
  Additionally, you can access req.user, a parameter sent from 
  the checkToken function. */

  // If the user is authenticated, return the user
  res.json(req.user);
})

function verifyJWT(req, res, next) {
  const authToken = req.cookies['authToken'];

  // If there is no cookie, return an error
  if (authToken == null) return res.sendStatus(401);

  jwt.verify(authToken, dotenv.parsed.SECRET, async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      next();
    }
  })
}

module.exports = router;