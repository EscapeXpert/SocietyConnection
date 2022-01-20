const express = require('express');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const axios = require("axios");

const router = express.Router();


router.get('/join', isNotLoggedIn, async (req, res) => {
    res.render('join', {title: '회원가입'});
});
router.post('/join', isNotLoggedIn, async (req, res, next) => {

    const {id, password, verify_password, nickname} = req.body;

    try {
        let exUser = await User.findOne({where: {id}});
        if (!id) {
            return res.send('<script> alert("아이디를 입력해주세요.");history.back()</script>');
        }
        if (exUser) {
            return res.send('<script> alert("이미 존재하는 아이디입니다.");history.back()</script>');
        }
        if (!password) {
            return res.send('<script> alert("비밀번호를 입력해주세요.");history.back()</script>');
        }
        if (password !== verify_password) {
            return res.send('<script> alert("비밀번호가 같지 않습니다.");history.back()</script>');
        }
        if (!nickname) {
            return res.send('<script> alert("닉네임을 입력해주세요.");history.back()</script>');
        }

        exUser = await User.findOne({where: {nickname}});
        if (exUser) {
            res.send('<script> alert("이미 존재하는 닉네임입니다.");history.back()</script>');
            return res.redirect('/join');
        }

        const hash = await bcrypt.hash(password, 12);
        await User.create({
            id,
            password: hash,
            nickname
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, async (req, res, next) => {
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

router.get('/logout', isLoggedIn, async (req, res) => {
    req.logout();
    if(req.session){
        req.session.destroy();
    }

    res.redirect('/');
});
router.get('/kakao_logout', isLoggedIn, async (req, res) => {
    if (req.user.login_type === 'kakao') {
        const REST_API_KEY = process.env.KAKAO_ID;
        const LOGOUT_REDIRECT_URI = 'http://localhost:3001/auth/logout';
        res.redirect(`https://kauth.kakao.com/oauth/logout?client_id=${REST_API_KEY}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`);
    }
});
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;