const express = require("express");
const router = express.Router();
const message_controller = require("../controllers/messageController")
const jwtToken = require('../public/javascripts/jwtToken')

router.post("/", jwtToken.verifyJWT, message_controller.create);

module.exports = router;