function verifyJWT(req, res, next) {
    const authToken = req.cookies['authToken'];
    // If there is no cookie, return an error
    if (authToken == null) return res.sendStatus(401);

    jwt.verify(authToken, dotenv.parsed.SECRET, async (err, authData) => {
        if (err) {
            refreshJWT(authData)
        } else {
            res.locals.user = authData.user;
            next();
        }
    })
}

function refreshJWT(authData) {
    return async (req, res, next) => {
        const refreshToken = req.cookies['refreshToken'];

        // If there is no cookie, return an error
        if (refreshToken == null) return res.sendStatus(401);

        const token = await Token.find({ "token": refreshToken }).sort({ name: 1 }).exec();
        if (new Date() < token.Date) {
            // Create new auth token
            const authToken = jwt.sign({ user: authData.user }, dotenv.parsed.SECRET, { expiresIn: '15m' });
            res.cookie('authToken', authToken, { maxAge: 900000, httpOnly: true })
            res.locals.user = authData.user;
            next();
        }
        else {
            await Token.deleteOne({ "token": refreshToken })
            res.sendStatus(401)
        }
    }
}

module.exports = jwtToken;