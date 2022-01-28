const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const User = require('../models/user');
const express = require("express");

const app = express();
app.use(cookieParser);

module.exports = () => {
    passport.use(new LocalStrategy( {
        usernameField: 'id',
        passwordField: 'password',
        passReqToCallback: true,
    }, async (req,id, password,done) => {
        try {
            const exUser = await User.findOne({ where: { id } });
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, {user: exUser , auto_login : req.body.auto_login});
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
