const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
    res.render('profile', { title: '회원가입' });
});

router.post('/', isLoggedIn, async (req, res, next) => {

    const {id, password,verify_password,  nickname} = req.body;

    try {
        let exUser = await User.findOne({where: {id}});
        if (!id) {
            res.send('<script> alert("아이디를 입력해주세요.");history.back()</script>');
        }
        if (exUser) {
            res.send('<script> alert("이미 존재하는 아이디입니다.");history.back()</script>');
        }
        if (!password) {
            res.send('<script> alert("비밀번호를 입력해주세요.");history.back()</script>');
        }
        if (password!==verify_password) {
            res.send('<script> alert("비밀번호가 같지 않습니다.");history.back()</script>');
        }
        if (!nickname) {
            res.send('<script> alert("닉네임을 입력해주세요.");history.back()</script>');
        }

        exUser = await User.findOne({where: {nickname}});
        if (exUser) {
            res.send('<script> alert("이미 존재하는 닉네임입니다.");history.back()</script>');
            res.redirect('/join');
        }

        const hash = await bcrypt.hash(password, 12);
        console.log(hash.length);
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
module.exports = router;