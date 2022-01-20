const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password',
    }, async (id, password, done) => {
        try {
            const exUser = await User.findOne({ where: { id } });
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, {user: exUser});
                } else {
                    done(null, false, { message: 'incorrect password' });
                }
            } else {
                done(null, false, { message: 'no member' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
