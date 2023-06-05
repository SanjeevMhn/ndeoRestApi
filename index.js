const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const pool = require('./config/db');
require('dotenv').config();
// import tokenExpireTimeStamp from './helper/tokenExpireTimeStamp';
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');

// import pool from './config/db';

app.listen(port, () => {
    console.log(`Server Running at ${port}`);
})

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/register',require('./routes/registerRoute'));
app.use('/api/login',require('./routes/authRoute'));
app.use('/api/logout',require('./routes/logoutRoute'));

app.use(verifyJWT);
app.get('/api/posts',verifyJWT, async (req, res) => {
    const query = `SELECT 
                        posts.post_id, 
                        TRIM(posts.post_title) as post_title, 
                        TRIM(posts.post_desc) as post_desc, 
                        users.user_name as post_author 
                    FROM posts
                    LEFT JOIN users ON posts.user_id = users.user_id`;
    try {
        const results = await pool.query(query);
        res.status(200).json({ posts: results.rows })
    } catch (error) {
        res.status(500).json({ error: "An error occurred while retrieving posts" });
    }
});

app.post('/api/posts',verifyJWT, async (req, res) => {
    try {
        const { user_id, post_title, post_desc } = req.body;
        const query = "INSERT INTO posts (user_id,post_title,post_desc) VALUES ($1,$2,$3) RETURNING *";
        await pool.query(query, [user_id, post_title, post_desc]);
        res.status(201).json({ message: "New post added" });
    } catch (error) {
        res.status(500).json({ error: "An error occured while adding new post data" });
    }
})


app.get('/:id', (req, res) => {
    let param = req.params.id;
    const getUser = users.filter((user) => {
        if (user.id === Number(param)) {
            return user;
        }
    })

    if (getUser.length !== 0) {
        res.json({
            user: getUser[0]
        })
    } else {
        res.json({
            "message": "Invalid user id"
        });
    }

})

app.delete('/:id', (req, res) => {
    let id = Number(req.params.id);

    let afterDelete = [];
    if (checkExists(id).length !== 0) {
        afterDelete = users.filter(user => {
            if (user.id !== id) {
                return user;
            }
        })
        res.json({
            message: "User deleted",
            users: afterDelete
        })
    } else {
        res.json({
            message: "User doesnot exist"
        })
    }
})

app.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (checkExists(id).length !== 0) {
        let oldUserData = checkExists(id)[0];
        if (req.body.name && req.body.type) {
            let newUserData = {
                id: oldUserData.id,
                name: req.body.name,
                type: req.body.type
            }
            let index = users.map(user => user.id).indexOf(id)
            let copyUsers = users;
            copyUsers[index] = newUserData;
            res.json({
                message: "User Updated",
                users: copyUsers
            });
        } else {
            res.json({
                message: "Invalid user name or type"
            })
        }
    } else {
        res.json({
            message: "User doesnot exist"
        })
    }
})

app.post('/', (req, res) => {
    if (req.body.name && req.body.type) {
        let newUserData = {
            id: users.length + 1,
            name: req.body.name,
            type: req.body.type
        }
        let copyUsers = [...users, newUserData];
        res.json({
            message: "User Added",
            users: copyUsers
        });
    } else {
        res.json({
            message: "Invalid user name or type"
        })
    }
})