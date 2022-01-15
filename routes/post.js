const express = require('express');
const router = express.Router();
const {sequelize, Post, Board, User, Comment, Like, Recruitment} = require('../models');

router.post('/:post_id/delete', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    //const user_id = req.user.id;
    const user_id = "psh3253"
    try {
        const board = await Board.findOne({
            attributes: ['board_type'],
            where: {
                id: board_id
            }
        });
        if(board.board_type === 'general')
        {
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
        }
        else if(board.board_type === 'recruitment')
        {
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

router.get('/:post_id/modify', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.query.board_id;
    //const user_id = req.user.id;
    const user_id = "psh3253";

    try {
        const board = await Board.findOne({
            attributes: ['id', 'board_type'],
            where: {
                id: board_id
            }
        });
        const post = await Post.findOne({
            attributes: ['id', 'title', 'content'],
            where: {
                id: post_id,
                board_id: board_id
            }
        });
        res.render('post_modify', {
            board: board,
            post: post
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/modify', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const title = req.body.title;
    const content = req.body.content;
    //const user_id = req.user.id;
    const user_id = "psh3253";

    try {
        const board = await Board.findOne({
            attributes: ['board_type'],
            where: {
                id: board_id
            }
        });
        if (board.board_type === 'general') {
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
        } else if (board.board_type === 'recruitment') {

        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/set_notice', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/unset_notice', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.get('/:post_id/apply', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/apply', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/like', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    //const user_id = req.user.id;
    const user_id = "psh3253";
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

router.post('/:post_id/comment/:comment_id/delete', async (req, res, next) => {
    const post_id = req.params.post_id;
    const comment_id = req.params.comment_id;
    //const user_id = req.user.id;
    const user_id = "psh3253";
    try {
        const comment = await Comment.findOne({
            attributes: ['creator_id'],
            where: {
                id: comment_id
            }
        });
        if (comment.creator_id === user_id) {
            await Comment.destroy({
                where: {
                    id: comment_id
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

router.post('/:post_id/comment/write', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const content = req.body.comment_content;
    //const user_id = req.user.id;
    const user_id = "psh3253";
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

router.get('/:post_id', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.query.board_id;
    //const user_id = req.user.id;
    const user_id = 'psh3253';
    try {
        const board = await Board.findOne({
            attributes: ['id', 'name', 'board_type'],
            where: {
                id: board_id
            }
        });
        const user = await User.findOne({
            attributes: ['id', 'nickname'],
            where: {
                id: user_id
            }
        });
        let post;
        if (board.board_type === 'general') {
            //post = await sequelize.query('SELECT post.id, post.title, post.content, post.created_at, post.creator_id, post.view_count, post.board_id, (SELECT count(*) FROM `like` WHERE post_id = post.id) `like`, (SELECT count(*) FROM `comment` WHERE post_id = post.id) comment, user.nickname, (SELECT name FROM grade WHERE id = user.grade) `grade` FROM post LEFT JOIN user ON post.creator_id = user.id WHERE post.id = ' + post_id, {
            //    type: QueryTypes.SELECT
            //});
            post = await Post.findOne({
                attributes: ['id', 'title', 'content', 'created_at', 'creator_id', 'view_count', 'board_id', [
                    sequelize.literal('(SELECT name FROM grade WHERE id = user.grade)'), 'grade'
                ]],
                where: {
                    id: post_id
                },
                include: {
                    model: User,
                    attributes: ['nickname']
                }
            })
            await Post.update({view_count: post.view_count + 1}, {
                where: {
                    id: post_id,
                }
            });
        } else if (board.board_type === 'recruitment') {

        }
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
                attributes: ['nickname'],
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
                attributes: ['nickname']
            }
        });
        res.render('post', {
            post: post,
            board: board,
            user: user,
            is_like: is_like,
            like_list: like_list,
            comment_list: comment_list
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;