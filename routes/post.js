const express = require('express');
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const {
    sequelize,
    Post,
    Board,
    User,
    Comment,
    Like,
    Recruitment,
    ReplyComment,
    Grade,
    Applicant,
    Message,
    PostFile
} = require('../models');
const {isLoggedIn} = require("./middlewares");
const {Op} = require('sequelize');
const path = require("path");

const file_upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/post/file/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize: 50 * 1024 * 1024},
}).array('files');

router.post('/:post_id/delete', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.body.board_id;
    const user_id = req.user.id;
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
                }
            });
            if (post.creator_id === user_id) {
                await Post.destroy({
                    where: {
                        id: post_id,
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
                }
            });
            if (post.creator_id === user_id) {
                await Recruitment.destroy({
                    where: {
                        id: post_id,
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
        const boards = await Board.findAll({
            attributes: ['id', 'name']
        });
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
            if (user_id === post.creator_id) {
                res.locals.user = req.user;
                res.render('post_modify', {
                    title: '게시글 수정',
                    board: board,
                    boards: boards,
                    post: post
                });
            } else {
                res.send('<script> alert("자신의 게시글만 수정할 수 있습니다.");history.back()</script>');
            }
        } else if (board.board_type === 'recruitment') {
            const post = await Recruitment.findOne({
                attributes: ['id', 'title', 'content', 'deadline', 'creator_id', 'created_at'],
                where: {
                    id: post_id,
                }
            });
            if (user_id === post.creator_id) {
                if (new Date().getTime() < post.deadline.getTime()) {
                    res.locals.user = req.user;
                    res.render('post_modify', {
                        title: '게시글 수정',
                        board: board,
                        boards: boards,
                        post: post
                    });
                } else {
                    res.send('<script> alert("수정 기간이 지났습니다.");window.location.replace("/post/' + post_id + '?board_id=' + board_id + '");</script>');
                }
            } else {
                res.send('<script> alert("자신의 게시글만 수정할 수 있습니다.");history.back()</script>');
            }
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/modify', isLoggedIn, async (req, res, next) => {
    await file_upload(req, res, async function(err) {
        if(err) {
            res.send('<script>alert("파일당 최대 50MB까지 업로드하실 수 있습니다.");history.back();</script>');
            return;
        }
        const post_id = req.params.post_id;
        const board_id = req.body.board_id;
        const title = req.body.title;
        const content = req.body.ir1;
        const deadline = req.body.deadline;
        const user_id = req.user.id;
        const files = req.files;
        try {
            const board = await Board.findOne({
                attributes: ['board_type'],
                where: {
                    id: board_id
                }
            });
            await PostFile.destroy({
                where: {
                    post_id: post_id,
                    board_id: board_id
                }
            });
            for(file of files)
            {
                await PostFile.create({
                    post_id: post_id,
                    file_name: file.originalname,
                    file_path: '/' + file.path,
                    board_id: board_id
                });
            }
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
                    attributes: ['creator_id', 'created_at'],
                    where: {
                        id: post_id,
                        board_id: board_id
                    }
                });
                if (post.creator_id === user_id) {
                    const offset = new Date().getTimezoneOffset() * 60000;
                    const date = new Date(Date.now() - offset);
                    const max_date = new Date(post.created_at - offset);
                    max_date.setFullYear(max_date.getFullYear() + 1)
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
                    res.send('<script> alert("자신의 게시글만 수정할 수 있습니다.");</script>');
                }
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
    });
});

router.post('/:post_id/notice', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
    try {
        const user = await User.findOne({
            attributes: ['grade'],
            where: {
                id: user_id
            }
        });
        if (user.grade === 5) {
            const post = await Post.findOne({
                attributes: ['is_notice'],
                where: {
                    id: post_id
                }
            });
            if (post.is_notice) {
                await Post.update({is_notice: false}, {
                    where: {
                        id: post_id,
                    }
                });
            } else {
                await Post.update({is_notice: true}, {
                    where: {
                        id: post_id,
                    }
                });
            }
            res.send('success');
        } else {
            res.send('not admin');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:post_id/apply/complete', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
    const applicant_id = req.query.applicant_id.split(',');

    try {
        const post = await Recruitment.findOne({
            attributes: ['id', 'title', 'creator_id', 'content', 'board_id'],
            where: {
                id: post_id
            }
        });

        if (post.creator_id === user_id) {
            const applicants = await Applicant.findAll({
                attributes: ['id', 'user_id', 'message', 'is_accepted'],
                where: {
                    id: applicant_id
                },
                include: [{
                    model: User,
                    attributes: ['nickname']
                }]
            });

            res.render('apply_complete', {
                applicants: applicants,
                post: post,
                user_id: user_id
            });
        } else {
            res.send('<script> alert("자신의 게시글만 선발할 수 있습니다.");</script>');
        }

    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/apply/complete', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
    const applicant_id = req.body.applicant_id;

    try {
        const post = await Recruitment.findOne({
            attributes: ['id', 'title', 'content', 'board_id', 'creator_id'],
            where: {
                id: post_id
            }
        });

        if (post.creator_id === user_id) {
            const message = post.title + "에 선발되었습니다"
            const applicants = await Applicant.findAll({
                attributes: ['id', 'user_id', 'message', 'is_accepted'],
                where: {
                    id: applicant_id
                }
            });

            await Recruitment.update({
                is_complete: true
            }, {
                where: {
                    id: post_id
                }
            });

            for (let i of applicant_id) {
                await Applicant.update({is_accepted: true}, {
                    where: {
                        recruitment_id: post_id
                    }
                });
            }

            for (let i of applicants) {
                await Message.create({
                    title: post.title,
                    sender_id: user_id,
                    receiver_id: i.user_id,
                    message: message
                });
            }

            res.send('success');

        } else {
            res.send('not creator');
        }

    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/:post_id/apply', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
    try {
        const post = await Recruitment.findOne({
            attributes: ['id', 'title', 'creator_id', 'content', 'board_id'],
            where: {
                id: post_id
            }
        });

        const already = await Applicant.findOne({
            attributes: ['id', 'user_id', 'recruitment_id'],
            where: {
                user_id: user_id,
                recruitment_id: post_id
            }
        });

        if (already !== null) {
            res.send('<script> alert("신청 완료된 상태입니다.");window.location.replace("/post/' + post_id + '?board_id=' + post.board_id + '");</script>');
        } else {
            res.render('apply', {
                post: post
            });
        }
    } catch (err) {
        console.error(err);
        next(err);
    }

});

router.post('/:post_id/apply', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
    const message = req.body.message;
    try {
        const already = await Applicant.findOne({
            attributes: ['id', 'user_id', 'recruitment_id'],
            where: {
                user_id: user_id,
                recruitment_id: post_id,
                message: message
            }
        });

        const board = await Recruitment.findOne({
            attributes: ['board_id'],
            where: {
                id: post_id
            }
        });

        if (already === null) {
            await Applicant.create({
                recruitment_id: post_id,
                user_id: user_id,
                message: message
            });
            res.send('<script> alert("신청 완료.");window.opener.location.reload();window.close();</script>');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/apply_cancel', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
    const message = req.body.message;
    const board_id = req.body.board_id;
    try {
        const already = await Applicant.findOne({
            attributes: ['id', 'user_id', 'recruitment_id'],
            where: {
                user_id: user_id,
                recruitment_id: post_id
            }
        });
        console.log(already);
        if (already !== null) {
            await Applicant.destroy({
                where: {
                    recruitment_id: post_id,
                    user_id: user_id
                }
            });
            res.send('success');
        } else {
            res.send('no apply');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/like', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
    try {
        const is_like = await Like.findOne({
            where: {
                post_id: post_id,
                user_id: user_id,
            }
        });
        if (is_like == null) {
            await Like.create({
                post_id: post_id,
                user_id: user_id,
            });
        } else {
            await Like.destroy({
                where: {
                    post_id: post_id,
                    user_id: user_id,
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
    const post_id = req.params.post_id;
    try {
        await ReplyComment.create({
            content: reply_comment_content,
            comment_id: comment_id,
            creator_id: user_id
        });
        const post = await Post.findOne({
            attributes: ['comment_count'],
            where: {
                id: post_id
            }
        });
        await Post.update({comment_count: post.comment_count + 1}, {
            where: {
                id: post_id
            }
        });
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:post_id/comment/:comment_id/delete', isLoggedIn, async (req, res, next) => {
        const post_id = req.params.post_id;
        const comment_id = req.params.comment_id;
        const user_id = req.user.id;
        try {
            const comment = await Comment.findOne({
                attributes: ['creator_id'],
                where: {
                    id: comment_id,
                    post_id: post_id
                }
            });
            if (comment.creator_id === user_id) {
                const post = await Post.findOne({
                    attributes: ['comment_count'],
                    where: {
                        id: post_id
                    }
                });
                const reply_comment_count = await ReplyComment.count({
                    where: {
                        comment_id: comment_id
                    }
                });
                await Post.update({comment_count: post.comment_count - (reply_comment_count + 1)}, {
                    where: {
                        id: post_id
                    }
                });
                await Comment.destroy({
                    where: {
                        id: comment_id,
                        post_id: post_id
                    }
                });
                res.send('success');
            } else {
                res.send('not creator');
            }
        } catch
            (err) {
            console.error(err);
            next(err);
        }
    }
)
;

router.post('/:post_id/comment/write', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const content = req.body.comment_content;
    const user_id = req.user.id;
    try {
        await Comment.create({
            content: content,
            creator_id: user_id,
            post_id: post_id
        });
        const post = await Post.findOne({
            attributes: ['comment_count'],
            where: {
                id: post_id
            }
        });
        await Post.update({
            comment_count: post.comment_count + 1
        }, {
            where: {
                id: post_id
            }
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
    const post_id = req.params.post_id;
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
            const post = await Post.findOne({
                attributes: ['comment_count'],
                where: {
                    id: post_id
                }
            });
            await Post.update({comment_count: post.comment_count - 1}, {
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

router.get('/:post_id', isLoggedIn, async (req, res, next) => {
    const post_id = req.params.post_id;
    const board_id = req.query.board_id;
    const user_id = req.user.id;
    try {
        const boards = await Board.findAll({
            attributes: ['id', 'name']
        });
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

        const files = await PostFile.findAll({
            attributes: ['file_name', 'file_path'],
            where: {
                post_id: post_id,
                board_id: board_id
            }
        });
        if (board.board_type === 'general') {
            const post = await Post.findOne({
                attributes: ['id', 'title', 'content', 'is_notice', 'created_at', 'creator_id', 'view_count', 'board_id', [
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
                }
            });
            const like_list = await Like.findAll({
                attributes: [],
                where: {
                    post_id: post_id,
                },
                include: {
                    model: User,
                    attributes: ['nickname', 'profile_image'],
                }
            });
            const comment_list = await Comment.findAll({
                attributes: ['id', 'content', 'created_at', 'creator_id'],
                where: {
                    post_id: post_id
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
                res.locals.user = req.user;
                res.render('post_general', {
                    title: post.title,
                    post: post,
                    board: board,
                    boards: boards,
                    user: user,
                    is_like: is_like,
                    like_list: like_list,
                    comment_list: comment_list,
                    reply_comment_map: reply_comment_map,
                    files: files
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
                attributes: ['id', 'title', 'content', 'created_at', 'creator_id', 'view_count', 'deadline', 'board_id', 'is_complete', [
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
                const already = await Applicant.findOne({
                    attributes: ['id', 'user_id', 'recruitment_id'],
                    where: {
                        user_id: user_id,
                        recruitment_id: post_id
                    }
                });

                const applicants = await Applicant.findAll({
                    attributes: ['id', 'user_id', 'message', 'is_accepted'],
                    where: {
                        recruitment_id: post_id
                    },
                    include: [{
                        model: User,
                        attributes: ['nickname']
                    }]
                });

                const applicant_count = await Applicant.count({
                    where: {
                        recruitment_id: post_id
                    }
                });

                res.locals.user = req.user;
                res.render('post_recruitment', {
                    title: post.title,
                    post: post,
                    board: board,
                    boards: boards,
                    user: user,
                    already: already,
                    applicants: applicants,
                    applicant_count: applicant_count,
                    files: files
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