const pool = require('../config/db');

const handleUserLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204);
        const refreshToken = cookies.jwt;
        console.log(refreshToken);

        const foundUserQuery = `SELECT * FROM user_refresh_tokens WHERE token = $1`;
        const foundUserResult = await pool.query(foundUserQuery, [refreshToken]);

        if (foundUserResult.rowCount == 0) {
            res.clearCookie('jwt', {
                httpOnly: true,
            });
            return res.sendStatus(204);
        }

        const deleteUserRefreshTokenQuery = "DELETE FROM user_refresh_tokens WHERE user_id = $1";
        await pool.query(deleteUserRefreshTokenQuery, [foundUserResult.rows[0].user_id]);
        res.clearCookie('jwt', {
            httpOnly: true,
        });
        res.status(204).json({'message': 'User has been logged out'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ 'message': 'Error while logging out user' });
    }
}

module.exports = { handleUserLogout }