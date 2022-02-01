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
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();

router.get('/', async (req, res) => {
    const BoardList = await Board.findAll({
        attributes: ['id','name']
    });
    /*const MyUser = await User.findOne({
        where: {id: 'wodon'},
        include: {
            model: Post,
            where:{creator_id: 'wodon'}
        }
    });
    for(let MyUser_Post of MyUser.Posts){
        console.log(MyUser_Post);
    }*/
    if(req.cookies.auto_login){
        if (!req.isAuthenticated()) {
            const exUser = await User.findOne({where: {session_id: req.cookies.auto_login}});
            if(exUser){
                const offset = new Date().getTimezoneOffset() * 60000;
                const now_date = new Date(Date.now() - offset);
                const session_deadline = exUser.session_deadline;
                if(now_date.getTime()<=session_deadline.getTime()){
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
        }
    }
    res.render('main', {
        title: '메인' ,
        User: req.user,
        BoardList:BoardList
    });
});


module.exports = router;