const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const getAllPosts = async (req, res) => {
    try {
        const getAllPostQuery = `SELECT 
                        posts.post_id, 
                        TRIM(posts.post_title) as post_title, 
                        TRIM(posts.post_desc) as post_desc, 
                        users.user_name as post_author 
                    FROM posts
                    LEFT JOIN users ON posts.user_id = users.user_id`;
        const getAllPostsResult = await pool.query(getAllPostQuery);
        res.status(200).json({ posts: getAllPostsResult.rows })
    } catch (error) {
        res.status(500).json({ error: "An error occurred while retrieving posts" });
    }
}

const createNewPosts = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.sendStatus(401);
        const token = authHeader.split(' ')[1];
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403);
                const getUserIdFromEmailQuery = `SELECT user_id FROM users WHERE user_email = $1`;
                const getUserIdFromEmailResult = await pool.query(getUserIdFromEmailQuery,[decoded.user_email]);
                const { post_title, post_desc } = req.body;
                const createNewPostQuery = "INSERT INTO posts (user_id,post_title,post_desc) VALUES ($1,$2,$3) RETURNING *";
                await pool.query(createNewPostQuery, [getUserIdFromEmailResult.rows[0].user_id, post_title, post_desc]);
                res.status(201).json({ message: "New post added" });
            }
        )


    } catch (error) {
        res.status(500).json({ error: "An error occured while adding new post data" });
    }
}

module.exports = {
    getAllPosts,
    createNewPosts
}

