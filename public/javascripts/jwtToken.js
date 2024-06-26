const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config()
const Token = require("../../models/token");

async function verifyJWT(req, res, next) {
    const authToken = req.cookies['authToken'];

    if (authToken == null) return res.sendStatus(401);

    jwt.verify(authToken, dotenv.parsed.SECRET, async (err, authData) => {
        if (err) {
            const refreshToken = req.cookies['refreshToken'];

            if (refreshToken == null) return res.sendStatus(401);

            const token = await Token.findOne({ "token": refreshToken, "authToken": authToken }).populate('user', '_id username').exec();
            
            if (token !== null) {
                if (new Date() < token.expiryDate) {
                    const body = { _id: token.user._id, username: token.user.username };
                    const authToken = jwt.sign({ user: body }, dotenv.parsed.SECRET, { expiresIn: '15m' });

                    res.cookie('authToken', authToken, { maxAge: 900000, httpOnly: true })
                    await Token.findByIdAndUpdate(token._id, { authToken: authToken }, {});
                    res.locals.user = token.user;
                    next()
                }
                else {
                    await Token.deleteOne({ "token": refreshToken })
                    res.sendStatus(401)
                }
            }
            else {
                res.sendStatus(401)
            }
        } else {
            res.locals.user = authData.user;
            next()
        }
    })
}

module.exports = { verifyJWT };