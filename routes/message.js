const express = require('express');
const router = express.Router();
const {sequelize, Message, User, Post, Recruitment, Applicant, Comment, ReplyComment} = require('../models');
const {Op} = require('sequelize');
const {isLoggedIn} = require("./middlewares");
const Board = require("../models/board");
const moment = require("moment");

router.get('/write', isLoggedIn, async (req, res, next) => {
    const target_nickname = req.query.target_nickname;
    try {
        res.locals.user = req.user;
        res.render("message_write", {
            layout: false,
            target_nickname: target_nickname
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/write', isLoggedIn, async (req, res, next) => {
    const target_nickname = req.body.target_nickname;
    console.log(target_nickname);
    const title = req.body.title;
    const message = req.body.message;
    const sender_id = req.user.id;
    try {
        const user = await User.findOne({
            attributes: ['id'],
            where: {
                nickname: target_nickname
            }
        });

        if (user == null) {
            res.send('<script>alert("존재하지 않는 닉네임입니다."); history.back(); </script>');
        } else {
            await Message.create({
                receiver_id: user.id,
                title: title,
                message: message,
                sender_id: sender_id,
            });

            res.send("<script>window.opener.location.reload(); window.close();</script > ");
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/send', isLoggedIn, async (req, res, next) => {
    const page = req.query.page || 1;
    const user_id = req.user.id;
    const start_message_number = page * 10 - 10;
    try {
        const user = await User.findOne({
            attributes: ['nickname'],
            where: {id: user_id}
        });

        const message_count = await Message.count({
            where: {
                sender_id: user_id,
                is_sender_delete: false,
            }
        });

        const messages = await Message.findAll({
            attributes: ['id', 'message', 'title', 'is_read', 'created_at'],
            where: {
                sender_id: user_id,
                is_sender_delete: false
            },
            include: [{
                model: User,
                attributes: ['nickname'],
                on: {
                    id: {
                        [Op.eq]: sequelize.col('message.receiver_id')
                    }
                }
            }],
            order: [['created_at', 'DESC']],
            offset: start_message_number,
            limit: 10,
        });

        const boards = await Board.findAll({
            attributes: ['id', 'name']
        });

        res.locals.link = 'send';
        res.locals.user = req.user;
        res.render("message_send", {
            layout: `layout_message.ejs`,
            title: user.nickname + '의 발신함',
            messages: messages,
            page: page,
            boards: boards,
            message_count: message_count
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/receive', isLoggedIn, async (req, res, next) => {
    const page = req.query.page || 1;
    const filter = req.query.filter;
    const start_message_number = page * 10 - 10;

    const user_id = req.user.id;
    try {
        const user = await User.findOne({
            attributes: ['nickname'],
            where: {id: user_id}
        });

        const message_count = await Message.count({
            where: {
                receiver_id: user_id,
                is_receiver_delete: false,
            }
        });
        const messages = await Message.findAll({
            attributes: ['id', 'message', 'title', 'is_read', 'created_at'],
            where: {
                receiver_id: user_id,
                is_receiver_delete: false
            },
            include: [{
                model: User,
                attributes: ['nickname'],
                on: {
                    id: {
                        [Op.eq]: sequelize.col('message.sender_id')
                    }
                }
            }],
            order: [['created_at', 'DESC']],
            offset: start_message_number,
            limit: 10,
        });
        const boards = await Board.findAll({
            attributes: ['id', 'name']
        });
        if(filter === "is_not_read"){
            res.locals.link = 'receive_is_not_read';
        }
        else{
            res.locals.link = 'receive';
        }

        res.locals.user = req.user;
        res.render("message_receive", {
            layout: `layout_message.ejs`,
            title: user.nickname + '의 수신함',
            messages: messages,
            filter: filter,
            boards: boards,
            page: page,
            message_count: message_count
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/delete', isLoggedIn, async (req, res, next) => {
    const message_ids = req.body.message_ids;
    const user_id = req.user.id;
    let flag = false;
    try {
        for (let message_id of message_ids) {
            const message = await Message.findOne({
                attributes: ['sender_id', 'receiver_id', 'is_sender_delete', 'is_receiver_delete'],
                where: {id: message_id}
            });

            if (user_id === message.receiver_id && user_id === message.sender_id) {
                await Message.destroy({where: {id: message_id}});
            } else if (user_id === message.receiver_id) {
                await Message.update({is_receiver_delete: true}, {where: {id: message_id}});
                if (message.is_sender_delete === true)
                    await Message.destroy({where: {id: message_id}});
            } else if (user_id === message.sender_id) {
                await Message.update({is_sender_delete: true}, {where: {id: message_id}});
                if (message.is_receiver_delete === true)
                    await Message.destroy({where: {id: message_id}});
            } else {
                flag = true;
            }
        }
        if(flag === true)
            res.send('not creator');
        else
            res.send('success');

    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/:message_id', isLoggedIn, async (req, res, next) => {
    const message_id = req.params.message_id;
    const type = req.query.type;
    const user_id = req.user.id;
    try {

        const message = await Message.findOne({
            attributes: ['id', 'title', 'message', 'is_read', 'created_at', 'is_receiver_delete', 'is_sender_delete', 'sender_id', 'receiver_id'],
            where: {
                id: message_id,

                [Op.or]: [
                    {
                        sender_id:
                            {
                                [Op.eq]: user_id
                            }
                    },
                    {
                        receiver_id:
                            {
                                [Op.eq]: user_id
                            }
                    },
                ]
            },
        });

        const sender_nickname = await User.findOne({
            attributes: ['id', 'nickname', 'profile_image', 'grade'],
            where: {id: message.sender_id}
        });

        await Message.update({is_read: true}, {
            where: {
                receiver_id: user_id,
                id: message_id
            }
        });

        res.locals.user = req.user;
        res.render("message", {
            layout: false,
            title: message.title,
            message: message,
            sender_nickname: sender_nickname,
            type: type
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
})


router.get('/profile/:user_nickname', isLoggedIn, async (req, res, next) => {
    const req_params_user_nickname = req.params.user_nickname;
    const Find_User = await User.findOne({where: {nickname: req_params_user_nickname}});
    const birth =  moment(Find_User.birth_date).format('YYYY-MM-DD')
    const user_id = req.user.id;

    try {
        const MyPostList = await Post.findAll({
            attributes: ['id', 'title', 'created_at', 'is_notice', 'view_count', 'creator_id','board_id',[
                sequelize.literal('(SELECT count(*) FROM `like` WHERE `post_id` = `post`.`id`)'), 'like'
            ]],
            where: {creator_id: req_params_user_nickname},
            include: {
                model: User,
                attributes: ['nickname']
            }
        });
        const MyRecruitmentList = await Recruitment.findAll({
            where: {creator_id: req_params_user_nickname},
            include: {
                model: User,
                attributes: ['nickname']
            }
        });
        const MyApplicantList = await Applicant.findAll({
            where: {user_id: req_params_user_nickname},
            include: {
                model: Recruitment,
                attributes: ['id','title','creator_id','board_id'],
                include: {
                    model: User,
                    attributes: ['nickname']
                }
            }
        });
        const MyCommentList = await Comment.findAll({
            where: {creator_id: req_params_user_nickname},
            include: {
                model: Post,
                attributes: ['id','title','creator_id','board_id'],
                include: {
                    model: User,
                    attributes: ['nickname']
                }
            }
        });
        const MyReplyCommentList = await ReplyComment.findAll({
            where: {creator_id: req_params_user_nickname},
            include: {
                model: Comment,
                include:{
                    model: Post,
                    attributes: ['id','title','creator_id','board_id'],
                    include: {
                        model: User,
                        attributes: ['nickname']
                    }
                }
            }
        });
        res.locals.user = req.user;
        res.render('message_profile', {
            layout: false,
            title: '프로필',
            User: Find_User,
            birth : birth,
            MyPostList : MyPostList,
            MyRecruitmentList : MyRecruitmentList,
            MyApplicantList : MyApplicantList,
            MyCommentList : MyCommentList,
            MyReplyCommentList : MyReplyCommentList
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;