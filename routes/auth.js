const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const {id, password,verify_password, sns_id, nickname, name, birth_date, gender, introduce, profile_image} = req.body;
    try {
        let exUser = await User.findOne({where: {id}});
        if (exUser) {
            return res.redirect('/join?error=exist');
        }
        if (!password) {
            return res.redirect('/join?error=exist');
        }
        if (password!=verify_password) {
            return res.redirect('/join?error=exist');
        }
        if (!nickname) {
            return res.redirect('/join?error=exist');
        }

        exUser = await User.findOne({where: {nickname}});
        if (exUser) {
            return res.redirect('/join?error=exist');
        }

        if (!name) {
            return res.redirect('/join?error=exist');
        }
        if (!birth_date) {
            return res.redirect('/join?error=exist');
        }
        if (!gender) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            id,
            password: hash,
            sns_id,
            nickname,
            name,
            birth_date,
            gender,
            introduce,
            profile_image
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;
