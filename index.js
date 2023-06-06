const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();
// import tokenExpireTimeStamp from './helper/tokenExpireTimeStamp';
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
// const credentials = require('./middleware/credentials');

// import pool from './config/db';


// app.use(credentials);
app.use(cors({
    origin: ['http://localhost:4200', 'https://www.sanusnursery.com.np']
}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api/register',require('./routes/registerRoute'));
app.use('/api/login',require('./routes/authRoute'));
app.use('/api/refresh', require('./routes/refreshRoute'));
app.use('/api/logout',require('./routes/logoutRoute'));

app.use(verifyJWT);
app.use('/api/posts', require('./routes/postRoute'));


app.listen(port, () => {
    console.log(`Server Running at ${port}`);
})