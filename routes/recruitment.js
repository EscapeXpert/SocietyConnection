const express = require('express');
const router = express.Router();
const {sequelize, Recruitment, Board, User, Comment} = require('../models');
const {QueryTypes} = require('sequelize');



router.get('/:recruitment_id', async(req, res, next) => {
    const recruitment_id = req.params.recruitment_id;
    // const user_id = req.user.id;
    const user_id = 'psh3253';
    try{
        const user = await User.findOne({
            attributes:['id', 'nickname'],
            where: {
                id: user_id
            }
        });

        const recruitment = await sequelize.query('SELECT recruitment.id, recruitment.title, recruitment.content, recruitment.view_count, recruitment.deadline, recruitment.is_complete, recruitment.created_at, recruitment.board_id, recruitment.creator_id, (SELECT count(*) FROM `like` WHERE post_id = recruitment.id) `like`, (SELECT count(*) FROM `comment` WHERE post_id = recruitment.id) comment, user.nickname, (SELECT name FROM grade WHERE id = user.grade) `grade` FROM recruitment LEFT JOIN user ON recruitment.creator_Id = user.id WHERE recruitment.id = ' + recruitment_id, {
            type: QueryTypes.SELECT
        });

        const board = await Board.findOne({
            attributes: ['id', 'name', 'board_type'],
            where: {
                id: recruitment[0].board_id
            }
        });

        const is_like = await sequelize.models.Like.findOne({
            where: {
                post_id: recruitment_id,
                user_id: user_id
            }
        });

        await Recruitment.update({view_count: recruitment[0].view_count + 1}, {
            where: {
                id: recruitment_id
            }
        });

        const like_list = await sequelize.query('SELECT user.nickname FROM `like` LEFT JOIN `user` ON user.id = `like`.user_id WHERE post_id = ' + recruitment_id, {
            type: QueryTypes.SELECT
        });

        const comment_list = await Comment.findAll({
            attributes: ['id', 'content', 'created_at', 'creator_id'],
            where: {
                post_id: recruitment_id
            },
            include: {
                model: User,
                attributes: ['nickname']
            }
        });

        res.render('recruitment', {
            recruitment: recruitment[0],
            board: board,
            user: user,
            is_like: is_like,
            like_list: like_list,
            comment_list: comment_list
        });
    } catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;