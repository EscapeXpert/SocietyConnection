const express = require('express');
const router = express.Router();
const {sequelize, Post, Board, Recruitment} = require('../models');
const {QueryTypes} = require('sequelize');

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
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:board_id/write', async (req, res, next) => {
    const board_id = req.params.board_id;
    const title = req.body.title;
    const content = req.body.content;
    const deadline = req.body.deadline;
    const creator_id = 'psh3253';
    //const creator_id = req.user.id;
    try {
        const board = await Board.findOne({
            attributes: ['board_type'],
            where: {
                id: board_id
            }
        });
        console.log(board.board_type)
        if (board.board_type === 'general') {
            await Post.create({
                title: title,
                content: content,
                board_id: board_id,
                creator_id: creator_id
            });
        } else if (board.board_type === 'recruitment') {
            await Recruitment.create({
                title: title,
                content: content,
                board_id: board_id,
                creator_id: creator_id,
                deadline: deadline,
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
    const page = req.query.page || 1;
    const start_post_number = page * 10 - 10;
    try {
        const board = await Board.findOne({
            attributes: ['id', 'board_type', 'name'],
            where: {
                id: board_id
            }
        });
        if (board.board_type === 'general') {
            const posts = await sequelize.query('SELECT post.id, post.title, user.nickname, post.created_at, post.view_count, (SELECT count(*) FROM `like` WHERE post_id = post.id) `like`, (SELECT count(*) FROM comment WHERE post_id = post.id) comment FROM `post` LEFT JOIN `user` ON post.creator_id = user.id LIMIT ' + start_post_number.toString() + ', 10', {
                type: QueryTypes.SELECT
            });
            const post_count = await Post.count({
                where: {
                    board_id: board_id
                }
            });
            res.render('board', {
                    board: board,
                    posts: posts,
                    post_count: post_count,
                    page: page
                }
            );
        } else if (board.board_type === 'recruitment') {
            const recruitments = await sequelize.query('SELECT recruitment.id, recruitment.title, user.nickname, recruitment.created_at, recruitment.view_count, recruitment.deadline, (SELECT count(*) FROM `like` WHERE post_id = recruitment.id) `like`, (SELECT count(*) FROM comment WHERE post_id = recruitment.id) comment FROM `recruitment` LEFT JOIN `user` ON recruitment.creator_id = user.id LIMIT ' + start_post_number.toString() + ', 10', {
                type: QueryTypes.SELECT
            });
            const recruitment_count = await Recruitment.count({
                where: {
                    board_id: board_id
                }
            });
            res.render('board', {
                board: board,
                posts: recruitments,
                post_count: recruitment_count,
                page: page
            });
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;