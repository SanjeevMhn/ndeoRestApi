require('dotenv').config();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const getUserData = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.sendStatus(401);
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403);
                const getUserDataFromEmailQuery = `SELECT user_id,user_name,user_email FROM users WHERE user_email = $1`;
                const getUserDataFromEmailResult = await pool.query(getUserDataFromEmailQuery,[decoded.user_email])

                const getUserPostsQuery = `SELECT posts.post_id,posts.post_title,posts.post_desc FROM posts WHERE posts.user_id = $1`;
                const getUserPostsResult = await pool.query(getUserPostsQuery,[getUserDataFromEmailResult.rows[0].user_id]);

                res.status(200).json({user: getUserDataFromEmailResult.rows, posts: getUserPostsResult.rows})
            }
        )
    }catch (error){
        res.status(500).json({error: 'An error occured while getting user data'});
    }
}

module.exports = { getUserData };