const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn} = require('./middlewares');
const moment = require('moment');
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {Op} = require("sequelize");
const axios = require("axios");
const {sequelize, Message, Post, Board, User, Comment, Recruitment, ReplyComment, Applicant} = require('../models');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
router.get('/:user_nickname', csrfProtection, isLoggedIn, async (req, res, next) => {
    const req_params_user_nickname = req.params.user_nickname;
    const Find_User = await User.findOne({where: {nickname: req_params_user_nickname}});
    const birth = moment(Find_User.birth_date).format('YYYY-MM-DD')
    const user_id = req.user.id;
    const Find_User_Id = Find_User.id;

    try {
        const login_type = await User.findOne({
            where: {id: user_id}
        });

        const not_read_message = await Message.count({
            where: {
                receiver_id: user_id,
                is_read: false,
                is_receiver_delete: false
            }
        });
        const MyPostList = await Post.findAll({
            attributes: ['id', 'title', 'created_at', 'is_notice', 'view_count', 'board_id', 'comment_count', [
                sequelize.literal('(SELECT count(*) FROM `like` WHERE `post_id` = `Post`.`id`)'), 'like'
            ]],
            where: {creator_id: Find_User_Id},
            include: {
                model: User,
                attributes: ['nickname']
            }
        });
        const MyRecruitmentList = await Recruitment.findAll({
            where: {creator_id: Find_User_Id},
            include: {
                model: User,
                attributes: ['nickname']
            }
        });
        const MyApplicantList = await Applicant.findAll({
            where: {user_id: Find_User_Id},
            include: {
                model: Recruitment,
                attributes: ['id', 'title', 'board_id'],
                include: {
                    model: User,
                    attributes: ['nickname']
                }
            }
        });
        const MyCommentList = await Comment.findAll({
            where: {creator_id: Find_User_Id},
            include: {
                model: Post,
                attributes: ['id', 'title', 'board_id'],
                include: {
                    model: User,
                    attributes: ['nickname']
                }
            }
        });
        const MyReplyCommentList = await ReplyComment.findAll({
            where: {creator_id: Find_User_Id},
            include: {
                model: Comment,
                include: {
                    model: Post,
                    attributes: ['id', 'title', 'board_id'],
                    include: {
                        model: User,
                        attributes: ['nickname']
                    }
                }
            }
        });
        res.locals.user = req.user;
        res.render('profile', {
            title: '프로필',
            User: Find_User,
            login_type: login_type.login_type,
            birth: birth,
            not_read_message: not_read_message,
            MyPostList: MyPostList,
            MyRecruitmentList: MyRecruitmentList,
            MyApplicantList: MyApplicantList,
            MyCommentList: MyCommentList,
            MyReplyCommentList: MyReplyCommentList,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/profile/');
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
    res.json({url: `/uploads/profile/${req.file.filename}`});
});

router.get('/:user_nickname/edit', csrfProtection, isLoggedIn, async (req, res) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    res.locals.user = req.user;

    res.render('profile_edit', {
        title: '프로필 수정',
        User: req.user,
        birth: moment(req.user.birth_date).format('YYYY-MM-DD'),
        csrfToken: req.csrfToken()
    });
});

const upload2 = multer();
router.post('/:user_nickname/edit', csrfProtection, isLoggedIn, upload2.none(), async (req, res, next) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    const {sns_id, nickname, name, birth_date, gender, introduce, profile_image, default_profile_image} = req.body;
    let input_profile_image = null;
    let input_birth_date = null;
    if (birth_date)
        input_birth_date = birth_date;
    if (!default_profile_image) {
        input_profile_image = profile_image;
    }
    try {
        if (!nickname) {
            return res.send('<script> alert("닉네임을 입력해주세요.");history.back()</script>');
        }
        const nicknameRules = /^[\w+]{1,30}$/;
        const exUser = await User.findOne({where: {nickname: nickname}});
        if (exUser && exUser.nickname !== req.user.nickname) {
            return res.send('<script> alert("이미 존재하는 닉네임입니다.");history.back()</script>');
        }
        if(!nicknameRules.test(nickname)) {
            return res.send('<script> alert("닉네임은 특수문자 제외 30자까지 가능합니다.");history.back()</script>');
        }

        //프로필 사진 수정후 기존 사진 삭제
        if (req.user.profile_image) {
            fs.unlink('./' + req.user.profile_image, (err) => {
                console.log(err);
            });
        }
        await User.update({
            sns_id: sns_id,
            nickname: nickname,
            name: name,
            birth_date: input_birth_date,
            gender: gender,
            introduce: introduce,
            profile_image: input_profile_image
        }, {
            where: {id: req.user.id},
        });
        res.redirect(`/profile/${nickname}`);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/:user_nickname/change_password', csrfProtection, isLoggedIn, async (req, res, next) => {
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

        if (new_password.search(/\s/) !== -1) {
            return res.send('<script> alert("비밀번호에 공백이 입력되었습니다.");history.back()</script>');
        }
        const PwRules = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,}$/;
        if (!PwRules.test(new_password)) {
            return res.send('<script> alert("비밀번호는 8자리 이상 문자, 숫자, 특수문자로 구성하여야 합니다.");history.back()</script>');
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

router.post('/:user_nickname/account_delete', csrfProtection, isLoggedIn, async (req, res) => {
    const user_nickname = req.params.user_nickname;
    if (user_nickname !== req.user.nickname) {
        return res.send('<script> alert("잘못된 접근입니다.");history.back()</script>');
    }
    try {
        await Message.update({
            is_sender_delete: true
        }, {
            where: {sender_id: req.user.id},
        });
        await Message.destroy({
            where: {
                is_receiver_delete: true,
                is_sender_delete: true
            }
        });
        const user_delete_count = User.findAndCountAll({
            where: {
                is_delete: true
            }
        });
        let delete_count = (await user_delete_count).count;
        let nickname_delete = req.user.nickname + '_delete' + delete_count;
        while (true) {
            nickname_delete = req.user.nickname + '_delete' + delete_count;
            const exUser = await User.findOne({
                where: {nickname: nickname_delete}
            });
            if (!exUser)
                break;
            delete_count++;
        }

        await User.update({
            sns_id: null,
            name: null,
            birth_date: null,
            gender: null,
            introduce: null,
            profile_image: null,
            nickname: nickname_delete,
            is_delete: true
        }, {
            where: {id: req.user.id},
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
        res.send(`success`);
    } catch (error) {
        console.error(error);
    }
});
module.exports = router;