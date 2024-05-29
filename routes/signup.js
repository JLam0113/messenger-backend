const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require("../models/user");

router.post("/", async (req, res, next) => {
    try {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            // if err, do something
            if (err) {
                console.log("error hashing");
                return;
            }
            // otherwise, store hashedPassword in DB
            const user = new User({
                username: req.body.username,
                password: hashedPassword
            });
            const result = await user.save();
            res.json({message: 'User registered'})
        });
    } catch (err) {
        return next(err);
    };
});

module.exports = router;