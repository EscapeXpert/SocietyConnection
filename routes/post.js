const express = require('express');
const router = express.Router();
const {sequelize, Post, Board, User, Comment} = require('../models');
const {QueryTypes} = require('sequelize');

router.post('/:post_id/delete', async (req, res, next) => {
    const post_id = req.params.post_id;
    //const user_id = req.user.id;
    const user_id = "psh3253"
    try {
        const post = await Post.findOne({
            attributes: ['creator_id'],
            where: {
                id: post_id
            }
        });
        if (post.creator_id === user_id) {
            await Post.destroy({
                where: {
                    id: post_id
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

router.get('/:post_id/modify', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_type = req.query.board_type;
    //const user_id = req.user.id;
    const user_id = "psh3253";

    try {
        const post = await Post.findOne({
            attributes: ['id', 'title', 'content'],
            where: {
                id: post_id
            }
        });
        res.render('post_modify', {
            board_type: board_type,
            post: post
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/modify', async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_type = req.body.board_type;
    const title = req.body.title;
    const content = req.body.content;
    //const user_id = req.user.id;

    try {
        if (board_type === 'general') {
            await Post.update({
                title: title,
                content: content
            }, {
                where: {
                    id: post_id
                }
            });
            res.redirect(`/post/${post_id}`);
        } else if (board_type === 'recruitment') {

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
    //const user_id = req.user.id;
    const user_id = "psh3253";
    try {
        const is_like = await sequelize.models.Like.findOne({
            where: {
                post_id: post_id,
                user_id: user_id
            }
        });
        if (is_like == null) {
            console.log(post_id);
            await sequelize.models.Like.create({
                post_id: post_id,
                user_id: user_id
            });
        } else {
            await sequelize.models.Like.destroy({
                where: {
                    post_id: post_id,
                    user_id: user_id
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
    const content = req.body.comment_content;
    //const user_id = req.user.id;
    const user_id = "psh3253";
    try {
        await Comment.create({
            content: content,
            creator_id: user_id,
            post_id: post_id
        });
        res.redirect(`/post/${post_id}#comment_list`);

    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:post_id', async (req, res, next) => {
    const post_id = req.params.post_id;
    //const user_id = req.user.id;
    const user_id = 'psh3253';
    try {

        const user = await User.findOne({
            attributes: ['id', 'nickname'],
            where: {
                id: user_id
            }
        });

        const post = await sequelize.query('SELECT post.id, post.title, post.content, post.created_at, post.creator_id, post.view_count, post.board_id, (SELECT count(*) FROM `like` WHERE post_id = post.id) `like`, (SELECT count(*) FROM `comment` WHERE post_id = post.id) comment, user.nickname, (SELECT name FROM grade WHERE id = user.grade) `grade` FROM post LEFT JOIN user ON post.creator_id = user.id WHERE post.id = ' + post_id, {
            type: QueryTypes.SELECT
        });

        const board = await Board.findOne({
            attributes: ['id', 'name', 'board_type'],
            where: {
                id: post[0].board_id
            }
        });

        const is_like = await sequelize.models.Like.findOne({
            where: {
                post_id: post_id,
                user_id: user_id
            }
        });

        await Post.update({view_count: post[0].view_count + 1}, {
            where: {
                id: post_id
            }
        });

        const like_list = await sequelize.query('SELECT user.nickname FROM `like` LEFT JOIN `user` ON user.id = `like`.user_id WHERE post_id = ' + post_id, {
            type: QueryTypes.SELECT
        });

        const comment_list = await Comment.findAll({
            attributes: ['id', 'content', 'created_at', 'creator_id'],
            where: {
                post_id: post_id,
            },
            include: {
                model: User,
                attributes: ['nickname']
            }
        });
        res.render('post', {
            post: post[0],
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