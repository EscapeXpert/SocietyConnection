const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const {isLoggedIn} = require('./middlewares');
const {sequelize, Post, Board, Recruitment, User, Grade, PostFile} = require('../models');
const {Op} = require('sequelize');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});

const img_upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/post/img/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize: 10 * 1024 * 1024},
});

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

router.post('/upload_img', img_upload.single('img'), async (req, res, next) => {
    const filename = req.file.filename;
    let fileInfo = "";
    fileInfo += "&bNewLine=true";
    fileInfo += "&sFileName=" + filename;
    fileInfo += "&sFileURL=/uploads/post/img/" + filename;
    res.send(fileInfo);
});

router.get('/:board_id/write', csrfProtection, isLoggedIn, async (req, res, next) => {
    const board_id = req.params.board_id;
    const user_id = req.user.id;
    try {
        const boards = await Board.findAll({
            attributes: ['id', 'name']
        });
        const board = await Board.findOne({
            attributes: ['id', 'board_type', 'name', 'min_write_grade'],
            where: {
                id: board_id
            }
        });
        const user = await User.findOne({
            attributes: ['grade'],
            where: {
                id: user_id
            }
        })
        if (user.grade >= board.min_write_grade) {
            res.locals.user = req.user;
            res.render('post_write', {
                board: board,
                boards: boards,
                title: "게시글 쓰기",
                csrfToken: req.csrfToken()
            });
        } else {
            const grade = await Grade.findOne({
                attributes: ['name'],
                where: {
                    id: board.min_write_grade
                }
            });
            res.send('<script>alert("게시글을 작성할 수 있는 권한이 없습니다. 이 게시판은 ' + grade.name + '등급부터 쓸 수 있습니다.");history.back();</script>');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:board_id/write', csrfProtection, isLoggedIn, async (req, res, next) => {
    await file_upload(req, res, async function (err) {
        if (err) {
            res.send('<script>alert("파일당 최대 50MB까지 업로드하실 수 있습니다.");history.back();</script>');
            return;
        }
        const board_id = req.params.board_id;
        const title = req.body.title;
        const content = sanitizeHtml(req.body.ir1, {
            allowedTags: [
                "address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
                "h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
                "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
                "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
                "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
                "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
                "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "img"
            ],
            disallowedTagsMode: 'discard',
            allowedAttributes: {
                a: ['href', 'name', 'target'],
                // We don't currently allow img itself by default, but
                // these attributes would make sense if we did.
                img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
                p: ['style'],
                span: ['style']
            },
// Lots of these won't come up by default because we don't allow them
            selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
// URL schemes we permit
            allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
            allowedSchemesByTag: {},
            allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
            allowProtocolRelative: true,
            enforceHtmlBoundary: false
        });
        const deadline = req.body.deadline;
        const creator_id = req.user.id;
        const files = req.files;
        try {
            const board = await Board.findOne({
                attributes: ['board_type', 'min_write_grade'],
                where: {
                    id: board_id
                }
            });
            const user = await User.findOne({
                attributes: ['grade'],
                where: {
                    id: creator_id
                }
            })
            if (user.grade < board.min_write_grade) {
                const grade = await Grade.findOne({
                    attributes: ['name'],
                    where: {
                        id: board.min_write_grade
                    }
                });
                return res.send('<script>alert("게시글을 작성할 수 있는 권한이 없습니다. 이 게시판은 ' + grade.name + '등급부터 쓸 수 있습니다.");history.back();</script>');
            }
            let post;
            if (board.board_type === 'general') {
                post = await Post.create({
                    title: title,
                    content: content,
                    board_id: board_id,
                    creator_id: creator_id
                });
                for (file of files) {
                    await PostFile.create({
                        post_id: post.id,
                        file_name: file.originalname,
                        file_path: '/' + file.path,
                        board_id: board_id
                    });
                }
            } else if (board.board_type === 'recruitment') {
                const offset = new Date().getTimezoneOffset() * 60000;
                const date = new Date(Date.now() - offset);
                if (deadline < date)
                    return res.send('<script>alert("마감 기한은 현재 시각 이전으로 설정할 수 없습니다.");history.back();</script>');
                else {
                    post = await Recruitment.create({
                        title: title,
                        content: content,
                        board_id: board_id,
                        creator_id: creator_id,
                        deadline: deadline
                    });
                    for (file of files) {
                        await PostFile.create({
                            post_id: post.id,
                            file_name: file.originalname,
                            file_path: '/' + file.path,
                            board_id: board_id
                        });
                    }
                }
            }
            res.redirect(`/post/${post.id}?board_id=${board_id}`);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });
});

router.get('/:board_id', csrfProtection, async (req, res, next) => {
    const board_id = req.params.board_id;
    const sort = req.query.sort || 'created_at';
    const page = req.query.page || 1;
    const keyword = req.query.keyword || '';
    const start_post_number = page * 10 - 10;
    try {
        const board = await Board.findOne({
            attributes: ['id', 'board_type', 'name'],
            where: {
                id: board_id
            }
        });
        if (board.board_type === 'general') {
            let order;
            if (sort === 'like') {
                order = [['is_notice', 'DESC'], [sequelize.literal('`like`'), 'DESC'], ['id', 'DESC']];
            } else {
                order = [['is_notice', 'DESC'], ['id', 'DESC']]
            }
            const posts = await Post.findAll({
                attributes: ['id', 'title', 'created_at', 'is_notice', 'view_count', 'comment_count', [
                    sequelize.literal('(SELECT count(*) FROM `like` WHERE `post_id` = `Post`.`id`)'), 'like'
                ]],
                where: {
                    board_id: board_id,
                    title: {
                        [Op.like]: `%${keyword}%`
                    }
                },
                include: [{
                    model: User,
                    attributes: ['nickname']
                }],
                order: order,
                offset: start_post_number,
                limit: 10,
            });
            const post_count = await Post.count({
                where: {
                    board_id: board_id,
                    title: {
                        [Op.like]: `%${keyword}%`
                    }
                }
            });
            res.locals.user = req.user;
            res.render('board', {
                    title: board.name,
                    board: board,
                    posts: posts,
                    post_count: post_count,
                    page: page,
                    sort: sort,
                    keyword: keyword,
                    csrfToken: req.csrfToken()
                }
            );
        } else if (board.board_type === 'recruitment') {
            let order;
            if (sort === 'deadline') {
                order = [['deadline', 'ASC']];
            } else {
                order = [['created_at', 'DESC']]
            }
            const offset = new Date().getTimezoneOffset() * 60000;
            const date = new Date(Date.now() - offset);
            let recruitments;
            let recruitment_count;

            if (sort === 'created_at') {
                recruitments = await Recruitment.findAll({
                    attributes: ['id', 'title', 'created_at', 'view_count', 'deadline'],
                    where: {
                        board_id: board_id,
                        title: {
                            [Op.like]: `%${keyword}%`
                        }
                    },
                    include: [{
                        model: User,
                        attributes: ['nickname']
                    }],
                    offset: start_post_number,
                    limit: 10,
                    order: order
                });
                recruitment_count = await Recruitment.count({
                    where: {
                        board_id: board_id,
                    }
                });
            } else if (sort === 'deadline') {
                recruitments = await Recruitment.findAll({
                    attributes: ['id', 'title', 'created_at', 'view_count', 'deadline'],
                    where: {
                        board_id: board_id,
                        deadline: {
                            [Op.gt]: date
                        },
                        title: {
                            [Op.like]: `%${keyword}%`
                        }
                    },
                    include: [{
                        model: User,
                        attributes: ['nickname']
                    }],
                    offset: start_post_number,
                    limit: 10,
                    order: order
                });

                recruitment_count = await Recruitment.count({
                    where: {
                        board_id: board_id,
                        deadline: {
                            [Op.gt]: date
                        },
                        title: {
                            [Op.like]: `%${keyword}%`
                        }
                    }
                });
            } else if (sort === 'after_deadline') {
                recruitments = await Recruitment.findAll({
                    attributes: ['id', 'title', 'created_at', 'view_count', 'deadline'],
                    where: {
                        board_id: board_id,
                        deadline: {
                            [Op.lte]: date
                        },
                        title: {
                            [Op.like]: `%${keyword}%`
                        }
                    },
                    include: [{
                        model: User,
                        attributes: ['nickname']
                    }],
                    offset: start_post_number,
                    limit: 10,
                    order: order
                });

                recruitment_count = await Recruitment.count({
                    where: {
                        board_id: board_id,
                        deadline: {
                            [Op.lte]: date
                        },
                        title: {
                            [Op.like]: `%${keyword}%`
                        }
                    }
                });
            }

            res.locals.user = req.user;
            res.render('board', {
                title: board.name,
                board: board,
                posts: recruitments,
                post_count: recruitment_count,
                page: page,
                sort: sort,
                keyword: keyword,
                csrfToken: req.csrfToken()
            });
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;