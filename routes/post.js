const express = require('express');
const router = express.Router();
const {sequelize, Post, Board, User, Comment, Like, Recruitment, ReplyComment, Grade} = require('../models');
const {isLoggedIn} = require("./middlewares");

router.post('/:post_id/delete', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const user_id = req.user.id;
    //const user_id = "psh3253"
    try {
        const board = await Board.findOne({
            attributes: ['board_type'],
            where: {
                id: board_id,
            }
        });
        if (board.board_type === 'general') {
            const post = await Post.findOne({
                attributes: ['creator_id'],
                where: {
                    id: post_id,
                    board_id: board_id
                }
            });
            if (post.creator_id === user_id) {
                await Post.destroy({
                    where: {
                        id: post_id,
                        board_id: board_id
                    }
                });
                res.send('success');
            } else {
                res.send('not creator');
            }
        } else if (board.board_type === 'recruitment') {
            const post = await Recruitment.findOne({
                attributes: ['creator_id'],
                where: {
                    id: post_id,
                    board_id: board_id
                }
            });
            if (post.creator_id === user_id) {
                await Recruitment.destroy({
                    where: {
                        id: post_id,
                        board_id: board_id
                    }
                });
                res.send('success');
            } else {
                res.send('not creator');
            }
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:post_id/modify', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.query.board_id;
    const user_id = req.user.id;
    try {
        const board = await Board.findOne({
            attributes: ['id', 'board_type'],
            where: {
                id: board_id
            }
        });
        if (board.board_type === 'general') {
            const post = await Post.findOne({
                attributes: ['id', 'title', 'content', 'creator_id'],
                where: {
                    id: post_id,
                }
            });
            if(user_id === post.creator_id)
            {
                res.render('post_modify', {
                    board: board,
                    post: post
                });
            }
            else {
                res.send('<script> alert("자신의 게시글만 수정할 수 있습니다.");history.back()</script>');
            }
        } else if (board.board_type === 'recruitment') {
            const post = await Recruitment.findOne({
                attributes: ['id', 'title', 'content', 'deadline', 'creator_id', 'created_at'],
                where: {
                    id: post_id,
                }
            });
            if(user_id === post.creator_id)
            {
                res.render('post_modify', {
                    board: board,
                    post: post
                });
            }
            else {
                res.send('<script> alert("자신의 게시글만 수정할 수 있습니다.");history.back()</script>');
            }
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/modify', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const title = req.body.title;
    const content = req.body.content;
    const deadline = req.body.deadline;
    const user_id = req.user.id;

    try {
        const board = await Board.findOne({
            attributes: ['board_type'],
            where: {
                id: board_id
            }
        });
        if (board.board_type === 'general') {
            const post = await Post.findOne({
                attributes: ['creator_id'],
                where: {
                    id: post_id,
                    board_id: board_id
                }
            });
            if (post.creator_id === user_id) {
                await Post.update({
                    title: title,
                    content: content
                }, {
                    where: {
                        id: post_id,
                        board_id: board_id
                    }
                });
                res.redirect(`/post/${post_id}?board_id=${board_id}`);
            } else {
                res.send('<script> alert("자신의 게시글만 수정할 수 있습니다.");history.back()</script>');
            }
        } else if (board.board_type === 'recruitment') {
            const post = await Recruitment.findOne({
                attributes: ['creator_id'],
                where: {
                    id: post_id,
                    board_id: board_id
                }
            });
            if (post.creator_id === user_id) {
                const offset = new Date().getTimezoneOffset() * 60000;
                const date = new Date(Date.now() - offset);
                const max_date = new Date(Date.now() - offset)
                max_date.setFullYear(max_date.getFullYear() + 1)
                if(deadline > date){
                    console.log("Hello");
                }
                if (deadline < date)
                    return res.send('<script>alert("마감 기한은 현재 시각 이전으로 설정할 수 없습니다.");history.back();</script>');
                else {
                    await Recruitment.update({
                        title: title,
                        content: content,
                        deadline: deadline
                    }, {
                        where: {
                            id: post_id,
                            board_id: board_id
                        }
                    });
                }
                res.redirect(`/post/${post_id}?board_id=${board_id}`);
            } else {
                res.send('<script> alert("자신의 게시글만 수정할 수 있습니다.")</script>');
            }
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/set_notice', isLoggedIn, async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/unset_notice', isLoggedIn, async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.get('/:post_id/apply', isLoggedIn, async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/apply', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/like', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const user_id = req.user.id;
    try {
        const is_like = await Like.findOne({
            where: {
                post_id: post_id,
                user_id: user_id,
                board_id: board_id
            }
        });
        if (is_like == null) {
            await Like.create({
                post_id: post_id,
                user_id: user_id,
                board_id: board_id
            });
        } else {
            await Like.destroy({
                where: {
                    post_id: post_id,
                    user_id: user_id,
                    board_id: board_id
                }
            });
        }
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/comment/:comment_id/reply_comment/write', isLoggedIn, async (req, res, next) => {
    const comment_id = req.params.comment_id;
    const reply_comment_content = req.body.reply_comment_content;
    const user_id = req.user.id;
    try {
        await ReplyComment.create({
            content: reply_comment_content,
            comment_id: comment_id,
            creator_id: user_id
        });
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/comment/:comment_id/delete', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const comment_id = req.params.comment_id;
    const user_id = req.user.id;
    try {
        const comment = await Comment.findOne({
            attributes: ['creator_id'],
            where: {
                id: comment_id,
                board_id: board_id,
                post_id: post_id
            }
        });
        if (comment.creator_id === user_id) {
            await Comment.destroy({
                where: {
                    id: comment_id,
                    post_id: post_id,
                    board_id: board_id
                }
            });
            res.send('success');
        } else {
            res.send('not creator');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/comment/write', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const content = req.body.comment_content;
    const user_id = req.user.id;
    try {
        await Comment.create({
            content: content,
            creator_id: user_id,
            post_id: post_id,
            board_id: board_id
        });
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/reply_comment/:reply_comment_id/delete', isLoggedIn, async (req, res, next) => {
    const reply_comment_id = req.params.reply_comment_id;
    const user_id = req.user.id;
    try {
        const reply_comment = await ReplyComment.findOne({
            attributes: ['creator_id'],
            where: {
                id: reply_comment_id,
            }
        });
        if (reply_comment.creator_id === user_id) {
            await ReplyComment.destroy({
                where: {
                    id: reply_comment_id,
                }
            });
            res.send('success');
        } else {
            res.send('not creator');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:post_id', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.query.board_id;
    const user_id = req.user.id;
    try {
        const board = await Board.findOne({
            attributes: ['id', 'name', 'board_type', 'min_read_grade'],
            where: {
                id: board_id
            }
        });

        const user = await User.findOne({
            attributes: ['id', 'nickname', 'grade'],
            where: {
                id: user_id
            }
        });
        if (board.board_type === 'general') {
            const post = await Post.findOne({
                attributes: ['id', 'title', 'content', 'created_at', 'creator_id', 'view_count', 'board_id', [
                    sequelize.literal('(SELECT name FROM grade WHERE id = user.grade)'), 'grade'
                ]],
                where: {
                    id: post_id
                },
                include: {
                    model: User,
                    attributes: ['nickname', 'profile_image']
                }
            });
            const is_like = await sequelize.models.Like.findOne({
                where: {
                    post_id: post_id,
                    user_id: user_id,
                    board_id: board_id
                }
            });
            const like_list = await Like.findAll({
                attributes: [],
                where: {
                    post_id: post_id,
                    board_id: board_id
                },
                include: {
                    model: User,
                    attributes: ['nickname', 'profile_image'],
                }
            });
            const comment_list = await Comment.findAll({
                attributes: ['id', 'content', 'created_at', 'creator_id'],
                where: {
                    post_id: post_id,
                    board_id: board_id,
                },
                include: {
                    model: User,
                    attributes: ['nickname', 'profile_image']
                }
            });
            let reply_comment_map = new Map();
            for (let i = 0; i < comment_list.length; i++) {
                const reply_comment_list = await ReplyComment.findAll({
                    attributes: ['id', 'content', 'created_at', 'creator_id', 'comment_id'],
                    where: {
                        comment_id: comment_list[i].id
                    },
                    include: {
                        model: User,
                        attributes: ['nickname', 'profile_image']
                    }
                });
                reply_comment_map.set(comment_list[i].id, reply_comment_list);
            }
            if (user.grade >= board.min_read_grade || post.creator_id === user_id) {
                await Post.update({view_count: post.view_count + 1}, {
                    where: {
                        id: post_id,
                    }
                });
                res.render('post_general', {
                    post: post,
                    board: board,
                    user: user,
                    is_like: is_like,
                    like_list: like_list,
                    comment_list: comment_list,
                    reply_comment_map: reply_comment_map
                });
            } else {
                const grade = await Grade.findOne({
                    attributes: ['name'],
                    where: {
                        id: board.min_read_grade
                    }
                });
                res.send('<script>alert("게시글을 볼 수 있는 권한이 없습니다. 이 게시판은 ' + grade.name + '등급부터 볼 수 있습니다.");history.back()</script>')
            }
        } else if (board.board_type === 'recruitment') {
            const post = await Recruitment.findOne({
                attributes: ['id', 'title', 'content', 'created_at', 'creator_id', 'view_count', 'deadline', 'board_id', [
                    sequelize.literal('(SELECT name FROM grade WHERE id = user.grade)'), 'grade'
                ]],
                where: {
                    id: post_id
                },
                include: {
                    model: User,
                    attributes: ['nickname', 'profile_image']
                }
            });
            if (user.grade >= board.min_read_grade || post.creator_id === user_id) {
                await Recruitment.update({view_count: post.view_count + 1}, {
                    where: {
                        id: post_id,
                    }
                });
                res.render('post_recruitment', {
                    post: post,
                    board: board,
                    user: user
                });
            } else {
                const grade = await Grade.findOne({
                    attributes: ['name'],
                    where: {
                        id: board.min_read_grade
                    }
                });
                res.send('<script>alert("게시글을 볼 수 있는 권한이 없습니다. 이 게시판은 ' + grade.name + '등급부터 볼 수 있습니다.");history.back()</script>')
            }
        }

    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;