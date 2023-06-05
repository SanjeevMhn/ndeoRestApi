
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('../config/db');
const tokenExpireTimeStamp = require('../helper/tokenExpireTimeStamp');

const handleUserLogin = async (req,res) => {
    try{
        const { user_email, user_password } = req.body;
        if(!user_email || !user_password){
            return res.sendStatus(400);
        }
        const foundUserQuery = "SELECT * FROM users WHERE user_email = $1";
        const foundUserResult = await pool.query(foundUserQuery,[user_email]);
        if(foundUserResult.rowCount == 0){
            return res.sendStatus(404)
        }
        
        const decryptedPassword = await bcrypt.compare(user_password,foundUserResult.rows[0].user_password);
        if(!decryptedPassword){
            res.status(403).json({'message': 'Invalid user password'});
            return
        }

        const accessToken = jwt.sign(
            { 'user_email': foundUserResult.rows[0].user_email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '60s' }
        );
        const refreshToken = jwt.sign(
            { 'user_email': foundUserResult.rows[0].user_email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        
        const tokenExpire = tokenExpireTimeStamp();
        const storeRefreshTokenQuery = `INSERT INTO user_refresh_tokens
                                            (user_id, token, expiresAt) 
                                        VALUES 
                                            ($1,$2,$3)`;

        await pool.query(storeRefreshTokenQuery,[
            foundUserResult.rows[0].user_id,
            refreshToken,
            tokenExpire
        ]);

        res.cookie('jwt', refreshToken,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            'message' : 'User logged in successfully',
            'access_token': accessToken
        });
    }catch(error){
        console.log(error)
        res.status(500).json({'error': 'Error logging in user'});
    }
}

module.exports = { handleUserLogin };