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

const allowedOrigins = ["http://localhost:4200"];
const corsOptions = {
    origin: function(origin,callback){
        if(!origin || allowedOrigins.indexOf(origin) !== -1){
            callback(null,true);
        }else{
            callback(new Error('Not Allowed by CORS'));
        }
    },
    credentials: true,
}
// app.use(credentials);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api/register',require('./routes/registerRoute'));
app.use('/api/login',require('./routes/authRoute'));
app.use('/api/refresh', require('./routes/refreshRoute'));
app.use('/api/logout',require('./routes/logoutRoute'));

app.use(verifyJWT);
app.use('/api/posts', require('./routes/postRoute'));
app.use('/api/user', require('./routes/userRoute'));


app.listen(port, () => {
    console.log(`Server Running at ${port}`);
})