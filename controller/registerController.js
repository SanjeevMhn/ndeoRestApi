const bcrypt = require('bcrypt');
const pool = require('../config/db');

const handleUserRegister = async(req,res) => {
    try{
        const { user_name,user_email,user_password } = req.body;
        if(!user_name || !user_email || !user_password){
            res.status(400).json({'message': 'Please enter all the required fields (user name, user email and user password)'});
            return;
        }

        const checkExistingUserQuery = "SELECT * FROM users WHERE user_email = $1";
        const existingUseResult = await pool.query(checkExistingUserQuery,[user_email]);
        if(existingUseResult.rowCount > 0){
            res.status(403).json({'message': 'Email already exists.'});
            return;
        }

        const hashedPassword = await bcrypt.hash(user_password,10);
        const userRole = 2;
        const addUserQuery = `INSERT INTO users (user_name, user_password, user_email, user_role) VALUES ($1, $2, $3, $4)`;
        
        await pool.query(addUserQuery,[
            user_name,
            hashedPassword,
            user_email,
            userRole
        ]);
        res.status(201).json({'message': 'User created successfully'});

    }catch(error){
        console.log(error);
        res.status(500).json({'message': 'Error while registering new user'});
    }
}

module.exports = { handleUserRegister };