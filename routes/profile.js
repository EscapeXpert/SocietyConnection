const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn} = require('./middlewares');
const User = require('../models/user');
const moment = require('moment');

const router = express.Router();

router.get('/', isLoggedIn, async(req, res) => {
    res.render('profile', {
        title: '프로필' ,
        User: req.user
    });
});

router.get('/edit', isLoggedIn, async(req, res) => {
    res.render('edit', {
        title: '프로필 수정' ,
        User: req.user,
        birth: moment(req.user.birth_date).format('YYYY-MM-DD')
    });
});
router.post('/edit', isLoggedIn, async (req, res, next) => {

    const {sns_id, nickname,name,birth_date,gender,introduce,profile_image }= req.body;

    try {
        if (!nickname) {
            res.send('<script> alert("닉네임을 입력해주세요.");history.back()</script>');
        }
        exUser = await User.findOne({where: {nickname}});
        if (exUser.nickname!==req.user.nickname) {
            res.send('<script> alert("이미 존재하는 닉네임입니다.");history.back()</script>');
            res.redirect('/join');
        }
        User.update({
            sns_id : sns_id,
            nickname : nickname,
            name : name,
            birth_date : birth_date,
            gender : gender,
            introduce : introduce,
            profile_image : profile_image
        }, {
            where: {id: req.user.id},
        });
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/change_password', isLoggedIn, async(req, res) => {
    res.render('change_password', { title: '비밀번호 변경' });
});
router.post('/change_password', isLoggedIn, async (req, res, next) => {

    const {password, new_password,verify_new_password} = req.body;

    try {
        if (!password) {
            res.send('<script> alert("비밀번호를 입력해주세요.");history.back()</script>');
        }
        const result = await bcrypt.compare(password, req.user.password);
        if (!result) {
            res.send('<script> alert("비밀번호가 올바르지 않습니다.");history.back()</script>');
        }
        if (new_password!==verify_new_password) {
            res.send('<script> alert("비밀번호가 같지 않습니다.");history.back()</script>');
        }
        const hash = await bcrypt.hash(new_password, 12);
        User.update({
            password: hash,
        }, {
            where: {id: req.user.id},
        });
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;