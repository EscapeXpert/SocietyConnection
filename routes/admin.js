const express = require('express');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require("../models/user");
const Grade = require("../models/grade");
const bcrypt = require("bcrypt");
const {Op} = require("sequelize");
const Board = require("../models/board");
const {sequelize} = require("../models");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    const boards = await Board.findAll({
        attributes: ['id', 'name']
    });
    const UserList = await User.findAll({
        where: {
            id: {
                [Op.not]: req.user.id
            }
        },
        order: [['is_delete', 'ASC'], ['grade', 'ASC']]
    });
    const GradeList = await Grade.findAll({
        order: [['id']]
    });
    res.locals.user = req.user;
    const BoardList = await Board.findAll();
    const image_files = fs.readdirSync('./public/main_image');

    res.render('admin', {
        title: 'admin',
        boards:boards,
        UserList : UserList,
        BoardList : BoardList,
        GradeList : GradeList,
        image_files : image_files
    });
});
router.post('/:User_nickname/edit', isLoggedIn, async (req, res, next) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    const User_nickname = req.params.User_nickname;
    const {nickname,grade}= req.body;
    try {
        if (!nickname) {
            return res.send('<script> alert("닉네임을 입력해주세요.");history.back()</script>');
        }
        exUser = await User.findOne({where: {nickname : nickname}});
        if (exUser&&exUser.nickname!==User_nickname) {
            return res.send('<script> alert("이미 존재하는 닉네임입니다.");history.back()</script>');
        }
        await User.update({
            nickname : nickname,
            grade: grade
        }, {
            where: {nickname : User_nickname},
        });
        res.redirect(`/admin`);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/board_create', isLoggedIn, async (req, res, next) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    const {name,min_read_grade,min_write_grade,board_type}= req.body;
    try {
        await Board.create({
            name : name,
            min_read_grade: min_read_grade,
            min_write_grade : min_write_grade,
            board_type : board_type
        });
        res.redirect(`/admin`);
    } catch (error) {
        console.error(error);
    }
});

router.post('/:Board_id/board_edit', isLoggedIn, async (req, res, next) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    const Board_id = req.params.Board_id;
    const {name,min_read_grade,min_write_grade}= req.body;
    try {
        await Board.update({
            name : name,
            min_read_grade: min_read_grade,
            min_write_grade : min_write_grade
        }, {
            where: {id : Board_id},
        });
        res.redirect(`/admin`);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});
router.get('/:Board_id/board_delete', isLoggedIn, async (req, res) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    const Board_id = req.params.Board_id;
    try {
        await Board.destroy({
            where: {id: Board_id}
        });
        res.redirect(`/admin`);
    } catch (error) {
        console.error(error);
    }
});

router.get('/image_delete/:image', isLoggedIn, async (req, res) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    const image = req.params.image;
    fs.unlink('./public/main_image/'+image,(err)=>{ console.log(err);});
    res.redirect(`/admin`);
});

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/main_image/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize: 5 * 1024 * 1024},
});

router.post('/main_img', isLoggedIn, upload.single('img'), async (req, res) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    res.json({url: `/public/main_image/${req.file.filename}`});
});



module.exports = router;