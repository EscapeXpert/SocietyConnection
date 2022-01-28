const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const Board = require('../models/board');
const passport = require("passport");
const {Op} = require("sequelize");
const cookieParser = require('cookie-parser');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();

router.get('/', async (req, res) => {
    const BoardList = await Board.findAll({
        attributes: ['id','name']
    });
    if(req.cookies.auto_login){
        if (!req.isAuthenticated()) {
            const exUser = await User.findOne({where: {session_id: req.cookies.auto_login}});
            const user = {user : exUser};
            return req.login(user,async (loginError) => {
                if (loginError) {
                    console.error(loginError);
                    return;
                }
                return res.redirect('/');
            });
        }
    }
    res.render('main', {
        title: '메인' ,
        User: req.user,
        BoardList:BoardList
    });
});


module.exports = router;