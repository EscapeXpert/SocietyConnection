const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const Post = require('../models/post');
const Board = require('../models/board');
const passport = require("passport");
const {Op} = require("sequelize");
const cookieParser = require('cookie-parser');
const {Applicant, Recruitment} = require("../models");
const fs = require("fs");
const LocalStrategy = require('passport-local').Strategy;
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const router = express.Router();

router.get('/introduce', csrfProtection, async (req, res, next) => {
    const boards = await Board.findAll({
        attributes: ['id', 'name']
    });
    res.locals.user = req.user;
    res.render('introduce', {
        title: '동아리 소개',
        boards: boards,
        csrfToken: req.csrfToken()
    });
});

router.get('/policy', csrfProtection, async (req, res, next) => {
    const boards = await Board.findAll({
        attributes: ['id', 'name']
    });
    res.locals.user = req.user;
    res.render('privacy_policy', {
        title: '개인정보 처리방침',
        boards: boards,
        csrfToken: req.csrfToken()
    });
});

router.get('/', csrfProtection, async (req, res) => {
    const boards = await Board.findAll({
        attributes: ['id', 'name']
    });
    if (req.cookies.auto_login) {
        if (!req.isAuthenticated()) {
            const exUser = await User.findOne({where: {session_id: req.cookies.auto_login}});
            if (exUser) {
                const offset = new Date().getTimezoneOffset() * 60000;
                const now_date = new Date(Date.now() - offset);
                const session_deadline = exUser.session_deadline;
                if (now_date.getTime() <= session_deadline.getTime()) {
                    const user = {user: exUser};
                    return req.login(user, async (loginError) => {
                        if (loginError) {
                            console.error(loginError);
                            return;
                        }
                        return res.redirect('/');
                    });
                }
            }
        }
    }
    res.locals.user = req.user;
    res.locals.boards = boards;
    const image_files = fs.readdirSync('./public/main_image');
    res.render('main', {
        title: '메인',
        User: req.user,
        boards: boards,
        image_files: image_files,
        csrfToken: req.csrfToken()
    });
});


module.exports = router;