const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');

const users = () => db.get().collection(collection.USER_COLLECTION)

// what is kept in the session: never the password hash
const publicUser = (user) => ({ _id: user._id.toString(), username: user.username, email: user.email })

module.exports = {
    doSignup: async (userData) => {
        const username = String(userData.username || '').trim();
        const email = String(userData.email || '').trim().toLowerCase();
        const password = String(userData.password || '');

        if (!username || !email || !password) {
            return { status: false, message: 'All fields are required' };
        }
        if (password.length < 6) {
            return { status: false, message: 'Password must be at least 6 characters' };
        }
        if (await users().findOne({ email })) {
            return { status: false, message: 'An account with this email already exists' };
        }

        const user = { username, email, password: await bcrypt.hash(password, 10), createdAt: new Date() };
        const result = await users().insertOne(user);
        user._id = result.insertedId;
        return { status: true, user: publicUser(user) };
    },
    doLogin: async (userData) => {
        const email = String(userData.email || '').trim().toLowerCase();
        const user = await users().findOne({ email });
        if (user && await bcrypt.compare(String(userData.password || ''), user.password)) {
            return { status: true, user: publicUser(user) };
        }
        return { status: false };
    },
    getAllUsers: () => {
        return users().find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
    }
};
