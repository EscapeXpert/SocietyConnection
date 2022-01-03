const express = require('express');
const router = express.Router();
const postRouter = require('../routes/post');
const {Post, User, Board} = require('../models');

router.use('/post', postRouter)

router.get('/:board_id/write', async (req, res) => {
    const board_id = req.params.board_id;
    const board_type = req.query.board_type;
    const user_id = req.user.id;
});

router.post('/:board_id/write', async (req, res) => {
    const board_id = req.params.board_id;
    const board_type = req.body.board_type;
    const title = req.body.title;
    const content = req.body.content;
    const creator_id = req.user.id;
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
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['nickname']
            },
            where: {
                board_id: board_id
            },
            order: [['id', 'ASC']]
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

