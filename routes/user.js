const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController")
const jwtToken = require('../public/javascripts/jwtToken')

router.get("/", jwtToken.verifyJWT, user_controller.search);

module.exports = router;