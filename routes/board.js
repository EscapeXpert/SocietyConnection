const express = require('express');
const router = express.Router();
const postRouter = require('../routes/post');
const {sequelize, Post, Board} = require('../models');
const {QueryTypes} = require('sequelize');

router.use('board/1/post', postRouter);

router.get('/:board_id/write', async (req, res, next) => {
    const board_id = req.params.board_id;
    try {
        const board = await Board.findOne({
            attributes: ['id', 'board_type', 'name'],
            where: {
                id: board_id
            }
        });
        res.render('post_write', {
            board: board
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:board_id/write', async (req, res, next) => {
    const board_id = req.params.board_id;
    const board_type = req.body.board_type;
    const title = req.body.title;
    const content = req.body.content;
    const creator_id = 'psh3253';
    //const creator_id = req.user.id;
    try {
        if(board_type === 'general')
        {
            await Post.create({
                title: title,
                content: content,
                board_id: board_id,
                creator_id: creator_id
            });
        }
        res.redirect(`/board/${board_id}`);
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/:board_id', async (req, res, next) => {
    const board_id = req.params.board_id;
    const page = req.query.page;
    try {
        const board = await Board.findOne({
            attributes: ['id', 'board_type', 'name'],
            where: {
                id: board_id
            }
        });
        if (board.board_type === 'general') {
            const posts = await sequelize.query('SELECT post.id, post.title, user.nickname, post.created_at, post.view_count, (SELECT count(*) FROM `like` WHERE post_id = post.id) `like` FROM `post` LEFT JOIN `user` ON post.creator_id = user.id', {
                type: QueryTypes.SELECT
            });
            res.render('board', {
                    board: board,
                    posts: posts,
                }
            );
        } else if (board.board_type === 'recruitment') {

        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;

