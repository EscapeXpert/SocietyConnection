const express = require('express');
const router = express.Router();
const {sequelize, Post, Board, User} = require('../models');
const {QueryTypes} = require('sequelize');

router.post('/:post_id/delete', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.get('/:post_id/modify', async (req, res) => {
    const post_id = req.params.post_id;
    const board_type = req.query.board_type;
    const user_id = req.user.id;
});

router.post('/:post_id/modify', async (req, res) => {
    const post_id = req.params.post_id;
    const board_type = req.body.board_type;
    const title = req.body.title;
    const content = req.body.content;
    const user_id = req.user.id;
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
        if(is_like == null)
        {
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

})

router.get('/:post_id', async (req, res, next) => {
    const post_id = req.params.post_id;
    //const user_id = req.user.id;
    const user_id = 'psh3253';
    try {
        const post = await sequelize.query('SELECT post.id, post.title, post.content, post.created_at, post.creator_id, post.view_count, post.board_id, (SELECT count(*) FROM `like` WHERE post_id = post.id) `like`, user.nickname, (SELECT name FROM grade WHERE id = user.grade) `grade` FROM post LEFT JOIN user ON post.creator_id = user.id WHERE post.id = ' + post_id, {
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

        const like_users = await sequelize.query('SELECT user.nickname FROM `like` LEFT JOIN `user` ON user.id = `like`.user_id WHERE post_id = ' + post_id, {
            type: QueryTypes.SELECT
        });

        res.render('post', {
            post: post[0],
            board: board,
            user_id: user_id,
            is_like: is_like,
            like_users: like_users
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;