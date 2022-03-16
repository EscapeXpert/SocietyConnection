const express = require('express');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());

router.post('/join', csrfProtection, isNotLoggedIn, async (req, res, next) => {
    const {id, password, verify_password, nickname} = req.body;
    try {
        let exUser = await User.findOne({where: {id}});
        if (!id) {
            return res.send('<script> alert("아이디를 입력해주세요.");history.back()</script>');
        }
        if (exUser) {
            return res.send('<script> alert("이미 존재하는 아이디입니다.");history.back()</script>');
        }
        if (password !== verify_password) {
            return res.send('<script> alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");history.back()</script>');
        }
        if (!nickname) {
            return res.send('<script> alert("닉네임을 입력해주세요.");history.back()</script>');
        }

        exUser = await User.findOne({where: {nickname}});
        if (exUser) {
            return res.send('<script> alert("이미 존재하는 닉네임입니다.");history.back()</script>');
        }
        if(password.search(/\s/) !== -1) {
            return res.send('<script> alert("비밀번호에 공백이 입력되었습니다.");history.back()</script>');
        }
        const PwRules = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/;
        if(!PwRules.test(password)) {
            return res.send('<script> alert("비밀번호는 8자리 이상 문자, 숫자, 특수문자로 구성하여야 합니다.");history.back()</script>');
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

router.post('/login', csrfProtection, isNotLoggedIn, async (req, res, next)=>{
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            if(info.message === 'no member')
            {
                return res.send('<script> alert("가입되지 않은 회원입니다.");history.back();</script>');
            } else if(info.message === 'incorrect password')
            {
                return res.send('<script> alert("비밀번호가 일치하지 않습니다.");history.back();</script>');
            }
        }
        return req.login(user,async (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            if(req.user&&req.user.auto_login){
                const dead_time = 1000*60*60*24*7;
                const offset = new Date().getTimezoneOffset() * 60000;
                const now_date = new Date(Date.now() - offset);
                const date = new Date(now_date.getTime() + dead_time);
                res.cookie('auto_login', req.sessionID, {
                    maxAge:dead_time
                });
                await User.update({
                    session_id: req.sessionID,
                    session_deadline: date
                }, {
                    where: {id: user.user.id},
                });
            }
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, async (req, res) => {
    if(req.cookies.auto_login) {
        res.clearCookie('auto_login');
        await User.update({
            session_id: null,
            session_deadline: null
        }, {
            where: {id: req.user.id},
        });
    }
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