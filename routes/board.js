const express = require('express');
const router = express.Router();
const postRouter = require('../routes/post');
const { sequelize, Post, User, Board} = require('../models');
const {QueryTypes} = require('sequelize');

router.use('/post', postRouter)

router.get('/:board_id/write', async (req, res) => {
    const board_id = req.params.board_id;
    const board_type = req.query.board_type;
    //const user_id = req.user.id;
    const user_id = "psh3253"

    res.render("post_write", {
        board_type: 'general',
        board_id: board_id
    })
});

router.post('/:board_id/write', async (req, res) => {
    const board_id = req.params.board_id;
    const board_type = req.body.board_type;
    const title = req.body.title;
    const content = req.body.content;
    console.log(board_id)
    console.log(board_type)
    console.log(title)
    console.log(content)
    //const creator_id = req.user.id;
})

router.get('/:board_id', async (req, res, next) => {
    const board_id = req.params.board_id;
    const board_type = req.query.board_type;
    const page = req.query.page;
    try {
        const board = await Board.findOne({
            attributes: ['name'],
            where: {
                id: board_id
            }
        });
        const posts = await sequelize.query("SELECT post.id, post.title, user.nickname, post.created_at, post.view_count FROM post LEFT JOIN user ON post.creator_id = user.id", {
            type: QueryTypes.SELECT
        });
        res.render("board", {
                title: board.name,
                posts: posts
            }
        );
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;

