const express = require("express");
const router = express.Router();
const chatroom_controller = require("../controllers/chatroomController")
const jwtToken = require('../public/javascripts/jwtToken')


router.get("/", jwtToken.verifyJWT, chatroom_controller.index);

router.get("/:id", jwtToken.verifyJWT, chatroom_controller.messages);

router.post("/", jwtToken.verifyJWT, chatroom_controller.create);

module.exports = router;