const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const handleRefreshToken = async (req,res) => {
    const cookies = req.cookies;
    if(!cookies || !cookies.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUserQuery = `SELECT * FROM user_refresh_tokens WHERE token = $1`;
    const foundUserResult = await pool.query(foundUserQuery,[refreshToken]);
    const foundUserEmailQuery = `SELECT user_email from users WHERE users.user_id = $1`;
    const foundUserEmailResult = await pool.query(foundUserEmailQuery,[foundUserResult.rows[0].user_id]);

    if(foundUserResult.rowCount == 0) return res.sendStatus(403);

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err,decoded) => {
            if(err || foundUserEmailResult.rows[0].user_email !== decoded.user_email) return res.sendStatus(403);
            const access_token = jwt.sign(
                {"user_email": decoded.user_email},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '60s' }
            );
            res.json({"access_token": access_token})
        }
    );
}

module.exports = { handleRefreshToken }