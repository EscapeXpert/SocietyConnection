const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn} = require('./middlewares');
const moment = require('moment');
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {Op} = require("sequelize");
const axios = require("axios");
const {sequelize,Message, Post, Board, User, Comment, Recruitment, ReplyComment, Applicant} = require('../models');


const router = express.Router();


try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}


router.get('/:user_nickname', isLoggedIn, async (req, res) => {
    const Find_User = await User.findOne({where: {nickname: req.params.user_nickname}});
    res.render('profile', {
        title: '프로필',
        User: Find_User,
        req_User: req.user
    });
});

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize: 5 * 1024 * 1024},
});

router.post('/:user_nickname/edit/img', isLoggedIn, upload.single('img'), async (req, res) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    res.json({url: `/img/${req.file.filename}`});
});

router.get('/:user_nickname/edit', isLoggedIn, async (req, res) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    res.render('edit', {
        title: '프로필 수정',
        User: req.user,
        birth: moment(req.user.birth_date).format('YYYY-MM-DD')
    });
});

const upload2 = multer();
router.post('/:user_nickname/edit', isLoggedIn, upload2.none(), async (req, res, next) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    const {sns_id, nickname, name, birth_date, gender, introduce, profile_image} = req.body;

    try {
        if (!nickname) {
            return res.send('<script> alert("닉네임을 입력해주세요.");history.back()</script>');
        }
        exUser = await User.findOne({where: {nickname: nickname}});
        if (exUser && exUser.nickname !== req.user.nickname) {
            return res.send('<script> alert("이미 존재하는 닉네임입니다.");history.back()</script>');
        }
        await User.update({
            sns_id: sns_id,
            nickname: nickname,
            name: name,
            birth_date: birth_date,
            gender: gender,
            introduce: introduce,
            profile_image: profile_image
        }, {
            where: {id: req.user.id},
        });
        res.redirect(`/profile/${nickname}`);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});


router.get('/:user_nickname/change_password', isLoggedIn, async (req, res) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    res.render('change_password', {
        title: '비밀번호 변경',
        user_nickname: user_nickname
    });
});
router.post('/:user_nickname/change_password', isLoggedIn, async (req, res, next) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    const {password, new_password, verify_new_password} = req.body;

    try {
        const result = await bcrypt.compare(password, req.user.password);
        if (!result) {
            return res.send('<script> alert("기존 비밀번호가 일치하지 않습니다.");history.back()</script>');
        }
        if (new_password !== verify_new_password) {
            return res.send('<script> alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");history.back()</script>');
        }
        if (password === new_password) {
            return res.send('<script> alert("새 비밀번호를 기존 비밀번호와 일치하게 설정할 수 없습니다.");history.back()</script>');
        }
        const hash = await bcrypt.hash(new_password, 12);
        await User.update({
            password: hash,
        }, {
            where: {id: req.user.id},
        });
        res.redirect(`/profile/${user_nickname}`);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/:user_nickname/account_delete', isLoggedIn, async (req, res) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    try {
        /*await Message.destroy({
            where: {
                sender_id: user_nickname,
                receiver_id: null
            }
        });*/
        await User.destroy({
            where: {nickname: user_nickname}
        });
        if (req.user.login_type === 'kakao') {
            let unlink = await axios({
                method: 'post',
                url: 'https://kapi.kakao.com/v1/user/unlink',
                headers: {
                    'Authorization': `Bearer ${req.user.accessToken}`
                }
            });
        }
        req.logout();
        if (req.session) {
            req.session.destroy();
        }
        res.redirect(`/`);
    } catch (error) {
        console.error(error);
    }
});

router.get('/:user_nickname/my_activity', isLoggedIn, async (req, res) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    const MyPostList = await Post.findAll({
        attributes: ['id', 'title', 'created_at', 'is_notice', 'view_count', 'creator_id','board_id',[
            sequelize.literal('(SELECT count(*) FROM `like` WHERE `post_id` = `post`.`id`)'), 'like'
        ]],
        where: {creator_id: req.user.id}
    });
    const MyRecruitmentList = await Recruitment.findAll({
        where: {creator_id: req.user.id}
    });
    const MyApplicantList = await Applicant.findAll({
        where: {user_id: req.user.id},
        include: {
            model: Recruitment,
            attributes: ['id','title','creator_id','board_id']
        }
    });
    const MyCommentList = await Comment.findAll({
        where: {creator_id: req.user.id},
        include: {
            model: Post,
            attributes: ['id','title','creator_id','board_id']
        }
    });
    const MyReplyCommentList = await ReplyComment.findAll({
        where: {creator_id: req.user.id},
        include: {
            model: Comment,
            include:{
                model: Post,
                attributes: ['id','title','creator_id','board_id']
            }
        }
    });
    /*
    console.log("MyPostListMyPostListMyPostList",MyPostList);
    console.log("MyRecruitmentListMyRecruitmentListMyRecruitmentList",MyRecruitmentList);
    for(let Applicant of MyApplicantList){
        console.log('Applicant',Applicant);
        console.log('Applicant.Recruitment',Applicant.Recruitment);
    }
    for(let Comment of MyCommentList){
        console.log('Comment.dataValues.Post',Comment.dataValues.Post);
        console.log('Comment.Post',Comment.Post);
    }
    console.log("MyCommentListMyCommentListMyCommentList",MyCommentList);
    for(let ReplyComment of MyReplyCommentList) {
        console.log('ReplyComment', ReplyComment);
    }*/
    res.render('my_activity', {
        title: '나의 활동',
        MyPostList : MyPostList,
        MyRecruitmentList : MyRecruitmentList,
        MyApplicantList : MyApplicantList,
        MyCommentList : MyCommentList,
        MyReplyCommentList : MyReplyCommentList
    });
});



module.exports = router;