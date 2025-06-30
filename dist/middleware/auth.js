import User from '../models/user.js';
import jwt from 'jsonwebtoken';
export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('No token provided');
        }
        const payload = jwt.verify(token, 'mySecretKey');
        if (typeof payload !== 'object' || !payload || !('_id' in payload)) {
            throw new Error('Invalid token payload');
        }
        const user = await User.findOne({ _id: payload._id, 'tokens.token': token });
        if (!user) {
            throw new Error('User not found');
        }
        // Extend Request interface to include user and token properties if needed
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        res.status(400).send(error);
    }
};
